import json

from django.test import SimpleTestCase

from apps.diagnostics.scheduler_client import (
    SchedulerAdditionalDataRequired,
    SchedulerClient,
)


class FakeSocket:
    def __init__(self, responses):
        self.responses = list(responses)
        self.sent_payloads = []

    def settimeout(self, value):
        self.timeout = value

    def sendall(self, data):
        self.sent_payloads.append(json.loads(data.decode("utf-8")))

    def recv(self, bufsize):
        if self.responses:
            return self.responses.pop(0)
        return b""

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return None


def make_client(fake_socket):
    return SchedulerClient(
        host="scheduler",
        port=8001,
        timeout_seconds=1,
        connection_factory=lambda address, timeout: fake_socket,
    )


class SchedulerClientTests(SimpleTestCase):
    def test_single_model_request_returns_scheduler_result(self):
        fake_socket = FakeSocket(
            [
                b'{"coronary_disease_probability": 98}\n',
            ]
        )

        result = make_client(fake_socket).analyze(
            model="dxassist-angiography",
            data={"image": "base64-image"},
        )

        self.assertEqual(
            fake_socket.sent_payloads,
            [
                {
                    "model": "dxassist-angiography",
                    "data": {"image": "base64-image"},
                }
            ],
        )
        self.assertEqual(result.result, {"coronary_disease_probability": 98})
        self.assertEqual(result.intermediate_requests, [])

    def test_combined_model_answers_partial_scheduler_prompt(self):
        partial_prompt = {
            "status": "partial",
            "current_model": "dxassist-screening",
            "model_index": 2,
            "total_models": 2,
        }
        final_response = {
            "aggregated": {"coronary_disease_probability": 81.2},
            "combined_model": "dxassist-heartdisease",
        }
        fake_socket = FakeSocket(
            [
                json.dumps(partial_prompt).encode("utf-8") + b"\n",
                json.dumps(final_response).encode("utf-8") + b"\n",
            ]
        )

        result = make_client(fake_socket).analyze(
            model="dxassist-heartdisease",
            data={"image": "base64-image"},
            additional_data={
                "dxassist-screening": {"blood_test": "blood-test-data"},
            },
        )

        self.assertEqual(
            fake_socket.sent_payloads,
            [
                {
                    "model": "dxassist-heartdisease",
                    "data": {"image": "base64-image"},
                },
                {
                    "data": {"blood_test": "blood-test-data"},
                },
            ],
        )
        self.assertEqual(result.result, final_response)
        self.assertEqual(result.intermediate_requests, [partial_prompt])

    def test_combined_model_reports_missing_additional_data(self):
        partial_prompt = {
            "status": "partial",
            "current_model": "dxassist-screening",
        }
        fake_socket = FakeSocket(
            [
                json.dumps(partial_prompt).encode("utf-8") + b"\n",
            ]
        )

        with self.assertRaises(SchedulerAdditionalDataRequired) as context:
            make_client(fake_socket).analyze(
                model="dxassist-heartdisease",
                data={"image": "base64-image"},
            )

        self.assertEqual(context.exception.current_model, "dxassist-screening")
        self.assertEqual(context.exception.partial_request, partial_prompt)

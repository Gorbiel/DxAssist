import json
import socket
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Protocol


class SocketConnection(Protocol):
    def settimeout(self, value: float) -> None: ...

    def sendall(self, data: bytes) -> None: ...

    def recv(self, bufsize: int) -> bytes: ...

    def close(self) -> None: ...

    def __enter__(self) -> SocketConnection: ...

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: object | None,
    ) -> None: ...


ConnectionFactory = Callable[[tuple[str, int], float], SocketConnection]


@dataclass(frozen=True)
class SchedulerAnalysisResult:
    result: dict[str, Any]
    intermediate_requests: list[dict[str, Any]]


class SchedulerClientError(Exception):
    status_code = 502
    default_detail = "Scheduler request failed."

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


class SchedulerUnavailableError(SchedulerClientError):
    status_code = 503
    default_detail = "Scheduler is unavailable."


class SchedulerTimeoutError(SchedulerClientError):
    status_code = 504
    default_detail = "Scheduler request timed out."


class SchedulerProtocolError(SchedulerClientError):
    status_code = 502
    default_detail = "Scheduler returned an invalid response."


class SchedulerAdditionalDataRequired(SchedulerClientError):
    status_code = 400

    def __init__(self, current_model: str, partial_request: dict[str, Any]) -> None:
        self.current_model = current_model
        self.partial_request = partial_request
        super().__init__(
            "Missing additional data for scheduler prompt "
            f"'{current_model}'. Provide it under "
            f"additional_data.{current_model}."
        )


class SchedulerClient:
    def __init__(
        self,
        host: str,
        port: int,
        timeout_seconds: float,
        connection_factory: ConnectionFactory = socket.create_connection,
    ) -> None:
        self.host = host
        self.port = port
        self.timeout_seconds = timeout_seconds
        self.connection_factory = connection_factory

    def analyze(
        self,
        model: str,
        data: dict[str, Any],
        additional_data: dict[str, dict[str, Any]] | None = None,
    ) -> SchedulerAnalysisResult:
        additional_data = additional_data or {}
        intermediate_requests: list[dict[str, Any]] = []

        try:
            with self.connection_factory(
                (self.host, self.port),
                self.timeout_seconds,
            ) as scheduler_socket:
                scheduler_socket.settimeout(self.timeout_seconds)
                self._send_json_line(
                    scheduler_socket,
                    {
                        "model": model,
                        "data": data,
                    },
                )

                while True:
                    response = self._read_json_line(scheduler_socket)

                    if response.get("status") != "partial":
                        return SchedulerAnalysisResult(
                            result=response,
                            intermediate_requests=intermediate_requests,
                        )

                    intermediate_requests.append(response)
                    current_model = response.get("current_model")

                    if not isinstance(current_model, str):
                        raise SchedulerProtocolError(
                            "Scheduler partial response did not include current_model."
                        )

                    if current_model not in additional_data:
                        raise SchedulerAdditionalDataRequired(
                            current_model=current_model,
                            partial_request=response,
                        )

                    self._send_json_line(
                        scheduler_socket,
                        {
                            "data": additional_data[current_model],
                        },
                    )
        except TimeoutError as exc:
            raise SchedulerTimeoutError() from exc
        except OSError as exc:
            raise SchedulerUnavailableError(str(exc)) from exc
        except json.JSONDecodeError as exc:
            raise SchedulerProtocolError(
                "Scheduler response was not valid JSON."
            ) from exc

    @staticmethod
    def _send_json_line(connection: SocketConnection, payload: dict[str, Any]) -> None:
        connection.sendall(json.dumps(payload).encode("utf-8") + b"\n")

    @staticmethod
    def _read_json_line(connection: SocketConnection) -> dict[str, Any]:
        chunks: list[bytes] = []

        while True:
            chunk = connection.recv(4096)
            if not chunk:
                raise SchedulerProtocolError("Scheduler closed the connection.")

            chunks.append(chunk)
            if b"\n" in chunk:
                break

        raw_line = b"".join(chunks).split(b"\n", maxsplit=1)[0]
        response = json.loads(raw_line.decode("utf-8"))

        if not isinstance(response, dict):
            raise SchedulerProtocolError("Scheduler response must be a JSON object.")

        return response

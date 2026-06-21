from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.diagnostics.constants import PROTOTYPE_MODELS
from apps.diagnostics.scheduler_client import (
    SchedulerAdditionalDataRequired,
    SchedulerClient,
    SchedulerClientError,
)
from apps.diagnostics.serializers import AnalysisRequestSerializer


class DiagnosticModelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"models": PROTOTYPE_MODELS})


class AnalysisCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnalysisRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client = SchedulerClient(
            host=settings.SCHEDULER_HOST,
            port=settings.SCHEDULER_PORT,
            timeout_seconds=settings.SCHEDULER_TIMEOUT_SECONDS,
        )

        try:
            scheduler_result = client.analyze(
                model=serializer.validated_data["model"],
                data=serializer.validated_data["data"],
                additional_data=serializer.validated_data["additional_data"],
            )
        except SchedulerAdditionalDataRequired as exc:
            return Response(
                {
                    "detail": exc.detail,
                    "current_model": exc.current_model,
                    "partial_request": exc.partial_request,
                },
                status=exc.status_code,
            )
        except SchedulerClientError as exc:
            return Response(
                {"detail": exc.detail},
                status=exc.status_code,
            )

        return Response(
            {
                "model": serializer.validated_data["model"],
                "status": "completed",
                "result": scheduler_result.result,
                "intermediate_requests": scheduler_result.intermediate_requests,
            },
            status=status.HTTP_200_OK,
        )

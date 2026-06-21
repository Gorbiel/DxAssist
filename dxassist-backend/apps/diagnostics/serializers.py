from typing import Any

from rest_framework import serializers


class AnalysisRequestSerializer(serializers.Serializer):
    model = serializers.CharField()
    data = serializers.JSONField()
    additional_data = serializers.DictField(
        child=serializers.JSONField(),
        required=False,
        default=dict,
    )

    def validate_data(self, value: Any) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise serializers.ValidationError("Expected a JSON object.")
        return value

    def validate_additional_data(self, value: Any) -> dict[str, dict[str, Any]]:
        if not isinstance(value, dict):
            raise serializers.ValidationError("Expected a JSON object.")

        for model, data in value.items():
            if not isinstance(model, str):
                raise serializers.ValidationError("Model keys must be strings.")
            if not isinstance(data, dict):
                raise serializers.ValidationError(
                    f"Additional data for {model} must be a JSON object."
                )

        return value

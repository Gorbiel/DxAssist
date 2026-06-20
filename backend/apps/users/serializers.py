from rest_framework import serializers

from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "password",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "date_joined",
            "is_staff",
            "is_superuser",
            "is_active",
        ]

    def validate(self, attrs):
        if self.instance is None and "password" not in attrs:
            raise serializers.ValidationError({"password": "This field is required."})
        return attrs

    def create(self, validated_data):
        if "password" not in validated_data:
            raise serializers.ValidationError({"password": "This field is required."})
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password is not None:
            raise serializers.ValidationError(
                {"password": "Use the password change endpoint."}
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")

        if user_id is None:
            raise AuthenticationFailed(
                "Token contained no recognizable user identification"
            )

        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        if not user.is_active:
            raise AuthenticationFailed("User is inactive")

        return user

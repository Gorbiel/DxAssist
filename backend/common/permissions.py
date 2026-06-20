from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to staff users."""

    message = "Only DxAssist admins can manage user accounts."

    def has_permission(self, request, view):
        user = request.user

        # Deny if there's no user or the user is not authenticated.
        if not user or not getattr(user, "is_authenticated", False):
            return False

        return bool(getattr(user, "is_staff", False))


class IsSelf(BasePermission):
    """Allow access only when the object is the requesting user."""

    message = "You can't access another user's data"

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Deny if there's no user or the user is not authenticated.
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return obj == user

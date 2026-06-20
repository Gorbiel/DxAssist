from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.models import User
from apps.users.serializers import UserSerializer
from common.permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

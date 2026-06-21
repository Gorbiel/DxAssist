from django.urls import include, path

urlpatterns = [
    path("users/", include("apps.users.urls")),
    path("auth/", include("apps.authentication.urls")),
    path("diagnostics/", include("apps.diagnostics.urls")),
]

from django.urls import path

from apps.diagnostics.views import AnalysisCreateView, DiagnosticModelListView

urlpatterns = [
    path("models/", DiagnosticModelListView.as_view(), name="diagnostic-model-list"),
    path("analyze/", AnalysisCreateView.as_view(), name="diagnostic-analyze"),
]

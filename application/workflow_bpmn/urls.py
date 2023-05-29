from django.urls import path
from django.conf.urls import url
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .views import (
    BpmnWorkflowListCreateView, BpmnWorkflowView, WorkflowRunView, BpmnWorkflowDetailView,
    BpmnWorkflowVersionView, BpmnWorkflowControlView, ConfigResourceListCreateView, ConfigResourceDetailView,
    BpmnWorkflowControlDetailView, WorkflowResponseTaskView, BpmnWorkflowJobListView, BpmnWorkflowJobDetailView,
    BpmnWorkflowJobSummaryView
)
from .services.urls import urlpatterns as service_urls

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('config-resources/', ConfigResourceListCreateView.as_view()),
    path('config-resource/<int:pk>', ConfigResourceDetailView.as_view()),
    path('workflows/', BpmnWorkflowListCreateView.as_view()),
    path('workflow/<int:pk>', BpmnWorkflowView.as_view()),
    path('workflow/<int:pk>/detail', BpmnWorkflowDetailView.as_view()),
    path('workflow/<int:pk>/version', BpmnWorkflowVersionView.as_view()),
    path('workflow/apply', BpmnWorkflowControlView.as_view()),
    path('workflow/<int:workflow_id>/process', BpmnWorkflowControlDetailView.as_view()),
    path('workflow/<str:workflow_key>/jobs', BpmnWorkflowJobListView.as_view()),
    path('workflow/<str:workflow_key>/jobs-summary', BpmnWorkflowJobSummaryView.as_view()),
    path('workflow/<str:workflow__workflow_key>/job/<str:job_key>', BpmnWorkflowJobDetailView.as_view()),
    path('workflow/<int:workflow_id>/<str:task>/<str:ref>/response', WorkflowResponseTaskView.as_view()),
    path('workflow/<str:workflow_key>/<str:task>/<str:ref>/response', WorkflowResponseTaskView.as_view()),
    path('workflow/<str:workflow_key>/message/<str:task>/<str:ref>', WorkflowResponseTaskView.as_view()),
    path('workflow/<int:pk>/run', WorkflowRunView.as_view()),
    path('workflow/<str:workflow_key>/run', WorkflowRunView.as_view()),
    path('workflow/<str:workflow_key>/run', WorkflowRunView.as_view()),
    path('service', (service_urls, "services", "services")),
]

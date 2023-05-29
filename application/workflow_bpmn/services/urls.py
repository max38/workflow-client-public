from django.urls import path
from .views import (
    ServiceInterfaceAppsView, ServiceInterfaceConnectView, ServiceInterfaceConnectListView,
    ServiceInterfaceListModuleView
)

urlpatterns = [
    path('s', ServiceInterfaceAppsView.as_view()),
    path('/<str:service_key>/connections', ServiceInterfaceConnectListView.as_view()),
    path('/<str:service_key>/connect', ServiceInterfaceConnectView.as_view()),
    path('/<str:service_key>/fetch_module', ServiceInterfaceListModuleView.as_view()),
]

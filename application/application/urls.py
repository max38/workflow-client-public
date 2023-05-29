from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from application.views import Logout
from django.conf import settings

urlpatterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    path('admin/', admin.site.urls),
    path('api-auth/', obtain_auth_token),
    path('flow-api/', include('workflow_bpmn.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path(r'^logout/', Logout.as_view()),
    path('', include('frontend.urls')),
]

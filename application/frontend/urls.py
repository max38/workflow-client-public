from django.urls import path, re_path
from .views import HomePageView

urlpatterns = [
    path('', HomePageView.as_view()),
    re_path(r'^.*', HomePageView.as_view())
]

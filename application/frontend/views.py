from django.views.generic.base import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin


# class HomePageView(LoginRequiredMixin, TemplateView):
class HomePageView(TemplateView):

    template_name = "frontend/index.html"

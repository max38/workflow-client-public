from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from ..views import BpmnAuthenticationBase
from ..models import ConnectionService
from ..serializers import ConnectionServiceSerializer
from . import service_apps


class ServiceInterfaceAppsView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def get(self, request):
        return Response(service_apps.services())


class ServiceInterfaceListModuleView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def get(self, request, service_key):
        if request.GET.get("id"):
            con = ConnectionService.objects.get(id=request.GET.get("id"))
            modules = service_apps.fetch_modules(service_key, con)
            return Response(modules)


class ServiceInterfaceConnectListView(generics.ListAPIView, BpmnAuthenticationBase):
    queryset = ConnectionService.objects.all()
    serializer_class = ConnectionServiceSerializer

    def list(self, request, service_key):
        queryset = self.filter_queryset(self.get_queryset()).filter(service=service_key)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ServiceInterfaceConnectView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def post(self, request, service_key):
        if request.GET.get('test'):
            if service_apps.connect(service_key, request.data):
                return Response({})
            else:
                raise AuthenticationFailed()
        else:
            if request.data.get("id"):
                con = ConnectionService.objects.get(id=request.data.get("id"))
                con.name = request.data['name']
                con.config_interface = request.data['config_interface']
                con.modified_by = request.user.username
                con.save()
            else:
                con = ConnectionService.objects.create(
                    name=request.data['name'],
                    service=service_key,
                    config_interface=request.data['config_interface'],
                    modified_by=request.user.username
                )
            conn_data = ConnectionServiceSerializer(con)
            return Response(conn_data.data)

from rest_framework import generics, status, exceptions, filters
from rest_framework.views import APIView
# from rest_framework import status, viewsets
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Max, Count
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .modifier import ModifierAPIView
from .models import (
    BpmnWorkflow, BpmnWorkflowVersion, BpmnWorkflowController, ConfigResource, JobWaitingResponse, Job
)
from .serializers import (
    BpmnWorkflowListCreateSerializer, BpmnWorkflowSerializer, BpmnWorkflowDetailSerializer,
    BpmnWorkflowVersionDetailSerializer, BpmnWorkflowControlSerializer, JobVariableWorkflowSerializer,
    ConfigResourceSerializer, ConfigResourceDetailSerializer, BpmnWorkflowControlDetailSerializer, JobListSerializer,
    JobDetailSerializer
)
from .enum import WorkflowStatusEnum
from .operations.workflow import WorkflowOperation
from .engines import create_job, job_response
from .engines.enum import JobProcessStatusEnum, JobStatusEnum
from .engines.message_events import BoundaryMessageEvent


class BpmnAuthenticationBase:
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]


class ConfigResourceListCreateView(ModifierAPIView, generics.ListCreateAPIView, BpmnAuthenticationBase):
    queryset = ConfigResource.objects.all()
    serializer_class = ConfigResourceSerializer


class ConfigResourceDetailView(ModifierAPIView, generics.RetrieveUpdateAPIView, BpmnAuthenticationBase):
    queryset = ConfigResource.objects.all()
    serializer_class = ConfigResourceDetailSerializer


class BpmnWorkflowListCreateView(ModifierAPIView, generics.ListCreateAPIView, BpmnAuthenticationBase):
    queryset = BpmnWorkflow.objects.all()
    serializer_class = BpmnWorkflowListCreateSerializer


class BpmnWorkflowView(ModifierAPIView, generics.RetrieveUpdateAPIView, BpmnAuthenticationBase):
    queryset = BpmnWorkflow.objects.all()
    serializer_class = BpmnWorkflowSerializer


class BpmnWorkflowDetailView(generics.RetrieveAPIView, BpmnAuthenticationBase):
    queryset = BpmnWorkflow.objects.all()
    serializer_class = BpmnWorkflowDetailSerializer


class BpmnWorkflowVersionView(generics.RetrieveAPIView, BpmnAuthenticationBase):
    queryset = BpmnWorkflowVersion.objects.all()
    serializer_class = BpmnWorkflowVersionDetailSerializer


class BpmnWorkflowControlDetailView(generics.RetrieveAPIView, BpmnAuthenticationBase):
    lookup_url_kwarg = 'workflow_id'
    lookup_field = 'workflow_id'
    serializer_class = BpmnWorkflowControlDetailSerializer
    queryset = BpmnWorkflowController.objects.all()


class BpmnWorkflowControlView(generics.CreateAPIView, BpmnAuthenticationBase):
    serializer_class = BpmnWorkflowControlSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submited_data = serializer.data
        obj_wf = BpmnWorkflow.objects.get(workflow_id=submited_data['workflow'])
        operation = WorkflowOperation(obj_wf, request.user.username)

        status_response = status.HTTP_406_NOT_ACCEPTABLE
        if submited_data['status'] == WorkflowStatusEnum.TERMINATE:
            operation.terminate()
            status_response = status.HTTP_202_ACCEPTED
        elif submited_data['status'] == WorkflowStatusEnum.RUN and submited_data['version']:
            config_resources = ConfigResource.objects.filter(id__in=submited_data['config_resources'])
            version = BpmnWorkflowVersion.objects.get(id=submited_data['version'])
            operation.apply_and_run(version, config_resources)
            status_response = status.HTTP_202_ACCEPTED

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status_response, headers=headers)


class WorkflowRunView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def post(self, request, *args, **kwargs):
        # try:
        if 1:
            if 'workflow_key' in kwargs:
                wf_controller = BpmnWorkflowController.objects.get(workflow__workflow_key=kwargs['workflow_key'])
            else:
                wf_controller = BpmnWorkflowController.objects.get(workflow_id=kwargs['pk'])
            serializer = JobVariableWorkflowSerializer(wf_controller, data=request.data)
            if serializer.is_valid(raise_exception=True):
                return_data = serializer.data
                if serializer.is_valid(raise_exception=True):
                    create_job(
                        wf_controller.workflow_id,
                        serializer.data,
                        request.user.username
                    )
                    # return_data['job_key'] = job_key
        # except:
        #     raise exceptions.NotFound("Workflow id : {} is not applied.".format(kwargs['pk']))

                return Response(return_data, status=status.HTTP_202_ACCEPTED)
        return Response({}, status=status.HTTP_202_ACCEPTED)


class WorkflowResponseTaskView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def post(self, request, *args, **kwargs):
        print("========== test ===========")
        jobw = None
        if 'workflow_key' in kwargs:
            jobw = JobWaitingResponse.objects.filter(
                workflow__workflow_key=kwargs['workflow_key'],
                task=kwargs['task'],
                ref_id=kwargs['ref'],
                is_done=False
            ).first()
        elif 'workflow_id' in kwargs:
            jobw = JobWaitingResponse.objects.filter(
                workflow_id=kwargs['workflow_id'],
                task=kwargs['task'],
                ref_id=kwargs['ref'],
                is_done=False
            ).first()
        if jobw:
            wf_controller = BpmnWorkflowController.objects.get(workflow_id=jobw.workflow)
            job = jobw.job
            # Boundary Message Event
            task_obj = wf_controller.bpmn.state[jobw.task]
            if type(task_obj) == BoundaryMessageEvent:
                job = task_obj.job_interrupting(job, request.user.username)
                jobw.is_done = task_obj.is_cancel_activity
            else:
                jobw.is_done = True
            jobw.save(modified_by=request.user.username)

            if jobw.gateway:
                wf_controller.bpmn.state[job.task].task_selected(job, jobw.task, request.user.username)
                # job.process_status = JobProcessStatusEnum.SUCCESS
                # job.save(modified_by=request.user.username)
                #
                # job.task = jobw.task
                # job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
                # job.save(modified_by=request.user.username)

                JobWaitingResponse.objects.filter(workflow=jobw.workflow, job=job, gateway=jobw.gateway, is_done=False).delete()

            job_response(jobw.workflow_id, job.job_id, jobw.task, request.data, request.user.username)

            return Response(request.data, status=status.HTTP_202_ACCEPTED)
        return Response(request.data, status=status.HTTP_404_NOT_FOUND)


class BpmnWorkflowJobListView(generics.ListAPIView, BpmnAuthenticationBase):
    queryset = Job.objects.all()
    serializer_class = JobListSerializer
    filter_backends = [filters.OrderingFilter]
    ordering = ['-job_id']

    def list(self, request, workflow_key=None):
        queryset = self.filter_queryset(self.get_queryset()).filter(workflow__workflow_key=workflow_key)

        if 'version_id' in request.GET:
            if request.GET['version_id'] == 'latest':
                re = BpmnWorkflowVersion.objects.filter(workflow_id__workflow_key=workflow_key).aggregate(Max('id'))
                queryset = queryset.filter(workflow_version_id=re['id__max'])
            else:
                queryset = queryset.filter(workflow_version_id=request.GET.get('version_id'))

        if 'task' in request.GET:
            if request.GET['task']:
                queryset = queryset.filter(task=request.GET.get('task'))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BpmnWorkflowJobSummaryView(APIView, BpmnAuthenticationBase):

    parser_classes = [JSONParser]

    def get(self, request, workflow_key=None):
        result = {'summary_job': [], 'status_detail': {e[0]: e[1] for e in JobStatusEnum.choices()}}
        queryset = Job.objects.all()

        if 'version_id' in request.GET:
            if request.GET['version_id'] == 'latest':
                re = BpmnWorkflowVersion.objects.filter(workflow_id__workflow_key=workflow_key).aggregate(Max('id'))
                queryset = queryset.filter(workflow_version_id=re['id__max'])
            else:
                queryset = queryset.filter(workflow_version_id=request.GET.get('version_id'))

            result['summary_job'] = queryset.values('task', 'status').annotate(count=Count('task'))

        return Response(result)


class BpmnWorkflowJobDetailView(generics.RetrieveAPIView, BpmnAuthenticationBase):
    queryset = Job.objects.all()
    lookup_field = 'job_key'
    serializer_class = JobDetailSerializer

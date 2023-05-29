import uuid
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import (
    BpmnWorkflow, BpmnWorkflowVersion, BpmnWorkflowController, ConfigResource, Job, JobHistory, ConnectionService
)


class ConfigResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConfigResource
        exclude = ('variable',)


class ConfigResourceDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = ConfigResource
        fields = '__all__'


class BpmnWorkflowListCreateSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        rep = super(BpmnWorkflowListCreateSerializer, self).to_representation(instance)
        del rep['bpmn']
        return rep

    class Meta:
        model = BpmnWorkflow
        fields = '__all__'


class JobListSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display')

    class Meta:
        model = Job
        fields = '__all__'


class JobHistorySerializer(serializers.ModelSerializer):
    process_status = serializers.CharField(source='get_process_status_display')

    class Meta:
        model = JobHistory
        fields = '__all__'


class JobDetailSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display')
    process_status = serializers.CharField(source='get_process_status_display')
    histories = JobHistorySerializer(many=True)

    class Meta:
        model = Job
        fields = '__all__'


class ConnectionServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionService
        fields = '__all__'


class BpmnWorkflowSerializer(serializers.ModelSerializer):

    class Meta:
        model = BpmnWorkflow
        fields = '__all__'


class BpmnWorkflowVersionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BpmnWorkflowVersion
        fields = '__all__'


class BpmnWorkflowVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BpmnWorkflowVersion
        fields = ('id', 'workflow_id', 'version', 'is_active')
        # fields = '__all__'
        # exclude = ('bpmn',)


class BpmnWorkflowDetailSerializer(serializers.ModelSerializer):
    # versions = BpmnWorkflowVersionSerializer(many=True)
    versions = serializers.SerializerMethodField()

    def get_versions(self, instance):
        # versions = instance.versions.all().order_by('-versions')
        versions = BpmnWorkflowVersion.objects.filter(workflow_id=instance).order_by('-version')
        return BpmnWorkflowVersionSerializer(versions, many=True).data

    class Meta:
        model = BpmnWorkflow
        fields = '__all__'
        # exclude = ('bpmn',)


class BpmnWorkflowControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = BpmnWorkflowController
        fields = ('workflow', 'version', 'config_resources', 'status')


class BpmnWorkflowControlDetailSerializer(serializers.ModelSerializer):
    config_resources = ConfigResourceDetailSerializer(many=True)

    class Meta:
        model = BpmnWorkflowController
        fields = ('workflow', 'version', 'config_resources', 'status')


class CustomBaseSerializer:
    def __init__(self, data):
        self.initial_data = data

    def to_representation(self, instance):
        ret = instance
        return ret

    def get_initial(self):
        if hasattr(self, 'initial_data'):
            return self.to_representation(self.initial_data)
        return []

    def is_valid(self, raise_exception=False):
        assert hasattr(self, 'initial_data'), (
            'Cannot call `.is_valid()` as no `data=` keyword argument was '
            'passed when instantiating the serializer instance.'
        )

        if not hasattr(self, '_validated_data'):
            try:
                self._validated_data = self.run_validation(self.initial_data)
            except ValidationError as exc:
                self._validated_data = {}
                self._errors = exc.detail
            else:
                self._errors = {}

        if self._errors and raise_exception:
            raise ValidationError(self.errors)

        return not bool(self._errors)

    @property
    def errors(self):
        if not hasattr(self, '_errors'):
            msg = 'You must call `.is_valid()` before accessing `.errors`.'
            raise AssertionError(msg)
        return self._errors

    @property
    def validated_data(self):
        if not hasattr(self, '_validated_data'):
            msg = 'You must call `.is_valid()` before accessing `.validated_data`.'
            raise AssertionError(msg)
        return self._validated_data

    @property
    def data(self):
        if hasattr(self, 'initial_data') and not hasattr(self, '_validated_data'):
            msg = (
                'When a serializer is passed a `data` keyword argument you '
                'must call `.is_valid()` before attempting to access the '
                'serialized `.data` representation.\n'
                'You should either call `.is_valid()` first, '
                'or access `.initial_data` instead.'
            )
            raise AssertionError(msg)

        if not hasattr(self, '_data'):
            if hasattr(self, '_validated_data') and not getattr(self, '_errors', None):
                self._data = self.to_representation(self.validated_data)
            else:
                self._data = self.get_initial()
        return self._data

    # def run_validation(self, data):
    #     value = {}
    #     value = {}
    #     return value


class JobVariableWorkflowSerializer(CustomBaseSerializer):
    def __init__(self, wf_controller, data):
        super(JobVariableWorkflowSerializer, self).__init__(data)
        self.controller = wf_controller

    # def to_representation(self, instance):
    #     ret = dict()
    #     ret = instance
    #     return ret

    def run_validation(self, data):
        value = dict()
        job_variables = self.controller.bpmn.job_variables
        job_variables['job_key'] = {'require': False, 'default': uuid.uuid4()}

        required_fields = []
        for variable in job_variables:
            if variable in data:
                value[variable] = data[variable]
            elif job_variables[variable]['require']:
                required_fields.append(variable)
            else:
                value[variable] = job_variables[variable]['default']

        if Job.objects.filter(job_key=value['job_key'], workflow=self.controller.workflow).exists():
            raise ValidationError(detail="Duplicate job_key = {} in {}".format(value['job_key'], self.controller.workflow.name))

        if required_fields:
            raise ValidationError(detail="{} {} required".format(",".join(required_fields), 'are' if len(required_fields) > 1 else 'is'))

        return value

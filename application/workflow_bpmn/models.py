# import jsonfield
from django.db import models
from django.utils import timezone
from django_celery_beat.models import PeriodicTask, CrontabSchedule, IntervalSchedule
from picklefield.fields import PickledObjectField
from .modifier import ModifierModel
from .audit import AuditModel
from .enum import HttpMethod, WorkflowStatusEnum
from .engines.enum import JobProcessStatusEnum, JobStatusEnum


class ConfigResource(ModifierModel):
    name = models.CharField(max_length=256)
    variable = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class BpmnWorkflowVersion(models.Model):
    workflow_id = models.ForeignKey('workflow_bpmn.BpmnWorkflow', related_name='versions', db_column='workflow_id', db_index=True, on_delete=models.CASCADE)
    bpmn = models.JSONField()
    note = models.TextField(null=True, blank=True)
    version = models.PositiveIntegerField(default=1)
    modified_by = models.CharField(max_length=128)  # name or identifier of the person or system that modify
    is_active = models.BooleanField(default=False)
    modified_time = models.DateTimeField(default=timezone.now)  # datetime will be change only when data is changed

    def save(self, **kwargs):
        if self.is_active:
            BpmnWorkflowVersion.objects.filter(workflow_id=self.workflow_id).update(is_active=False)
        super(BpmnWorkflowVersion, self).save(**kwargs)

    def __str__(self):
        return "{} (v.{})".format(self.workflow_id.name, self.version)

    class AuditModelSetting:
        changes_only = True
        group_by = 'workflow_id'
        interested_fields = ['version']


@AuditModel(target=BpmnWorkflowVersion)
class BpmnWorkflow(ModifierModel):
    workflow_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    bpmn = models.JSONField()
    workflow_key = models.CharField(max_length=255, unique=True, db_index=True)
    note = models.TextField(null=True, blank=True)
    version = models.PositiveIntegerField(default=0, help_text='Next Public Version')
    create_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class BpmnWorkflowController(ModifierModel):
    workflow = models.ForeignKey(BpmnWorkflow, on_delete=models.CASCADE)
    version = models.ForeignKey(BpmnWorkflowVersion, on_delete=models.CASCADE, null=True, blank=True)
    bpmn = PickledObjectField()
    config_resources = models.ManyToManyField(ConfigResource, null=True, blank=True)
    # bpmn = models.JSONField()
    # job_variable = models.JSONField()
    status = models.CharField(max_length=10, choices=WorkflowStatusEnum.choices(), db_index=True, default=WorkflowStatusEnum.PENDING)

    def run_flow(self, modified_by):
        self.status = WorkflowStatusEnum.RUN
        self.bpmn.run_flow(self)
        self.save(modified_by=modified_by)


class Service(ModifierModel):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    url = models.TextField(null=True)
    method_type = models.TextField(choices=HttpMethod.choices())
    input_interface = models.JSONField(null=True, blank=True)
    output_interface = models.JSONField(null=True, blank=True)
    header = models.JSONField(null=True, blank=True)
    is_asynchronous = models.BooleanField(default=False)


class ConnectionService(ModifierModel):
    name = models.CharField(max_length=255)
    service = models.CharField(db_index=True, max_length=255)
    config_interface = models.JSONField(null=True, blank=True)
    data_interface = models.JSONField(null=True, blank=True)


class JobHistory(models.Model):
    job_id = models.ForeignKey('workflow_bpmn.Job', db_column='job_id', db_index=True, on_delete=models.CASCADE, related_name='histories')
    workflow = models.ForeignKey(BpmnWorkflow, on_delete=models.CASCADE, name='workflow')
    variable = models.JSONField(null=True, blank=True)
    task = models.CharField(max_length=255, db_index=True)
    process_status = models.PositiveSmallIntegerField(
        default=JobProcessStatusEnum.WAITING_TO_PROCESS, choices=JobProcessStatusEnum.choices()
    )
    modified_by = models.CharField(max_length=128)  # name or identifier of the person or system that modify
    modified_time = models.DateTimeField(default=timezone.now)  # datetime will be change only when data is changed

    def __str__(self):
        return "Job ID: {} Task {}".format(self.job_id_id, self.task)

    class Meta:
        ordering = ['-modified_time']

    class AuditModelSetting:
        changes_only = True
        group_by = 'job_id'
        interested_fields = ['task', 'process_status']


@AuditModel(target=JobHistory)
class Job(ModifierModel):
    job_id = models.AutoField(primary_key=True)
    job_key = models.CharField(max_length=255, db_index=True)
    job_root = models.ForeignKey('Job', on_delete=models.CASCADE, related_name='root_job', null=True, blank=True)
    job_parent = models.ForeignKey('Job', on_delete=models.CASCADE, related_name='parent_job', null=True, blank=True)
    workflow = models.ForeignKey(BpmnWorkflow, models.CASCADE, name='workflow')
    workflow_version = models.ForeignKey(BpmnWorkflowVersion, models.CASCADE, name='workflow_version')
    task = models.CharField(max_length=255, db_index=True)
    variable = models.JSONField(null=True, blank=True)
    create_date = models.DateTimeField(auto_now_add=True)
    process_status = models.PositiveSmallIntegerField(
        default=JobProcessStatusEnum.WAITING_TO_PROCESS, choices=JobProcessStatusEnum.choices()
    )
    status = models.PositiveSmallIntegerField(
        default=JobStatusEnum.WAITING_TO_PROCESS, choices=JobStatusEnum.choices()
    )

    def __str__(self):
        return "Job ID : {} on : {}".format(self.job_id, self.workflow.name)

    class Meta:
        unique_together = [['workflow', 'job_key']]


class JobWaitingResponse(ModifierModel):
    workflow = models.ForeignKey(BpmnWorkflow, models.CASCADE, name='workflow')
    job = models.ForeignKey('Job', on_delete=models.CASCADE)
    task = models.CharField(max_length=255, db_index=True)
    ref_id = models.CharField(max_length=255, db_index=True)
    gateway = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    is_done = models.BooleanField(default=False)


class BpmnWorkflowPeriodic(PeriodicTask):
    workflow = models.ForeignKey(BpmnWorkflowController, on_delete=models.CASCADE)
    job = models.ForeignKey('workflow_bpmn.Job', null=True, blank=True, db_index=True, on_delete=models.CASCADE)


# class ServiceConnection(ModifierModel):
#     pass

# class ServiceInterface(ModifierModel):
#     name = models.CharField(max_length=255, db_index=True)
#     logo = models.ImageField(upload_to="services/logo", null=True, blank=True)
#     host = models.URLField()
#
#
# class ServicePathModule(ModifierModel):
#     service = models.ForeignKey(ServiceInterface, on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)
#     description = models.TextField(null=True, blank=True)
#     path = models.CharField(max_length=255)
#     definition = models.JSONField()

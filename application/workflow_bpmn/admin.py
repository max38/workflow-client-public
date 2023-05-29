from django.contrib import admin
from .modifier import ModifierDjangoAdmin
from .models import (
    BpmnWorkflow, BpmnWorkflowVersion, BpmnWorkflowController, Job, JobHistory, JobWaitingResponse,
    BpmnWorkflowPeriodic, ConnectionService
)
from .engines import next as runjob_next


class BpmnWorkflowVersionInline(admin.TabularInline):
    model = BpmnWorkflowVersion
    readonly_fields = ('version', 'note', 'modified_by', 'modified_time')
    fields = ('version', 'note', 'is_active', 'modified_by', 'modified_time')
    extra = 0
    max_num = 0


@admin.register(BpmnWorkflow)
class BpmnWorkflowAdmin(ModifierDjangoAdmin):
    list_display = ('workflow_id', 'workflow_key', 'name', 'version', 'modified_by', 'modified_time')
    list_display_links = ('workflow_id', 'name')
    inlines = [BpmnWorkflowVersionInline,]


@admin.register(BpmnWorkflowVersion)
class BpmnWorkflowVersion(admin.ModelAdmin):
    list_display = ('workflow_id', 'version', 'is_active', 'modified_by', 'modified_time')
    list_display_links = ('workflow_id', )
    list_filter = ('workflow_id', 'modified_by')
    readonly_fields = ('workflow_id', 'note', 'version', 'modified_by', 'modified_time')


@admin.register(BpmnWorkflowController)
class BpmnWorkflowControllerAdmin(ModifierDjangoAdmin):
    list_display = ('workflow', 'version', 'status', 'get_config_resources')
    readonly_fields = ('workflow', 'version', 'bpmn')

    def get_config_resources(self, obj):
        return " ,  ".join([p.name for p in obj.config_resources.all()])


class JobHistoryInline(admin.TabularInline):
    model = JobHistory
    readonly_fields = ('job_id', 'workflow', 'variable', 'task', 'process_status', 'modified_by', 'modified_time')
    extra = 0
    max_num = 0

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Job)
class JobAdmin(ModifierDjangoAdmin):
    list_display = ('job_id', 'workflow_version', 'job_key', 'task', 'process_status', 'status', 'modified_by', 'modified_time', 'create_date')
    inlines = [JobHistoryInline, ]

    actions = ['process']

    def process(self, request, queryset):
        for obj in queryset:
            runjob_next(obj)

    process.short_description = "Process Job"


@admin.register(JobHistory)
class JobHistoryAdmin(ModifierDjangoAdmin):
    list_display = ('job_id', 'workflow', 'task', 'process_status', 'modified_by', 'modified_time')
    readonly_fields = ('job_id', 'workflow', 'variable', 'task', 'modified_by', 'modified_time')


@admin.register(ConnectionService)
class ConnectionServiceAdmin(ModifierDjangoAdmin):
    list_display = ('name', 'service', 'modified_by', 'modified_time')


@admin.register(JobWaitingResponse)
class JobWaitingResponseAdmin(ModifierDjangoAdmin):
    list_display = ('workflow', 'job', 'task', 'ref_id', 'gateway', 'is_done')
    list_filter = ('workflow', 'task', 'is_done')


@admin.register(BpmnWorkflowPeriodic)
class BpmnWorkflowPeriodicAdmin(admin.ModelAdmin):
    list_display = ('name', 'workflow', 'job', 'interval', 'crontab')
    list_filter = ('workflow', )

from django_celery_beat.models import CrontabSchedule, IntervalSchedule
from ..models import BpmnWorkflowPeriodic
from .flow import FlowObject
from .enum import JobStatusEnum, JobProcessStatusEnum
from .IOInterface import MapperInterface


class Event(FlowObject):
    def __init__(self, attrs):
        super().__init__(attrs)

    def job_ref(self, job, variable):
        return job.job_key


class BoundaryEvent(Event):
    _attached_ref = None

    def __init__(self, attrs, attached_ref):
        super().__init__(attrs)
        self._attached_ref = attached_ref
        self.__is_cancel_activity = True

        if attrs:
            if 'cancelActivity' in attrs:
                self.__is_cancel_activity = not (attrs.get('cancelActivity') == 'false')

    @property
    def attached_ref(self):
        return self._attached_ref

    @property
    def is_cancel_activity(self):
        return self.__is_cancel_activity

    def job_interrupting(self, job, modified_by="Flow"):
        if self.attached_ref and job.task == self.attached_ref.id:
            if not self.is_cancel_activity:
                job = self.clone_job(job)
            job.task = self.id
            job.process_status = JobProcessStatusEnum.WAITING_TO_PROCESS
            job.save(modified_by=modified_by)
        return job

    def after_task_processing(self, job):
        pass


class StartEvent(Event):
    def __init__(self, attrs):
        super().__init__(attrs)

    def process(self, job):
        job.status = JobStatusEnum.PROCESSING
        job.save(modified_by="Flow")
        self._process_success(job)


class StartTimerEvent(StartEvent):
    def __init__(self, attrs):
        super().__init__(attrs)

        if attrs.get("job_mapping_type") and attrs.get("job_mapping_info"):
            self._job_variable_interface = MapperInterface(
                attrs['job_mapping_type'], attrs['job_mapping_info']
            )

    def create_job_variable(self):
        job_variable = {}

        if self._job_variable_interface:
            job_variable = self._job_variable_interface.map(job_variable, "job")

        return job_variable

    def run_flow(self, wf_controller):
        super().run_flow(wf_controller)

        attrs = self.attrs

        if attrs.get("time_def_type") and attrs.get("time_def_value"):
            time_def_type = int(attrs.get("time_def_type", 0))
            time_def_value = attrs.get("time_def_value")

            if time_def_type == 0:  # Crontab
                crontab_value = time_def_value.split(" ")
                crontab_obj = CrontabSchedule.objects.create(
                    minute=crontab_value[0],
                    hour=crontab_value[1],
                    day_of_week=crontab_value[2],
                    day_of_month=crontab_value[3],
                    month_of_year=crontab_value[4],
                )
                BpmnWorkflowPeriodic.objects.create(
                    workflow=wf_controller,
                    name="{}".format(""),
                    task="workflow_bpmn.engines.periodic_start_flow",
                    args='[{}, "{}"]'.format(wf_controller.id, self.id),
                    crontab=crontab_obj
                )
            elif time_def_type == 1:  # Interval
                interval_value = time_def_value.split("-")
                interval_obj = IntervalSchedule.objects.create(
                    every=interval_value[0],
                    period=interval_value[1],
                )
                BpmnWorkflowPeriodic.objects.create(
                    workflow=wf_controller,
                    name="{} - {}".format(wf_controller.workflow.name, self.id),
                    task="workflow_bpmn.engines.periodic_start_flow",
                    args='[{}, "{}"]'.format(wf_controller.id, self.id),
                    interval=interval_obj
                )

        self.__wf_controller = wf_controller


class EndEvent(Event):
    def __init__(self, attrs):
        super().__init__(attrs)

    def process(self, job):
        # job.status = JobStatusEnum.COMPLETE
        # job.save(modified_by="Flow")
        self._process_success(job)


class BoundaryErrorEvent(BoundaryEvent):
    pass

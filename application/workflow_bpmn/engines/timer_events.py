import json
from datetime import datetime
from django.core.serializers.json import DjangoJSONEncoder
from django_celery_beat.models import CrontabSchedule, IntervalSchedule
from ..models import BpmnWorkflowPeriodic
from .events import Event, BoundaryEvent
from .enum import JobStatusEnum, JobProcessStatusEnum
from .IOInterface import MapperInterface
from ..models import JobWaitingResponse


class TimerEvent(Event):
    interval_obj = None
    time_def_type = None

    def __init__(self, attrs):
        super().__init__(attrs)

        if attrs.get("job_mapping_type") and attrs.get("job_mapping_info"):
            self._job_variable_interface = MapperInterface(
                attrs['job_mapping_type'], attrs['job_mapping_info']
            )

    def run_flow(self, wf_controller):
        super().run_flow(wf_controller)

        attrs = self.attrs

        if attrs.get("time_def_type") and attrs.get("time_def_value"):
            self.time_def_type = int(attrs.get("time_def_type", 0))
            time_def_value = attrs.get("time_def_value")

            if self.time_def_type == 0:  # Crontab
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
                    name="{} - {}".format(wf_controller.workflow.name, self.id),
                    task="workflow_bpmn.engines.periodic_task",
                    args='[{}, "{}"]'.format(wf_controller.id, self.id),
                    crontab=crontab_obj
                )

            elif self.time_def_type == 1:  # Interval
                interval_value = time_def_value.split("-")
                self.interval_obj = IntervalSchedule.objects.create(
                    every=interval_value[0],
                    period=interval_value[1],
                )

    def regis_periodic_job(self, job):
        if self.time_def_type == 1:
            BpmnWorkflowPeriodic.objects.create(
                workflow=self.wf_controller,
                job=job,
                name="{} - {} JOB: {}".format(self.wf_controller.workflow.name, self.id, job.job_id),
                task="workflow_bpmn.engines.periodic_job",
                args='[{}, "{}", {}]'.format(self.wf_controller.id, self.id, job.job_id),
                one_off=True,
                # start_time=datetime.utcnow(),
                interval=self.interval_obj
            )

    def pre_process_gateway(self, job):
        if self.time_def_type == 1:
            self.regis_periodic_job(job)

    def process(self, job):
        job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
        job.save(modified_by="Flow")

        if self.interval_obj and self.time_def_type == 1:
            self.regis_periodic_job(job)

    def process_response(self, job, response_data, modified_by="Flow"):
        if self._job_variable_interface:
            response_data = self._job_variable_interface.map(job.variable, "job")
            response_data = json.loads(json.dumps(
                response_data,
                sort_keys=True,
                indent=1,
                cls=DjangoJSONEncoder
            ))
        else:
            response_data = {}
        job.variable.update(response_data)
        self._process_success(job, modified_by)


class IntermediateCatchTimerEvent(TimerEvent):
    pass


class BoundaryTimerEvent(BoundaryEvent, TimerEvent):
    def process(self, job):
        self._process_success(job, modified_by="BoundaryTimerEvent")

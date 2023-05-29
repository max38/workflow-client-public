import json
from datetime import datetime
from django.core.serializers.json import DjangoJSONEncoder
from django_celery_beat.models import CrontabSchedule, IntervalSchedule
from ..models import BpmnWorkflowPeriodic
from .events import Event, BoundaryEvent
from .enum import JobStatusEnum, JobProcessStatusEnum
from .IOInterface import MapperInterface
from .exceptions import InterruptJobWaitingResponseRegister, InterruptJobPreProcessBoundary


class ConditionalEvent(Event):
    def __init__(self, attrs):
        super().__init__(attrs)

        self._condition_script_type = None
        self._condition_script_info = None
        self._check_after_processing = False

        if 'condition_script_type' in attrs and attrs['condition_script_type'] and attrs['condition_script_type'] != "-":
            self._condition_script_type = attrs['condition_script_type']
            if 'condition_script_info' in attrs and attrs['condition_script_info']:
                self._condition_script_info = attrs['condition_script_info']

        if 'check_after_processing' in attrs and attrs['check_after_processing']:
            self._check_after_processing = attrs['check_after_processing'] == 'true'

    def process(self, job):
        if self._process_result(job):
            self._process_success(job)

    def _process_result(self, job):
        if self._condition_script_type and self._condition_script_info:
            if self._condition_script_type == "python":
                exec(self._condition_script_info)
                return eval("condition(job.variable)")
        return False

    def pre_process_gateway(self, job):
        if self._process_result(job):
            self._process_success(job)
            raise InterruptJobWaitingResponseRegister(job)

    def after_task_processing(self, job):
        pass


class IntermediateCatchConditionalEvent(ConditionalEvent):
    pass


class BoundaryConditionalEvent(BoundaryEvent, ConditionalEvent):

    def pre_process_boundary(self, job):
        if not self._check_after_processing:
            if self._process_result(job):
                job = self.job_interrupting(job, modified_by=self.id)
                self._process_success(job)

                if self.is_cancel_activity:
                    raise InterruptJobPreProcessBoundary(job)

    def after_task_processing(self, job):
        if self._check_after_processing:
            if self._process_result(job):
                job = self.job_interrupting(job, modified_by=self.id)
                self._process_success(job)

                if self.is_cancel_activity:
                    raise InterruptJobPreProcessBoundary(job)

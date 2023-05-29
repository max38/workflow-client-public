import json
import requests
from .enum import JobProcessStatusEnum
from .activity import Activity
from .IOInterface import MapperInterface
from ..models import JobWaitingResponse
from .events import BoundaryErrorEvent
from .timer_events import BoundaryTimerEvent
from .message_events import BoundaryMessageEvent
from .conditional_events import BoundaryConditionalEvent
from .exceptions import InterruptJobPreProcessBoundary
from . import next as run_next


class Task(Activity):

    def __init__(self, attrs):
        super().__init__(attrs)

        self._boundary_events = []

        self._input_interface = None
        if 'input_mapping_info' in attrs and attrs['input_mapping_type']:
            self._input_interface = MapperInterface(
                attrs['input_mapping_type'], attrs['input_mapping_info']
            )

        self._output_interface = None
        if 'output_mapping_info' in attrs and attrs['output_mapping_type']:
            self._output_interface = MapperInterface(
                attrs['output_mapping_type'], attrs['output_mapping_info']
            )

    def process(self, job):
        if self._pre_process(job):
            self._process_success(job)

    def _process_success(self, job, modified_by="Flow"):
        try:
            for boundary_event in self._boundary_events:
                if type(boundary_event) == BoundaryMessageEvent:
                    JobWaitingResponse.objects.filter(job=job, task=boundary_event.id).delete()
                boundary_event.after_task_processing(job)

            super()._process_success(job, modified_by)
        except InterruptJobPreProcessBoundary as e:  # Break
            pass

    def _pre_process(self, job):
        try:
            for boundary_event in self._boundary_events:
                if type(boundary_event) == BoundaryMessageEvent:
                    boundary_event.regis_waiting_message_job(job, boundary_event.id)
                elif type(boundary_event) == BoundaryTimerEvent:
                    boundary_event.regis_periodic_job(job)
                elif type(boundary_event) == BoundaryConditionalEvent:
                    boundary_event.pre_process_boundary(job)
        except InterruptJobPreProcessBoundary as e:  # Break Register boundary event
            return False
        return True

    def _process_error(self, job, reason, modified_by="Flow"):
        super()._process_error(job, reason, modified_by)

        for boundary_event in self._boundary_events:
            if type(boundary_event) == BoundaryErrorEvent:
                job.task = boundary_event.id
                job.process_status = JobProcessStatusEnum.WAITING_TO_PROCESS
                job.save(modified_by=modified_by)
                run_next(job)

    def register_boundary_event(self, event):
        self._boundary_events.append(event)


class TaskRestApi(Task):
    def __init__(self, attrs):
        super().__init__(attrs)

        self.__service_method = attrs.get('service_method', '').lower()

        self.__service_headers = attrs.get('service_headers')
        if self.__service_headers:
            self.__service_headers = json.loads(self.__service_headers)

        self.__service_url = attrs.get('service_url')
        self.__asynchronous = attrs.get('service_asynchronous', False)

        if self.__asynchronous:
            self.__async_method = int(attrs.get('service_async_mapmethod', 0))
            self.__async_mapping_info = attrs.get("service_async_mappingInfo", "def reference(job_key, job_data): return job_key")

    def __asynchronous_job_ref(self, job, response):
        if self.__async_method == 0:
            return str(job.job_key)
        elif self.__async_method == 1:
            return str(job.job_id)
        elif self.__async_method == 2:
            exec(self.__async_mapping_info)
            return str(eval("reference(job.job_key, response)"))
        return str(job.job_id)

    def process_response(self, job, response_data, modified_by="Flow"):
        try:
            output_data = self._output_interface.map(response_data)
        except:
            output_data = {}
        job.variable.update(output_data)
        self._process_success(job, modified_by)

    def process(self, job):
        if self._pre_process(job):
            try:
                input_data = self._input_interface.map(job.variable)
                if self.__service_method and self.__service_url:
                    request_header = {}

                    if self.__service_headers:
                        for header in self.__service_headers:
                            request_header[header['key']] = header['value']

                    request_header['Content-Type'] = 'application/json'
                    r = requests.request(self.__service_method, self.__service_url, data=json.dumps(input_data), headers=request_header)

                    if self.__asynchronous:
                        ref_id = self.__asynchronous_job_ref(job, r.json())
                        print("Job = " + str(job.job_id) + " REF = " + ref_id + " " + job.task + " ----> WAITING_RESPONSE")
                        job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
                        job.save(modified_by="Flow")

                        JobWaitingResponse.objects.create(
                            workflow=job.workflow,
                            job=job,
                            task=job.task,
                            ref_id=ref_id,
                            modified_by="Flow"
                        )
                    else:
                        try:
                            output_data = self._output_interface.map(r.json())
                        except:
                            output_data = {}
                        job.variable.update(output_data)
                        self._process_success(job)
                else:
                    self._process_success(job)
            except Exception as e:
                self._process_error(job, str(e))


class ScriptTask(Task):
    def __init__(self, attrs):
        super().__init__(attrs)

        self.__script_info = None
        if 'script_info' in attrs and attrs['script_info']:
            self.__script_info = attrs['script_info']

    def process(self, job):
        if self._pre_process(job):
            try:
                input_data = self._input_interface.map(job.variable)
                if self.__script_info:
                    exec(self.__script_info)
                    result = eval("task(input_data)")
                    output_data = self._output_interface.map(result)
                    job.variable.update(output_data)
                self._process_success(job)
            except Exception as e:
                self._process_error(job, str(e))

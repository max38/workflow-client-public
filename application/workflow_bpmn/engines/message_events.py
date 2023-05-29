from .events import Event, BoundaryEvent
from .enum import JobStatusEnum, JobProcessStatusEnum
from .IOInterface import MapperInterface
from ..models import JobWaitingResponse


class MessageEvent(Event):
    def __init__(self, attrs):
        self.__reference_mapping_method = int(attrs.get('reference_mapping_method', 0))
        self.__reference_mapping_info = attrs.get("reference_mapping_info",
                                              "def reference(job_key, job_data): return job_key")

        self._message_interface = None
        if 'message_mapping_info' in attrs and attrs['message_mapping_info']:
            self._message_interface = MapperInterface(
                attrs['message_mapping_type'], attrs['message_mapping_info']
            )

        super().__init__(attrs)

    def job_ref(self, job, variable):
        if self.__reference_mapping_method == 0:
            return str(job.job_key)
        elif self.__reference_mapping_method == 1:
            return str(job.job_id)
        elif self.__reference_mapping_method == 2:
            exec(self.__reference_mapping_info)
            return str(eval("reference(job.job_key, variable)"))
        return str(job.job_id)

    def process(self, job):
        ref_id = self.job_ref(job, job.variable)
        print("Job = " + str(job.job_id) + " REF = " + ref_id + " " + job.task + " ----> WAITING_RESPONSE")
        job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
        job.save(modified_by="Flow")
        self.regis_waiting_message_job(job, job.task)

    def regis_waiting_message_job(self, job, task):
        ref_id = self.job_ref(job, job.variable)
        JobWaitingResponse.objects.create(
            workflow=job.workflow,
            job=job,
            task=task,
            ref_id=ref_id,
            modified_by="Flow"
        )

    def process_response(self, job, response_data, modified_by="Flow"):
        print("========== process_response ========")
        print(job)
        if self._message_interface:
            message_data = self._message_interface.map(response_data)
        else:
            message_data = {}
        job.variable.update(message_data)
        self._process_success(job, modified_by)


class IntermediateCatchMessageEvent(MessageEvent):
    pass


class BoundaryMessageEvent(BoundaryEvent, MessageEvent):
    # def process(self, job):
    #     self._process_success(job, modified_by="BoundaryMessageEvent")

    def job_interrupting(self, job, modified_by="Flow"):
        job = super().job_interrupting(job, modified_by)
        if self.attached_ref and job.task == self.attached_ref.id:
            job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
            job.save(modified_by=modified_by)
        return job

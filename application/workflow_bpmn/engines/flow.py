from .core import CoreElement
from .enum import JobProcessStatusEnum, JobStatusEnum
from . import next as run_next
from ..models import Job


class DataFlow(CoreElement):
    def __init__(self, attrs):
        super().__init__(attrs)

        self.__source_ref = attrs['sourceRef']
        self.__target_ref = attrs['targetRef']

        self._condition_script_type = None
        self._condition_script_info = None

        if 'condition_script_type' in attrs and attrs['condition_script_type'] and attrs['condition_script_type'] != "-":
            self._condition_script_type = attrs['condition_script_type']
            if 'condition_script_info' in attrs and attrs['condition_script_info']:
                self._condition_script_info = attrs['condition_script_info']

    @property
    def source_ref(self):
        return self.__source_ref

    @property
    def target_ref(self):
        return self.__target_ref

    def get_target_filter(self, job):
        if self._condition_script_type and self._condition_script_info:
            if self._condition_script_type == "python":
                exec(self._condition_script_info)
                if eval("filter(job.variable)"):
                    return self.__target_ref
                else:
                    return None
        return self.__target_ref


class SequenceFlow(DataFlow):
    def __init__(self, attrs):
        super().__init__(attrs)


class MessageFlow(DataFlow):
    def __init__(self, attrs):
        super().__init__(attrs)


class FlowObject(CoreElement):
    def __init__(self, attrs):
        super().__init__(attrs)

        self._flow_references = list()

    def add_flow_reference(self, flow_ref):
        self._flow_references.append(flow_ref)

    @property
    def flow_references(self):
        return self._flow_references

    def process(self, job):
        self._process_success(job)

    def pre_process_gateway(self, job):
        pass

    def _process_success(self, job, modified_by="Flow"):
        print("Job = " + str(job.job_id) + " " + job.task + " ----> SUCCESS")
        job.process_status = JobProcessStatusEnum.SUCCESS
        job.save(modified_by=modified_by)
        self._next(job)

    def _process_error(self, job, reason, modified_by="Flow"):
        print("Job = " + str(job.job_id) + " " + job.task + " ----> ERROR")
        job.variable.update({"_error_{}_reason".format(job.task): reason})
        job.process_status = JobProcessStatusEnum.ERROR
        job.save(modified_by=modified_by)

    def _next_filtered(self, job):
        next_task_filtered = []
        for flow_ref in self._flow_references:
            next_task = flow_ref.get_target_filter(job)
            if next_task:
                next_task_filtered.append(next_task)
        return next_task_filtered

    @staticmethod
    def clone_job(parent_job):
        print(" ===== clone_job ===== ")
        job_root = parent_job.job_root if parent_job.job_root else parent_job

        return Job(
            workflow=parent_job.workflow,
            workflow_version=parent_job.workflow_version,
            variable=parent_job.variable,
            job_key='{}-{}'.format(parent_job.job_key, Job.objects.filter(job_root=job_root).count()+1),
            job_root=job_root,
            job_parent=parent_job
        )

    def _next(self, job):
        print("Job = " + str(job.job_id) + " RUN Next _next ----> ")
        if len(self._flow_references) > 0:
            next_task_filtered = self._next_filtered(job)
            num_next_task = len(next_task_filtered)
            if num_next_task <= 0:
                job.status = JobStatusEnum.STOP_AT_FILTER
                job.save(modified_by="Flow")
                run_next(job)
            elif num_next_task == 1:
                job.task = next_task_filtered[0]
                job.process_status = JobProcessStatusEnum.WAITING_TO_PROCESS
                job.save(modified_by="Flow")
                run_next(job)
            else:
                parent_job = job
                for i, next_task in enumerate(next_task_filtered):
                    if i+1 < num_next_task:
                        job = self.clone_job(parent_job)
                    else:
                        job = parent_job
                    job.process_status = JobProcessStatusEnum.WAITING_TO_PROCESS
                    job.task = next_task
                    job.save(modified_by="Flow")
                    print("Job = " + str(job.job_id) + " RUN Next ---> " + job.task)
                    run_next(job)
        else:
            job.status = JobStatusEnum.COMPLETE
            job.save(modified_by="Flow")

    #     self.inputInterface = inputInterface
    #     self.outputInterface = outputInterface
    #     self.input = None
    #     self.output = None
    #     self.flowReference = None
    #
    # def setInputInterface(self, inputInterface):
    #     self.inputInterface = inputInterface
    #
    # def setOutputInterface(self, outputInterface):
    #     self.outputInterface = outputInterface
    #
    # def getInputInterface(self):
    #     return self.inputInterface
    #
    # def getOutputInterface(self):
    #     return self.outputInterface
    #
    # def setInput(self, Input):
    #     self.input = Input
    #
    # def getInput(self):
    #     return self.input
    #
    # def setOutput(self, output):
    #     self.output = output
    #
    # def getOutput(self):
    #     return self.output
    #
    # def setFlowReference(self, flow):
    #     self.flowReference = flow
    #
    # def getFlowReference(self):
    #     return self.flowReference

from .flow import FlowObject
from .enum import JobStatusEnum, JobProcessStatusEnum
from ..models import JobWaitingResponse, BpmnWorkflowController
from .exceptions import InterruptJobWaitingResponseRegister


class Gateway(FlowObject):
    def __init__(self, attrs):
        super().__init__(attrs)

    def task_selected(self, job, task, modified_by):
        job.process_status = JobProcessStatusEnum.SUCCESS
        job.save(modified_by=modified_by)

        job.task = task
        job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
        job.save(modified_by=modified_by)


class ParallelGateway(Gateway):
    def __init__(self, attrs):
        super().__init__(attrs)
        # self.executed_list = []  # construct at run time
        self.__incoming_list = []  # construct at parsing time

    # def addExecuted(self, elementId):
    #     self.executed_list.append(elementId)
    #
    # def isJoined(self):
    #     return self.inComingList == self.executed_list
    #
    def add_incoming(self, element_id):
        self.__incoming_list.append(element_id)

    @property
    def incoming_list(self):
        return self.__incoming_list


class ExclusiveGateway(Gateway):
    def __init__(self, attrs):
        super().__init__(attrs)
        self.condition = None

    # def getRequiredTasks(self):
    #     required_task = []
    #     if (self.condition is None):
    #         return []
    #     for condition in self.condition:
    #         required_task.append(condition['variable1']['variableOf']['methodOfTaskId'])
    #     return required_task
    #
    # # return flow that make condition true
    # def getFlowReference(self, required_task):
    #     required_task_dict = required_task
    #     if (self.condition is None):
    #         return self.flowReferenceList[0]
    #
    #     for condition in self.condition:
    #         if (condition['operator'] == "=="):
    #             var1Task_object = required_task_dict[condition['variable1']['variableOf']['methodOfTaskId']]
    #             var1_value = var1Task_object.getInput()[condition['variable1']['name']]['value']
    #             var2_value = condition['variable2']['value']
    #             if (var1_value == var2_value):
    #                 return condition['targetNode']
    #
    #     return self.flowReferenceList[0]  # fail to getflow return None (self.flowReferenceList[0] for debuging)


class EventBasedGateway(Gateway):
    def __init__(self, attrs):
        super().__init__(attrs)
        self.condition = None

    def process(self, job):
        job.process_status = JobProcessStatusEnum.WAITING_RESPONSE
        job.save(modified_by="Flow")

        next_task_filtered = self._next_filtered(job)
        controller = BpmnWorkflowController.objects.get(workflow=job.workflow)
        bpmn_job = controller.bpmn

        for next_task in next_task_filtered:
            try:
                ref_id = bpmn_job.state[next_task].job_ref(job, job.variable)
                JobWaitingResponse.objects.create(
                    workflow=job.workflow,
                    job=job,
                    task=next_task,
                    ref_id=ref_id,
                    gateway=self.id,
                    modified_by="Flow"
                )
                bpmn_job.state[next_task].pre_process_gateway(job)
            except InterruptJobWaitingResponseRegister:
                JobWaitingResponse.objects.filter(
                    workflow=job.workflow, job=job, gateway=self.id, is_done=False
                ).delete()
                break

import uuid
import json
from django.core.serializers.json import DjangoJSONEncoder
from .enum import BpmnTypeEnum, JobProcessStatusEnum
from .events import StartEvent, EndEvent, StartTimerEvent, BoundaryErrorEvent
from .message_events import IntermediateCatchMessageEvent, BoundaryMessageEvent
from .timer_events import IntermediateCatchTimerEvent, BoundaryTimerEvent
from .conditional_events import IntermediateCatchConditionalEvent, BoundaryConditionalEvent
from .tasks import TaskRestApi, ScriptTask
from .flow import SequenceFlow, MessageFlow
from .gateway import ParallelGateway, ExclusiveGateway, EventBasedGateway
from ..models import Job
from . import next as run_next


class WorkflowEngine:
    def __init__(self, workflow, version_instance, config_resources=None):
        self.__workflow = workflow
        self.__version_instance = version_instance
        self.__raw_bpmn = version_instance.bpmn
        # self.__raw_bpmn = json.loads(version_instance.bpmn)
        self._job_variables = self.__get_job_variables()
        self.__config_resources = {}

        self.__collaborator = set()
        self.__state = {}
        self.__transition = {}
        self.__start_state = None
        self.__end_state = {}

        if config_resources:
            for config in config_resources:
                if config.variable:
                    for v in config.variable:
                        self.__config_resources[v['key']] = v['value']

        self.__initialize()

    @property
    def job_variables(self):
        return self._job_variables

    @property
    def state(self):
        return self.__state

    @property
    def collaborator(self):
        return self.__collaborator

    def create_job(self, modified_by, json_data=None, task=None):
        if not task:
            task = self.__start_state

        if task:
            if 'job_key' not in json_data:
                job_key = uuid.uuid4()
            else:
                job_key = json_data['job_key']
            json_data = json.dumps(
              json_data,
              sort_keys=True,
              indent=1,
              cls=DjangoJSONEncoder
            )
            job = Job.objects.create(
                workflow=self.__workflow,
                workflow_version=self.__version_instance,
                task=task.id,
                variable=json.loads(json_data),
                job_key=job_key,
                modified_by=modified_by
            )
            run_next(job)
            # task.next(job)
            return job.job_key
        return False

    def next(self, job):
        state_task = self.__state[job.task]

        print("next ============")
        print(state_task)
        if job.process_status == JobProcessStatusEnum.WAITING_TO_PROCESS:
            # job.config_resources = self.__config_resources
            state_task.process(job)
            print("Done ============")
            # run_next(job)
        else:
            print("Processed ============")

    def run_flow(self, wf_controller):
        for start_name in self.__state:
            self.__state[start_name].run_flow(wf_controller)

    def stop_flow(self):
        for start_name in self.__state:
            self.__state[start_name].stop_flow()

    def job_response(self, modified_by, job, response_data=None):
        if response_data is None:
            response_data = {}
        state_task = self.__state[job.task]
        print(" ==== job_response ========")
        print(job.job_key)
        print(job.task, job.process_status)
        if job.process_status == JobProcessStatusEnum.WAITING_RESPONSE:
            state_task.process_response(job, response_data, modified_by)

    def __initialize(self):
        """
        Passing Workflow
        :return:
        """
        # elements_list = self.__raw_bpmn['elements'][0]['elements'][1]['elements']
        for element_def in self.__raw_bpmn['elements'][0]['elements']:
            if element_def['name'] == BpmnTypeEnum.PROCESS:
                self.__initialize_process(element_def['elements'])

    def __initialize_process(self, elements_list):
        sequenceFlow_ref = []
        boundary_events = []
        # element_ref_lane_owner = {}

        for element in elements_list:
            if element['name'] == BpmnTypeEnum.LANESET:
                element = element['elements']
                # for lane in element:
                #     elements_in_lane = lane['elements']
                #     for element_ref in elements_in_lane:
                #         element_ref = element_ref['elements'][0]
                #         self.__collaborator.add(str(lane['attributes']['name']))
                #         element_ref_lane_owner[element_ref['text']] = str(
                #             lane['attributes']['name'])  # bpmn_element_id : id_lane_owner
            # Start Event
            elif element['name'] == BpmnTypeEnum.START_EVENT:
                assigned = False
                for sub_element in element['elements']:
                    if sub_element['name'] == BpmnTypeEnum.TIMER_EVENT_DEFINITION:
                        start_event = StartTimerEvent(element['attributes'])
                        self.state[start_event.id] = start_event
                        # assigned = True
                if not assigned:
                    self.__start_state = StartEvent(element['attributes'])
                    self.__state[self.__start_state.id] = self.__start_state

            # End Event
            elif element['name'] == BpmnTypeEnum.END_EVENT:
                end_event = EndEvent(element['attributes'])

                self.state[end_event.id] = end_event
                self.__end_state[end_event.id] = end_event

            # Parallel GateWay
            elif element['name'] == BpmnTypeEnum.PARALLEL_GATEWAY:
                gateway = ParallelGateway(element['attributes'])
                self.state[gateway.id] = gateway

            # Exclusive Gateway
            elif element['name'] == BpmnTypeEnum.EXCLUSIVE_GATEWAY:
                gateway = ExclusiveGateway(element['attributes'])
                self.state[gateway.id] = gateway

            # Event Based Gateway
            elif element['name'] == BpmnTypeEnum.EVENT_BASED_GATEWAY:
                gateway = EventBasedGateway(element['attributes'])
                self.state[gateway.id] = gateway

            # Intermediate Catch Event
            elif element['name'] == BpmnTypeEnum.INTERMEDIATE_CATCH_EVENT:
                for sub_element in element['elements']:
                    if sub_element['name'] == BpmnTypeEnum.MESSAGE_EVENT_DEFINITION:
                        message_event = IntermediateCatchMessageEvent(element['attributes'])
                        self.state[message_event.id] = message_event
                        break
                    elif sub_element['name'] == BpmnTypeEnum.TIMER_EVENT_DEFINITION:
                        timer_event = IntermediateCatchTimerEvent(element['attributes'])
                        self.state[timer_event.id] = timer_event
                        break
                    elif sub_element['name'] == BpmnTypeEnum.CONDITIONAL_EVENT_DEFINITION:
                        conditional_event = IntermediateCatchConditionalEvent(element['attributes'])
                        self.state[conditional_event.id] = conditional_event
                        break

                # gateway = ExclusiveGateway(element['attributes'])
                # self.state[gateway.id] = gateway

            # Task
            elif element['name'] == BpmnTypeEnum.TASK:
                # lane_owner = element_ref_lane_owner[element['attributes']['id']]
                lane_owner = None
                task = TaskRestApi(element['attributes'])
                self.__state[task.id] = task

            # Script Task
            elif element['name'] == BpmnTypeEnum.SCRIPT_TASK:
                task = ScriptTask(element['attributes'])
                self.__state[task.id] = task

            # Boundary Event
            elif element['name'] == BpmnTypeEnum.BOUNDARY_EVENT:
                boundary_events.append(element)

            # Sequecial Flow
            elif element['name'] == BpmnTypeEnum.SEQUENCE_FLOW:
                try:
                    sequenceFlow_ref.append(SequenceFlow(element['attributes']))
                except:
                    pass

            # Sequecial Flow
            elif element['name'] == BpmnTypeEnum.MESSAGE_FLOW:
                try:
                    sequenceFlow_ref.append(MessageFlow(element['attributes']))
                except:
                    pass

        self.__create_boundary_event(boundary_events)
        self.__create_transition(sequenceFlow_ref)

    def __get_job_variables(self):
        print(self.__raw_bpmn)
        if 'variables' in self.__raw_bpmn['declaration']['attributes']:
            variables = self.__raw_bpmn['declaration']['attributes']['variables']
            variables_re = dict()
            for variable in variables:
                variables_re[variable['variable']] = variable
            return variables_re
        return {}

    def __create_boundary_event(self, boundary_events):
        for element in boundary_events:
            attached_ref = self.__state.get(element['attributes']['attachedToRef'])
            for sub_element in element['elements']:
                if sub_element['name'] == BpmnTypeEnum.MESSAGE_EVENT_DEFINITION:
                    message_event = BoundaryMessageEvent(element['attributes'], attached_ref)
                    self.state[message_event.id] = message_event
                    attached_ref.register_boundary_event(message_event)
                    break
                elif sub_element['name'] == BpmnTypeEnum.TIMER_EVENT_DEFINITION:
                    timer_event = BoundaryTimerEvent(element['attributes'], attached_ref)
                    self.state[timer_event.id] = timer_event
                    attached_ref.register_boundary_event(timer_event)
                    break
                elif sub_element['name'] == BpmnTypeEnum.CONDITIONAL_EVENT_DEFINITION:
                    conditional_event = BoundaryConditionalEvent(element['attributes'], attached_ref)
                    self.state[conditional_event.id] = conditional_event
                    attached_ref.register_boundary_event(conditional_event)
                    break
                elif sub_element['name'] == BpmnTypeEnum.ERROR_EVENT_DEFINITION:
                    error_event = BoundaryErrorEvent(element['attributes'], attached_ref)
                    self.state[error_event.id] = error_event
                    attached_ref.register_boundary_event(error_event)
                    break
            self.__state[attached_ref.id] = attached_ref

    # construct state transition function
    def __create_transition(self, transition_list):
        for transition in transition_list:
            sourceObj = self.__state.get(transition.source_ref)
            targetObj = self.__state.get(transition.target_ref)

            if sourceObj and targetObj:
                sourceObj.add_flow_reference(transition)

                if isinstance(targetObj, ParallelGateway):
                    targetObj.add_incoming(sourceObj)

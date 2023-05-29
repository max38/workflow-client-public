from ..enum import ApplicationEnum


class BpmnTypeEnum(ApplicationEnum):
    PROCESS = 'bpmn2:process'

    LANESET = 'bpmn2:laneSet'
    START_EVENT = 'bpmn2:startEvent'
    END_EVENT = 'bpmn2:endEvent'
    BOUNDARY_EVENT = 'bpmn2:boundaryEvent'
    TASK = 'bpmn2:task'
    SCRIPT_TASK = 'bpmn2:scriptTask'
    SEQUENCE_FLOW = 'bpmn2:sequenceFlow'
    MESSAGE_FLOW = 'bpmn2:messageFlow'
    INTERMEDIATE_CATCH_EVENT = 'bpmn2:intermediateCatchEvent'
    MESSAGE_EVENT_DEFINITION = 'bpmn2:messageEventDefinition'
    TIMER_EVENT_DEFINITION = 'bpmn2:timerEventDefinition'
    CONDITIONAL_EVENT_DEFINITION = 'bpmn2:conditionalEventDefinition'
    ERROR_EVENT_DEFINITION = 'bpmn2:errorEventDefinition'
    PARALLEL_GATEWAY = 'bpmn2:parallelGateway'
    EXCLUSIVE_GATEWAY = 'bpmn2:exclusiveGateway'
    EVENT_BASED_GATEWAY = 'bpmn2:eventBasedGateway'


class MapperTypeEnum(ApplicationEnum):
    NONE = '-'
    JSON = 'json'
    PYTHON = 'python'


class JobProcessStatusEnum(ApplicationEnum):
    ERROR = 0
    WAITING_TO_PROCESS = 1
    PROCESSING = 2
    SUCCESS = 3
    WAITING_RESPONSE = 4


class JobStatusEnum(ApplicationEnum):
    ERROR = 0
    WAITING_TO_PROCESS = 1
    PROCESSING = 2
    SUBJOB_COMPLETE = 3
    COMPLETE = 4
    STOP_AT_FILTER = 5



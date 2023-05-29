from .exceptions import IllegalArgumentError
from ..models import BpmnWorkflowPeriodic


class CoreElement:

    def __init__(self, attrs=None):
        self.__wf_controller = None

        if attrs:
            self.__id = attrs['id']
            self.__name = attrs.get('name', '')
            self.__attrs = attrs
        # elif element_id:
        #     self.__id = element_id
        #     self.__name = name
        else:
            raise IllegalArgumentError("CoreElement require attrs or element_id")

    @property
    def id(self):
        return self.__id

    @property
    def attrs(self):
        return self.__attrs

    @property
    def name(self):
        return self.__name

    @property
    def wf_controller(self):
        return self.__wf_controller

    def __str__(self):
        return "{}: {}".format(self.__id, self.__name)

    def run_flow(self, wf_controller):
        self.__wf_controller = wf_controller

    def stop_flow(self):
        for controller in BpmnWorkflowPeriodic.objects.filter(workflow=self.wf_controller):
            if controller.crontab:
                controller.crontab.delete()
            if controller.interval:
                controller.interval.delete()
            controller.delete()

from ..models import BpmnWorkflow, BpmnWorkflowVersion, BpmnWorkflowController
from ..enum import WorkflowStatusEnum
from ..engines.workflow import WorkflowEngine


class WorkflowOperation(object):
    def __init__(self, workflow, modified_by):
        if not type(workflow) == BpmnWorkflow:
            raise Exception("Invalid BpmnWorkflow instance")

        self.modified_by = modified_by
        self.object = workflow

    def apply_and_run(self, version_instance, config_resources=None):
        if not type(version_instance) == BpmnWorkflowVersion:
            raise Exception("Invalid BpmnWorkflowVersion instance")

        if version_instance.workflow_id_id == self.object.workflow_id:
            try:
                controller = BpmnWorkflowController.objects.get(workflow=self.object)
                is_apply = not controller.version == version_instance
            except:
                is_apply = True

            if is_apply:
                self.terminate()
                controller = BpmnWorkflowController.objects.create(
                    workflow=self.object,
                    version=version_instance,
                    bpmn=WorkflowEngine(self.object, version_instance, config_resources),
                    # bpmn=version_instance.bpmn,
                    # job_variable=self.__get_job_variable(version_instance.bpmn),
                    modified_by=self.modified_by
                )
                if config_resources:
                    for config in config_resources:
                        controller.config_resources.add(config)
                self.__run()
            version_instance.is_active = True
            version_instance.save()
        else:
            raise Exception("Invalid Workflow instance")

    def __run(self):
        controller = BpmnWorkflowController.objects.get(workflow=self.object)
        controller.run_flow(self.modified_by)

    def terminate(self):
        # We should warm shutdown after receive this signal
        controllers = BpmnWorkflowController.objects.filter(workflow=self.object)
        for controller in controllers:
            controller.bpmn.stop_flow()
            controller.delete()

    def __initialize(self, bpmn_json):
        elements_list = bpmn_json['elements'][0]['elements'][1]['elements']

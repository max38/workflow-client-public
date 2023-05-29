from celery import shared_task
from .enum import JobProcessStatusEnum


def create_job(workflow_id, variable, modified_by):
    __create_job.delay(workflow_id, variable, modified_by)
    # job_key = __create_job(workflow_id, variable, modified_by)
    # return job_key


@shared_task
def __create_job(workflow_id, variable, modified_by):
    from ..models import BpmnWorkflowController

    wf_controller = BpmnWorkflowController.objects.get(workflow_id=workflow_id)
    job_key = wf_controller.bpmn.create_job(modified_by, variable)
    return job_key


@shared_task
def periodic_start_flow(controller_id, task):
    from ..models import BpmnWorkflowController

    wf_controller = BpmnWorkflowController.objects.get(id=controller_id)
    if task in wf_controller.bpmn.state:
        task_state = wf_controller.bpmn.state[task]
        if hasattr(task_state, "create_job_variable"):
            variable = task_state.create_job_variable()
            job_key = wf_controller.bpmn.create_job("Periodic", variable, task_state)
            return job_key


@shared_task
def periodic_task(controller_id, task):
    from ..models import BpmnWorkflowController, JobWaitingResponse, Job
    from .timer_events import BoundaryTimerEvent

    modified_by = "Periodic"

    wf_controller = BpmnWorkflowController.objects.get(id=controller_id)
    processed_job_ids = []
    # Normal Flow
    for job in Job.objects.filter(workflow=wf_controller.workflow, task=task, process_status=JobProcessStatusEnum.WAITING_RESPONSE):
        wf_controller.bpmn.job_response(modified_by, job)
        processed_job_ids.append(job.job_id)

    # Event Gateway
    for jobw in JobWaitingResponse.objects.filter(workflow=wf_controller.workflow, task=task):
        if jobw.job_id not in processed_job_ids:
            ####################
            wf_controller.bpmn.state[jobw.job.task].task_selected(jobw.job, jobw.task, modified_by)
            wf_controller.bpmn.job_response(modified_by, jobw.job)
            jobw.delete()
            JobWaitingResponse.objects.filter(
                workflow=jobw.workflow, job=jobw.job, gateway=jobw.gateway, is_done=False
            ).delete()
            ####################
            processed_job_ids.append(jobw.job_id)

    # Boundary Timer Event
    task_obj = wf_controller.bpmn.state[task]
    if type(task_obj) == BoundaryTimerEvent:
        if task_obj.attached_ref:
            for job in Job.objects.filter(workflow=wf_controller.workflow, task=task_obj.attached_ref.id):
                job = task_obj.job_interrupting(job, modified_by)
                next(job)


@shared_task
def periodic_job(controller_id, task, job_id):
    from ..models import BpmnWorkflowController, Job, BpmnWorkflowPeriodic, JobWaitingResponse
    from .timer_events import BoundaryTimerEvent

    modified_by = "Periodic"
    clear_periodic_job = True

    wf_controller = BpmnWorkflowController.objects.get(id=controller_id)
    job = Job.objects.get(workflow=wf_controller.workflow, job_id=job_id)

    if job.task == task and job.process_status == JobProcessStatusEnum.WAITING_RESPONSE:
        wf_controller.bpmn.job_response(modified_by, job)
    else:
        try:
            # Event Gateway
            jobw = JobWaitingResponse.objects.get(job=job, workflow=wf_controller.workflow, task=task)
            ####################
            wf_controller.bpmn.state[jobw.job.task].task_selected(jobw.job, jobw.task, modified_by)
            wf_controller.bpmn.job_response(modified_by, jobw.job)
            jobw.delete()
            JobWaitingResponse.objects.filter(
                workflow=jobw.workflow, job=jobw.job, gateway=jobw.gateway, is_done=False
            ).delete()
            ####################
        except:
            pass

    # Boundary Timer Event
    task_obj = wf_controller.bpmn.state[task]
    if type(task_obj) == BoundaryTimerEvent:
        job = task_obj.job_interrupting(job, modified_by)
        clear_periodic_job = task_obj.is_cancel_activity
        if task_obj.attached_ref and job.task == task_obj.attached_ref.id:
            next(job)

    if clear_periodic_job:
        BpmnWorkflowPeriodic.objects.filter(job=job).delete()


def next(job=None, job_id=None):
    if job:
        job_id = job.job_id
    __next.delay(job_id)


@shared_task
def __next(job_id):
    from ..models import BpmnWorkflowController, Job

    job = Job.objects.get(job_id=job_id)
    wf_controller = BpmnWorkflowController.objects.get(workflow_id=job.workflow_id)
    wf_controller.bpmn.next(job)


def job_response(workflow_id, job_id, task, response_data, modified_by):
    __job_response(workflow_id, job_id, task, response_data, modified_by)


@shared_task
def __job_response(workflow_id, job_id, task, response_data, modified_by):
    from ..models import BpmnWorkflowController, Job

    job = Job.objects.get(job_id=job_id)
    if job.task == task:
        wf_controller = BpmnWorkflowController.objects.get(workflow_id=workflow_id)
        wf_controller.bpmn.job_response(modified_by, job, response_data)

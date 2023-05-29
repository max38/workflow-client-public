import inspect


class ApplicationEnum(object):

    @classmethod
    def fromcode(cls, str):
        if not str:
            return None
        return getattr(cls, str.strip().upper(), None)

    @classmethod
    def fromstring(cls, code):
        if code is None:
            return None
        members = inspect.getmembers(cls, lambda m: not(inspect.isroutine(m)))
        props = [m for m in members if not(m[0][:2] == '__') and m[1] == code]
        if not props:
            return None
        return props[0][0]

    @classmethod
    def choices(cls):
        # get all members of the class
        members = inspect.getmembers(cls, lambda m: not(inspect.isroutine(m)))
        # filter down to just properties
        props = [m for m in members if not(m[0][:2] == '__')]
        # format into django choice tuple
        choices = tuple([(p[1], p[0]) for p in props])
        return choices

    @classmethod
    def list(cls):
        # get all members of the class
        members = inspect.getmembers(cls, lambda m: not(inspect.isroutine(m)))
        # filter down to just properties
        props = [m for m in members if not(m[0][:2] == '__')]
        # format into django choice tuple
        choices = tuple([(p[0]) for p in props])
        return choices


class HttpMethod(ApplicationEnum):
    POST = 'post'
    GET = 'get'
    PUT = 'put'
    PATCH = 'patch'
    OPTIONS = 'options'
    HEAD = 'head'
    DELETE = 'delete'


class WorkflowStatusEnum(ApplicationEnum):
    TERMINATE = 'terminate'
    RUN = 'run'
    STARTING = 'starting'
    PENDING = 'pending'
    STOPPING = 'stopping'
    RUN_ERROR = 'error'

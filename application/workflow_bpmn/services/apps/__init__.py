class ModulesInterface:
    def __init__(self, name, action, description="", parameters={}, default_parameters={}, reponses={}):
        self.__name = name
        self.__action = action
        self.__description = description
        self.__parameters = parameters
        self.__reponses = reponses
        self.__default_parameters = default_parameters

    @property
    def name(self):
        return self.__name

    @property
    def description(self):
        return self.__description

    @property
    def parameters(self):
        return self.__parameters

    @property
    def default_parameters(self):
        return self.__default_parameters

    @property
    def action(self):
        return self.__action

    @property
    def reponses(self):
        return self.__reponses

    def dict_schema(self):
        return {
            'name': self.__name,
            "action": self.__action,
            'description': self.__description,
            'parameters': self.__parameters,
            'responses': self.__reponses
        }

    def __call__(self, *args, **kwargs):
        pass


class ServiceInterface:
    name = "General Service"
    logo = ""
    description = "description"

    MODULES = {}
    CONNECTION = {}

    def __init__(self, connection):
        self._connection = connection

    @classmethod
    def info(cls):
        return {
            'name': cls.name,
            'logo': cls.logo,
            'description': cls.description,
            'connection': cls.CONNECTION,
        }

    @classmethod
    def connect(cls, connect_data):
        return True

    # @classmethod
    # def info_full(cls):
    #     return {
    #         'name': cls.name,
    #         'logo': cls.logo,
    #         'description': cls.description,
    #         # 'modules': cls.MODULES,
    #         'connection': cls.CONNECTION,
    #     }

    def fetch_modules(self):
        modules = self.MODULES
        return modules

    def call_modules(self, module, parameters):
        module_exec = self.MODULES[module]
        call_parameters = module_exec.default_parameters
        call_parameters.update(parameters)
        module_response = eval("self.{}(call_parameters)".format(module_exec.action))
        response = module_response
        return response

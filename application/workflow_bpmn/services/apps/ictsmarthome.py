import requests
from . import ServiceInterface, ModulesInterface

# "ServiceInterface.jobs.module"


class IctSmartHomeServiceInterface(ServiceInterface):
    name = "ICT Smart Home Service"
    logo = "/static/services/logo/smart-home-technology.jpg"
    description = "Smart Home"

    CONNECTION = {
        "username": {
            "title": "Username",
            "type": "string",
            "maxLength": 128,
            "minLength": 1,
            "required": True,
        },
        "password": {
            "title": "Password",
            "type": "string",
            "maxLength": 128,
            "minLength": 1,
            "required": True,
        },
        "url": {
            "title": "Url",
            "type": "string",
            "maxLength": 256,
            "minLength": 1,
            "required": True,
        },
    }

    MODULES = {
        'jobs': ModulesInterface(
            name="Jobs",
            description="",
            parameters=[],
            reponses=[],
            action="list_tag",
            default_parameters={
                'system_id': "test"
            }
        )
    }

    @classmethod
    def connect(cls, connect_data):
        payload = {
            "username": connect_data["username"],
            "password": connect_data["password"],
        }
        res = requests.post("{}/restapi/api-token-auth/".format(connect_data['url']), json=payload)
        if res.status_code == 200:
            return True
        return False

    def list_modules(self):
        config_interface = self._connection
        headers = {
            "Authorization": "Token {}"
        }
        res = requests.get("{}/restapi/home/tag/".format(config_interface['url']), headers=headers)
        # restapi/home/tag/

    def list_tag(self, parameters):
        print("list_tag")
        print(parameters)
        print("--------------------")
        return {"test": 5555}

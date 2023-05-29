import requests
from . import ServiceInterface, ModulesInterface

# "ServiceInterface.jobs.module"


class IctScadaServiceInterface(ServiceInterface):
    name = "ICT Scada Service"
    logo = "/static/services/logo/ict-scada.png"
    description = "ICT Open Scada"

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
        # 'jobs': ModulesInterface(
        #     name="Jobs",
        #     description="",
        #     parameters=[],
        #     reponses=[],
        #     action="list_tag",
        #     default_parameters={
        #         'system_id': "test"
        #     }
        # )
    }

    def get_token(self):
        data_interface = self._connection.data_interface
        if True or not data_interface or not 'token' in data_interface:
            res = self.connect(self._connection.config_interface)
            if res:
                token = res['token']
                data_interface = {
                    'token': token
                }
                self._connection.data_interface = data_interface
                self._connection.save(modified_by="System Authen")

        if 'token' in self._connection.data_interface:
            return self._connection.data_interface['token']

    @classmethod
    def connect(cls, connect_data):
        payload = {
            "username": connect_data["username"],
            "password": connect_data["password"],
        }
        res = requests.post("{}/restapi/api-token-auth/".format(connect_data['url']), json=payload)
        if res.status_code == 200:
            return res.json()
        return {}

    def fetch_modules(self, url=""):
        config_interface = self._connection.config_interface
        headers = {
            "Authorization": "Token {}".format(self.get_token())
        }
        if not url:
            url = "{}/restapi/home/tag/".format(config_interface['url'])
        res = requests.get(url, headers=headers)

        module_list = []
        response_data = res.json()
        for module in response_data['results']:
            interface = ModulesInterface(
                name="GET {}".format(module['full_name']),
                action="get_tag_value",
                description="Device {}".format(module['device'].get('name')) if module['device'] else module['full_name'],
                parameters={
                    'full_name': {
                        'title': "Full Name",
                        'type': "string",
                        'required': True,
                        'default': module['full_name']
                    }
                },
                reponses={
                    'value': {
                        'title': "Value",
                        'type': "string",
                    }
                }
            ).dict_schema()
            interface['logo'] = self.logo
            module_list.append(interface)

            interface = ModulesInterface(
                name="SET {}".format(module['full_name']),
                action="set_tag_value",
                description="Device {}".format(module['device'].get('name')) if module['device'] else module['full_name'],
                parameters={
                    'tag': {
                        'title': "Full Name",
                        'type': "string",
                        'required': True,
                        'default': module['full_name']
                    },
                    'value': {
                        'title': "Value",
                        'type': "string",
                        'required': True
                    }
                },
                reponses={}
            ).dict_schema()
            interface['logo'] = self.logo
            module_list.append(interface)

        return {
            'modules': module_list,
            'next_url': ''
        }

        # "username": {
        #     "title": "Username",
        #     "type": "string",
        #     "maxLength": 128,
        #     "minLength": 1,
        #     "required": True,
        # },
        # # restapi/home/tag/

    def list_tag(self, parameters):
        print("list_tag")
        print(parameters)
        print("--------------------")
        return {"test": 5555}

    def get_tag_value(self):
        # / restapi / tag / get_tag_value /?tag = system
        # 1.
        # Meter_Plane_1.Volt
        pass

    def set_tag_value(self):
        # https: // intelligentscada.com / restapi / tag / set_tag_value /
        # {
        #     "tag": "system1.echo.value1",
        #     "value": 71
        # }
        pass

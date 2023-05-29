import requests
import smtplib
import ssl
from . import ServiceInterface, ModulesInterface


class EmailServiceInterface(ServiceInterface):
    name = "Email Service"
    logo = "/static/services/logo/email.png"
    description = "Send Email"

    CONNECTION = {
        "smtp_server": {
            "title": "SMTP Server",
            "type": "string",
            "maxLength": 128,
            "minLength": 1,
            "required": True,
        },
        "sender_email": {
            "title": "Sender Email",
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
        "port": {
            "title": "Port",
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

    @classmethod
    def connect(cls, connect_data):
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(connect_data["smtp_server"], connect_data["port"], context=context) as server:
            if server.login(connect_data["sender_email"], connect_data["password"]):
                return True
        return False

    # def list_modules(self):
    #     config_interface = self._connection
    #     headers = {
    #         "Authorization": "Token {}"
    #     }
    #     res = requests.get("{}/restapi/home/tag/".format(config_interface['url']), headers=headers)
        # restapi/home/tag/

# def send_email():
#     port = 465  # For SSL
#     smtp_server = "smtp.gmail.com"
#     sender_email = "support@aigts.co"  # Enter your address
#     receiver_email = "sukhum_butrkam@hotmail.com"  # Enter receiver address
#     password = "rcgkezijuqczwcwx"
#     message = """\
#     Subject: Hi there
#
#     This message is sent from Python."""
#
#     context = ssl.create_default_context()
#     with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
#         server.login(sender_email, password)
#         server.sendmail(sender_email, receiver_email, message)
#         return {"test": 5555}

import datetime
import requests
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import exceptions


class ExternalTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        try:
            token = Token.objects.get(key=key)
        except Token.DoesNotExist:
            headers = {
                "Authorization": "Token d37a9f39999e1514655ca64576c99862b3e3e76e"
            }
            res = requests.get("{}?token={}".format(settings.EXTERNAL_API_TOKEN_AUTH, key), headers=headers)
            if res.status_code == 200:
                res_data = res.json()
                user = User.objects.create_user(username=res_data['username'])
                token = Token.objects.create(user=user, key=key)
            else:
                raise exceptions.AuthenticationFailed('Invalid token')

        # if not token.user.is_active:
        #     raise exceptions.AuthenticationFailed('User inactive or deleted')

        # utc_now = datetime.datetime.utcnow()

        # if token.created < utc_now - datetime.timedelta(hours=24):
        #     raise exceptions.AuthenticationFailed('Token has expired')

        return (token.user, token)

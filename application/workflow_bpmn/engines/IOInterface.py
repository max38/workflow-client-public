import json
from django.template import Context, Template
from datetime import datetime
from .enum import MapperTypeEnum


class MapperInterface(object):
    def __init__(self, mapper_type, mapper):
        if not mapper_type in [
            MapperTypeEnum.JSON, MapperTypeEnum.PYTHON
        ]:
            raise Exception("Invalid Mapper type")
        self.__type = mapper_type
        self.__mapper = mapper

    def map(self, data, mapper_func="mapper"):
        if self.__type == MapperTypeEnum.PYTHON:
            exec(self.__mapper)
            return eval("{}(data)".format(mapper_func))
        elif self.__type == MapperTypeEnum.JSON:
            template = Template(self.__mapper)
            context = Context(data)
            json_str = template.render(context)
            return json.loads(json_str)
        else:
            return data

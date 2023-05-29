class ServiceApps:
    def __init__(self, service_classes):
        self.__service_classes = service_classes

    def services(self):
        service_list = []
        for s in self.__service_classes:
            s_info = self.__service_classes[s].info()
            s_info['id'] = s
            service_list.append(s_info)
        return service_list

    def connect(self, service_key, connect_data):
        return self.__service_classes[service_key].connect(connect_data)

    def fetch_modules(self, service_key, con):
        service_classes = self.__service_classes[service_key](con)
        return service_classes.fetch_modules()

    def service_classes(self):
        return self.__service_classes

    # def register(self, service_class):
    #     print(service_class)
    #     if service_class.id in self.__service_classes:
    #         raise Exception("{} is already register.".format(service_class.id))
    #     else:
    #         self.__service_classes[service_class.id] = service_class

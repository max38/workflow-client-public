from .manager import ServiceApps
from .apps.ictscada import IctScadaServiceInterface
from .apps.ictsmarthome import IctSmartHomeServiceInterface
from .apps.email import EmailServiceInterface

service_apps = ServiceApps({
    "ict-scada": IctScadaServiceInterface,
    "ict-smarthome": IctSmartHomeServiceInterface,
    "email": EmailServiceInterface
})

from django.db import models


class Model(models.Model):
    previous = models.TextField(null=True, blank=True)
    current = models.TextField(null=True, blank=True)
    field_name = models.TextField()

    class Meta:
        abstract = True

from django.db import models
from django.utils import timezone
from django.contrib import admin
from rest_framework import status
from rest_framework.response import Response


class ModelModifierError(Exception):
    pass


class ModelSoftDeleteError(Exception):
    pass


class ModifierQuerySet(models.QuerySet):

    def create(self, **kwargs):
        if 'modified_by' not in kwargs:
            raise ModelModifierError("Cannot create without modified_by field.")
        kwargs['modified_time'] = timezone.now()
        return super(ModifierQuerySet, self).create(**kwargs)

    def update(self, **kwargs):
        if 'modified_by' not in kwargs:
            raise ModelModifierError("Cannot update without modified_by field.")
        kwargs['modified_time'] = timezone.now()
        return super(ModifierQuerySet, self).update(**kwargs)


class __ModifierManager(models.Manager):
    pass


ModifierManager = __ModifierManager.from_queryset(ModifierQuerySet)


class ModifierModel(models.Model):
    modified_by = models.CharField(max_length=128)  # name or identifier of the person or system that modifi the order
    modified_time = models.DateTimeField(auto_now=True)  # datetime will be change only when order_state_code is changed

    objects = ModifierManager()

    def save(self, **kwargs):
        if not ('force_insert' in kwargs and kwargs['force_insert']):
            if 'modified_by' not in kwargs:
                pass
                # raise ModelModifierError("Cannot save without modified_by parameter.")
            else:
                self.modified_by = kwargs.pop('modified_by')
        super(ModifierModel, self).save(**kwargs)

    class Meta:
        abstract = True


class ModifierDjangoAdmin(admin.ModelAdmin):

    def get_readonly_fields(self, request, obj=None):
        return list(self.readonly_fields) + ['modified_by', 'modified_time']

    def save_model(self, request, obj, form, change):
        obj.save(modified_by=request.user.username)


class ModifierAPIView:
    def create(self, request, *args, **kwargs):
        request_data = request.data
        if not type(request_data) == dict:
            request_data._mutable = True
        request_data['modified_by'] = request.user.username
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        request_data = request.data
        if not type(request_data) == dict:
            request_data._mutable = True
        request_data['modified_by'] = request.user.username
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

from django.db import models
from django.db.models.signals import pre_save


_audit_model_objects = dict()
_audit_fields_objects = dict()


class AuditException(Exception):
    pass


class _AuditModel(object):
    def __init__(self, source, target):
        self.source = source
        self.target = target
        self.__register_changes(source, target)

    def __register_changes(self, source, target):
        pre_save.connect(self.__presave_handler, sender=source)

    def __presave_handler(self, instance, **kwargs):
        if not instance._state.adding:
            # previous = self.source.objects.get(pk=instance.pk)
            # self.__create_history(previous, self.target)
            self.__create_history(instance, self.target)

    def __create_history(self, instance, target):
        history_obj = target()
        for target_attr in history_obj._meta.get_fields():
            target_name = target_attr.name
            target_type = type(target_attr)
            try:
                if not target_attr.primary_key:
                    if hasattr(instance, target_name):
                        source_attr = instance._meta.get_field(target_name)
                        source_name = source_attr.name
                        source_type = type(source_attr)
                        if target_name == source_name:  #and (target_type == source_type):
                            source_value = getattr(instance, source_name)
                            if isinstance(source_value, models.Model):
                                setattr(history_obj, target_name, source_value)
                            else:
                                setattr(history_obj, target_attr.get_attname(), source_value)
            except Exception as e:
                # we will review fields that cannot save later
                pass
        # check for configuration
        save_history = False
        try:
            settings = getattr(target, 'AuditModelSetting')
            # check for settings before save
            changes_only = getattr(settings, 'changes_only', False)
            if changes_only:
                interested_fields = settings.interested_fields
                allowed_duplicated_dict = getattr(settings, 'allowed_duplicated', {})
                group_by_field = settings.group_by
                group_by_value = getattr(instance, group_by_field)
                # get lasted object from group
                last_obj = target.objects.filter(**{group_by_field: group_by_value}).last()
                if last_obj:
                    # compare each interested field
                    for interested_field in interested_fields:
                        allowed_duplicated = allowed_duplicated_dict.get(interested_field, [])
                        current_value = getattr(instance, interested_field)
                        last_value = getattr(last_obj, interested_field)
                        if (current_value != last_value) or (current_value in allowed_duplicated):
                            save_history = True
                            break
                else:
                    # no previous historical, just save it
                    save_history = True
            else:
                # do not care about changes, always save
                save_history = True
        except AttributeError as e:
            # no AuditModelSetting found, use as backward compatible
            save_history = True

        # save it when need
        if save_history:
            history_obj.save()


class _AuditFieldChanges(object):
    def __init__(self, source, target):
        self.source = source
        self.target = target
        self.__register_changes(source, target)

    def __register_changes(self, source, target):
        from . import historical
        if not issubclass(target, historical.Model):
            raise AuditException('Target model is not a historical model.')
        if not hasattr(target, 'always_record_fields'):
            raise AuditException('Please specify "always_record_fields" in historical model, it will be use for references.')
        if not hasattr(target, 'source'):
            raise AuditException('Please specify "source" in historical model, it will be use for historical source.')

        pre_save.connect(self.__presave_handler, sender=source)

    def __presave_handler(self, instance, **kwargs):
        if not instance._state.adding:
            previous = self.source.objects.get(pk=instance.pk)
            self.__create_history(previous, instance, self.target)

    def __create_history(self, previous, current, target):
        always_record_fields = getattr(target, 'always_record_fields')
        for current_attr in current._meta.get_fields():
            attr_name = current_attr.name
            if attr_name not in always_record_fields:
                try:
                    if not current_attr.primary_key:
                        previous_value = getattr(previous, attr_name)
                        current_value = getattr(current, attr_name)
                        if previous_value != current_value:
                            history_obj = target()
                            history_obj.source = current
                            history_obj.field_name = attr_name
                            history_obj.previous = previous_value
                            history_obj.current = current_value
                            for always_field in always_record_fields:
                                setattr(history_obj, always_field,  getattr(current, always_field))
                            history_obj.save()
                except AttributeError as e:
                    # just a field that we don't care about it
                    pass


class AuditModel(object):
    def __init__(self, target):
        self.target = target

    def __call__(self, cls):
        self.source = cls
        _audit_model_objects[cls] = _AuditModel(self.source, self.target)
        return cls


class AuditFieldChanges(object):
    def __init__(self, target):
        self.target = target

    def __call__(self, cls):
        self.source = cls
        _audit_fields_objects[cls] = _AuditFieldChanges(self.source, self.target)
        return cls

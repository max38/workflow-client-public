# Generated by Django 3.1.3 on 2020-11-25 01:50

from django.db import migrations, models
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('workflow_bpmn', '0006_auto_20201109_0824'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConnectionService',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('modified_by', models.CharField(max_length=128)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('service', models.CharField(db_index=True, max_length=255)),
                ('config_interface', jsonfield.fields.JSONField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterModelOptions(
            name='jobhistory',
            options={'ordering': ['-modified_time']},
        ),
    ]

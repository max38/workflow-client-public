# Generated by Django 3.0.2 on 2020-07-15 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workflow_bpmn', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobwaitingresponse',
            name='gateway',
            field=models.CharField(blank=True, db_index=True, max_length=255, null=True),
        ),
    ]

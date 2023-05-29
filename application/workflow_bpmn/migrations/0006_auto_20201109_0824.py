# Generated by Django 3.0.2 on 2020-11-09 08:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workflow_bpmn', '0005_job_workflow_version'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobhistory',
            name='job_id',
            field=models.ForeignKey(db_column='job_id', on_delete=django.db.models.deletion.CASCADE, related_name='histories', to='workflow_bpmn.Job'),
        ),
    ]
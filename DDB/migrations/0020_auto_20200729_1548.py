# Generated by Django 3.0 on 2020-07-29 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0019_auto_20200723_1009'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='releasebuildsinfo',
            name='buildName',
        ),
        migrations.RemoveField(
            model_name='releasebuildsinfo',
            name='failureCount',
        ),
        migrations.RemoveField(
            model_name='releasebuildsinfo',
            name='jobName',
        ),
        migrations.RemoveField(
            model_name='releasebuildsinfo',
            name='successCount',
        ),
        migrations.AlterField(
            model_name='releasebuildsinfo',
            name='buildResult',
            field=models.CharField(blank=True, default='UNKNOWN', max_length=20),
        ),
        migrations.AlterField(
            model_name='releasebuildsinfo',
            name='buildURL',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]

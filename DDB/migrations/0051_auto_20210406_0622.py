# Generated by Django 3.1.6 on 2021-04-06 06:22

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0050_auto_20210406_0618'),
    ]

    operations = [
        migrations.AddField(
            model_name='releases',
            name='PlatformsCli',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, default='UNKNOWN', max_length=10), blank=True, default=list, size=None),
        ),
        migrations.AddField(
            model_name='releases',
            name='PlatformsGui',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, default='UNKNOWN', max_length=10), blank=True, default=list, size=None),
        ),
    ]
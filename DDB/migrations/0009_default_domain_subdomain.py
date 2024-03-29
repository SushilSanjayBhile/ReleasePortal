# Generated by Django 3.0 on 2020-04-05 11:21

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0008_auto_20200405_1059'),
    ]

    operations = [
        migrations.CreateModel(
            name='DEFAULT_DOMAIN_SUBDOMAIN',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Domain', models.CharField(default='NOT PROVIDED', max_length=200)),
                ('SubDomain', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=200, null=True), blank=True, null=True, size=None)),
            ],
        ),
    ]

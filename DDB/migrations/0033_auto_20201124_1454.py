# Generated by Django 3.0 on 2020-11-24 14:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0032_auto_20201124_1448'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='releases',
            name='epicLink',
        ),
        migrations.RemoveField(
            model_name='releases',
            name='fixVersion',
        ),
    ]
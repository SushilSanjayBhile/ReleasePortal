# Generated by Django 3.0 on 2020-11-23 11:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0025_auto_20201119_1513'),
    ]

    operations = [
        migrations.AddField(
            model_name='tc_info',
            name='epicLink',
            field=models.TextField(blank=True, default='UNKNOWN'),
        ),
        migrations.AddField(
            model_name='tc_info',
            name='fixVersion',
            field=models.TextField(blank=True, default='UNKNOWN'),
        ),
    ]
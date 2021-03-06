# Generated by Django 3.0 on 2021-01-18 08:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0039_auto_20201124_1524'),
    ]

    operations = [
        migrations.AddField(
            model_name='releases',
            name='ParentRelease',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='tc_info',
            name='UnapproveTCReason',
            field=models.TextField(blank=True, default='NO REASON PROVIDED'),
        ),
        migrations.AddField(
            model_name='tc_info_gui',
            name='UnapproveTCReason',
            field=models.TextField(blank=True, default='NO REASON PROVIDED'),
        ),
    ]

# Generated by Django 3.0 on 2020-11-24 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0034_auto_20201124_1456'),
    ]

    operations = [
        migrations.AlterField(
            model_name='releases',
            name='epicLink',
            field=models.TextField(blank=True, default='UNKNOWN', null=True),
        ),
        migrations.AlterField(
            model_name='releases',
            name='fixVersion',
            field=models.TextField(blank=True, default='UNKNOWN', null=True),
        ),
    ]

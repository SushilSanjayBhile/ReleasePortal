# Generated by Django 3.2.1 on 2021-05-10 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0059_alter_latest_tc_status_cardtype'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tc_status',
            name='CardType',
            field=models.CharField(default='BOS/NYNJ', max_length=10),
        ),
    ]
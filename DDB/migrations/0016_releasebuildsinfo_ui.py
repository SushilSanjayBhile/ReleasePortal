# Generated by Django 3.0 on 2020-07-23 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DDB', '0015_auto_20200619_0722'),
    ]

    operations = [
        migrations.CreateModel(
            name='RELEASEBUILDSINFO',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jobName', models.CharField(max_length=100)),
                ('buildNumber', models.IntegerField()),
                ('buildResult', models.CharField(max_length=20)),
                ('buildURL', models.CharField(max_length=100)),
                ('timeStamp', models.CharField(max_length=30)),
                ('buildName', models.CharField(max_length=100)),
            ],
        ),
    ]
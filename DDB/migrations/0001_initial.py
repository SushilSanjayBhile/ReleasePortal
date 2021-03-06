# Generated by Django 3.0 on 2020-03-04 11:46

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AGGREGATE_TC_STATE',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Domain', models.CharField(blank=True, max_length=50)),
                ('Total', models.IntegerField(default=0)),
                ('Automated', models.IntegerField(default=0)),
                ('Pass', models.IntegerField(default=0)),
                ('Fail', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='DEFAULT_DOMAIN',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Domain', models.CharField(blank=True, default='NOT PROVIDED', max_length=100)),
                ('User', models.CharField(blank=True, default='NOT PROVIDED', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='DEFAULT_SUBDOMAIN',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Domain', models.IntegerField(blank=True, default=-1)),
                ('SubDomain', models.CharField(blank=True, default='NOT PROVIDED', max_length=100)),
                ('User', models.CharField(blank=True, default='NOT PROVIDED', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='DEFAULT_VALUES',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(default='NOT PROVIDED', max_length=100)),
                ('value', models.CharField(default='NOT PROVIDED', max_length=250)),
            ],
        ),
        migrations.CreateModel(
            name='E2E',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('User', models.CharField(default='UNKNOWN', max_length=100)),
                ('Date', models.DateTimeField(blank=True, null=True)),
                ('Build', models.CharField(blank=True, max_length=100, null=True)),
                ('Tag', models.CharField(blank=True, max_length=100, null=True)),
                ('Result', models.CharField(blank=True, max_length=14, null=True)),
                ('Bug', models.CharField(blank=True, max_length=500, null=True)),
                ('CardType', models.CharField(blank=True, max_length=100, null=True)),
                ('NoOfTCsPassed', models.IntegerField(blank=True, null=True)),
                ('E2EFocus', models.TextField(blank=True, null=True)),
                ('E2ESkipList', models.TextField(blank=True, null=True)),
                ('Setup', models.TextField(blank=True, null=True)),
                ('Notes', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='LATEST_TC_STATUS',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('TcID', models.CharField(max_length=200)),
                ('TcName', models.CharField(blank=True, max_length=2000)),
                ('Build', models.CharField(blank=True, max_length=1000)),
                ('Result', models.CharField(blank=True, max_length=14)),
                ('Bugs', models.CharField(blank=True, max_length=500)),
                ('Date', models.DateTimeField(auto_now=True)),
                ('Domain', models.CharField(blank=True, max_length=50)),
                ('SubDomain', models.CharField(blank=True, max_length=50)),
                ('CardType', models.CharField(default='NOT ENTERED', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='LOGS',
            fields=[
                ('logNo', models.AutoField(primary_key=True, serialize=False)),
                ('UserName', models.CharField(default='UNKNOWN', max_length=100)),
                ('Timestamp', models.DateTimeField(auto_now=True)),
                ('RequestType', models.CharField(max_length=10)),
                ('LogData', models.TextField()),
                ('URL', models.CharField(blank=True, max_length=100, null=True)),
                ('TcID', models.CharField(blank=True, default='NO ID PROVIDED', max_length=200)),
                ('CardType', models.CharField(blank=True, default='NO CARD PROVIDED', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='LONGEVITY',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('User', models.CharField(default='UNKNOWN', max_length=100)),
                ('Date', models.DateTimeField(blank=True, null=True)),
                ('Build', models.CharField(blank=True, max_length=100, null=True)),
                ('Result', models.CharField(blank=True, max_length=14, null=True)),
                ('Bugs', models.CharField(blank=True, max_length=500, null=True)),
                ('CardType', models.CharField(blank=True, max_length=100, null=True)),
                ('NoOfDuration', models.IntegerField(blank=True, null=True)),
                ('Notes', models.TextField(blank=True, null=True)),
                ('Setup', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='RELEASES',
            fields=[
                ('ReleaseNumber', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('BuildNumberList', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=50), blank=True, size=None)),
                ('Engineers', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=50, null=True), blank=True, null=True, size=None)),
                ('CardType', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=100), blank=True, size=None)),
                ('ServerType', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=100), blank=True, size=None)),
                ('SetupsUsed', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=100), blank=True, size=None)),
                ('QAStartDate', models.DateTimeField(blank=True, null=True)),
                ('TargetedReleaseDate', models.DateTimeField(blank=True, null=True)),
                ('ActualReleaseDate', models.DateTimeField(blank=True, null=True)),
                ('TargetedCodeFreezeDate', models.DateTimeField(blank=True, null=True)),
                ('UpgradeTestingStartDate', models.DateTimeField(blank=True, null=True)),
                ('UpgradeMetrics', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=100), blank=True, null=True, size=None)),
                ('Customers', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, max_length=100), blank=True, size=None)),
                ('FinalBuild', models.CharField(blank=True, max_length=100)),
                ('FinalOS', models.CharField(blank=True, max_length=100)),
                ('FinalDockerCore', models.CharField(blank=True, max_length=100)),
                ('UbootVersion', models.CharField(blank=True, max_length=100)),
                ('RedFlagsRisks', models.TextField(blank=True)),
                ('AutomationSyncUp', models.TextField(blank=True)),
                ('QARateOfProgress', models.IntegerField(blank=True, default=-1)),
                ('Priority', models.CharField(blank=True, max_length=2, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='STRESS',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('User', models.CharField(default='UNKNOWN', max_length=100)),
                ('Date', models.DateTimeField(blank=True, null=True)),
                ('Build', models.CharField(blank=True, max_length=100, null=True)),
                ('CardType', models.CharField(blank=True, max_length=100, null=True)),
                ('CfgFileUsed', models.CharField(blank=True, max_length=100, null=True)),
                ('Result', models.CharField(blank=True, max_length=14, null=True)),
                ('LinkFlap', models.CharField(blank=True, max_length=14, null=True)),
                ('NoOfIteration', models.IntegerField(blank=True, null=True)),
                ('Bugs', models.CharField(blank=True, max_length=500, null=True)),
                ('Notes', models.TextField(blank=True, null=True)),
                ('Setup', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='TC_INFO',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('TcID', models.CharField(max_length=200)),
                ('TcName', models.CharField(blank=True, default='NOT AUTOMATED', max_length=2000)),
                ('Domain', models.CharField(blank=True, default='UNKNOWN', max_length=50)),
                ('SubDomain', models.CharField(blank=True, default='UNKNOWN', max_length=50)),
                ('Scenario', models.CharField(blank=True, default='UNKNOWN', max_length=200)),
                ('Description', models.TextField(blank=True, default='NO DESCRIPTION PROVIDED')),
                ('Steps', models.TextField(blank=True, default='NO STEPS PROVIDED')),
                ('ExpectedBehaviour', models.CharField(blank=True, default='NO EXPECTED BEHAVIOUR PROVIDED', max_length=5000)),
                ('Notes', models.CharField(blank=True, default='NO NOTES PROVIDED', max_length=2000)),
                ('CardType', models.CharField(blank=True, default=None, max_length=100)),
                ('ServerType', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, default=None, max_length=10), blank=True, size=None)),
                ('WorkingStatus', models.CharField(blank=True, default='CREATED', max_length=50)),
                ('Date', models.DateTimeField(auto_now=True)),
                ('Assignee', models.CharField(blank=True, default='UNKNOWN', max_length=50)),
                ('Creator', models.CharField(blank=True, default='ANONYMOUS', max_length=50)),
                ('Tag', models.CharField(blank=True, default='NO TAG', max_length=20)),
                ('Priority', models.CharField(blank=True, default='P4', max_length=5)),
            ],
        ),
        migrations.CreateModel(
            name='TC_STATUS',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('TcID', models.CharField(max_length=200)),
                ('TcName', models.CharField(blank=True, max_length=2000)),
                ('Build', models.CharField(blank=True, max_length=1000)),
                ('Result', models.CharField(blank=True, max_length=14)),
                ('Bugs', models.CharField(blank=True, max_length=500)),
                ('Date', models.DateTimeField(auto_now=True)),
                ('Domain', models.CharField(blank=True, max_length=50)),
                ('SubDomain', models.CharField(blank=True, max_length=50)),
                ('CardType', models.CharField(default='BOS/NYNJ', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='TC_STATUS_GUI',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('TcID', models.CharField(max_length=200)),
                ('BuildUbuntuChrome', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('BuildUbuntuFirefox', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('BuildWindowsChrome', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('BuildWindowsFirefox', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('BuildWindowsIE', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('BuildMacSafari', models.CharField(blank=True, default='BLANK', max_length=20)),
                ('ResultUbuntuChrome', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('ResultUbuntuFirefox', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('ResultWindowsIE', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('ResultWindowsChrome', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('ResultWindowsFirefox', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('ResultMacSafari', models.CharField(blank=True, default='NOT TESTED', max_length=20)),
                ('Bug', models.CharField(blank=True, default='NO BUG', max_length=500)),
                ('Date', models.DateTimeField(blank=True)),
                ('Domain', models.CharField(blank=True, default='UNKNOWN', max_length=50)),
                ('SubDomain', models.CharField(blank=True, default='UNKNOWN', max_length=50)),
                ('CardType', models.CharField(blank=True, default='BLANK', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='USER_INFO',
            fields=[
                ('name', models.CharField(blank=True, max_length=100)),
                ('email', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('role', models.CharField(default='ENGG', max_length=10)),
                ('Gender', models.CharField(blank=True, choices=[('M', 'MALE'), ('F', 'FEMALE')], max_length=1, null=True)),
                ('BloodGroup', models.CharField(blank=True, choices=[('O+ve', 'O+ve'), ('O-ve', 'O-ve'), ('A+ve', 'A+ve'), ('A-ve', 'A-ve'), ('AB+ve', 'AB+ve'), ('AB-ve', 'AB-ve'), ('B+ve', 'B+ve'), ('B-ve', 'B-ve')], max_length=5, null=True)),
                ('Qualification', models.CharField(blank=True, max_length=20, null=True)),
                ('PreviousWorkExperienceInMonth', models.IntegerField(blank=True, null=True)),
                ('DateOfJoining', models.DateTimeField(blank=True, null=True)),
                ('DateOfBirth', models.DateTimeField(blank=True, null=True)),
                ('ContactNumber', models.CharField(blank=True, max_length=13, null=True)),
                ('PersonalEmail', models.CharField(blank=True, max_length=100, null=True)),
                ('PreviousCompany', models.CharField(blank=True, max_length=100, null=True)),
                ('TShirtSize', models.CharField(blank=True, max_length=10, null=True)),
                ('Address', models.TextField(blank=True, null=True)),
                ('City', models.CharField(blank=True, max_length=20, null=True)),
                ('PinCode', models.CharField(blank=True, max_length=6, null=True)),
                ('State', models.CharField(blank=True, max_length=20, null=True)),
                ('EmergencyContactNumber', models.CharField(blank=True, max_length=13, null=True)),
                ('EmenrgencyContactPersonName', models.CharField(blank=True, max_length=50, null=True)),
                ('EmergencyCOntactPersonRelation', models.CharField(blank=True, max_length=20, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='SETUP_INFO',
            fields=[
                ('SetupName', models.CharField(max_length=20, primary_key=True, serialize=False)),
                ('Inventory', models.CharField(max_length=5000)),
                ('ClusterState', models.CharField(choices=[('Failed', 'Failed'), ('Good', 'Good')], max_length=6)),
                ('ClusterStatus', models.CharField(choices=[('Idle', 'Idle'), ('In-use', 'In-Use')], max_length=6)),
                ('CurrentUserId', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.PROTECT, related_name='User', to='DDB.USER_INFO')),
                ('OwnerId', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='Owner', to='DDB.USER_INFO')),
            ],
        ),
        migrations.CreateModel(
            name='SANITY_RESULTS',
            fields=[
                ('SanityId', models.AutoField(primary_key=True, serialize=False)),
                ('Tag', models.CharField(choices=[('Daily', 'Daily'), ('Weekly', 'Weekly'), ('Sanity', 'Sanity')], default='Daily', max_length=6)),
                ('Build', models.CharField(max_length=10)),
                ('Result', models.CharField(choices=[('Pass', 'Pass'), ('Fail', 'Fail')], max_length=10)),
                ('Logs', models.TextField()),
                ('Timestamp', models.DateTimeField(blank=True)),
                ('Setup', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='DDB.SETUP_INFO')),
            ],
        ),
    ]

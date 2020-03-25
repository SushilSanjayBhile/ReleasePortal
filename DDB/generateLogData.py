#from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI
from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm
from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER

from .createDB import createReleaseDB

# Third party softwares / libraries
import gzip
import psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from .latestStatusUpdate import updateLatestStatus

def GenerateLogData(UserName, RequestType, url, logData, tcid, card, Release):
    Logs = json.dumps(logData)
    Timestamp = datetime.datetime.now()
    data = {'UserName': UserName, 'RequestType': RequestType, 'LogData': logData, 'Timestamp': Timestamp, 'URL': url, 'TcID': tcid, 'CardType': card}
    fd = LogForm(data)
    if fd.is_valid():
        print(data)
        data = fd.save(commit = False)
        data.save(using = Release)
    else:
        print("INVALID", fd.errors)


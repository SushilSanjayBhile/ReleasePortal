# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, LATEST_TC_STATUS
from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm, LatestStatusForm
from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER
from .latestStatusUpdate import latestResultUpdateFunction
import datetime
from .forms import LogForm

from .createDB import createReleaseDB

# Third party softwares / libraries
import gzip
import psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

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

@csrf_exempt
def TC_STATUS_UPDATE_VIEW(request, Release):
    if request.method == "POST":
        errRecords = []
        request = json.loads(request.body.decode("utf-8"))

        for req in request:
            data = TC_INFO.objects.using(Release).filter(TcID = req['TcID'])
            serializer = TC_INFO_SERIALIZER(data, many = True)
            data = json.dumps(serializer.data)
            data = json.loads(data)
            req['TcName'] = data[0]['TcName']

            fd = TcStatusForm(req)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            else:
                print(req, fd.errors)
                errRecords.append(req)

        latestResultUpdateFunction(Release)

        if len(errRecords) > 0:
            return HttpResponse(fd.errors, status = 500)
        return HttpResponse("All records updated successfully", status  = 200)


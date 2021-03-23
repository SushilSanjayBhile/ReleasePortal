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
from .forms import LatestStatusForm
from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER
#from .generateLogData import GenerateLogData

# Third party softwares / libraries
import gzip
import psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from .tcinfo import updateStatusData

def updateDomainSubDomain(Release):
    infoData = TC_INFO.objects.using(Release).all()
    infoSerializer = TC_INFO_SERIALIZER(infoData, many = True)

    statusData = TC_STATUS.objects.using(Release).all()
    statusSerializer = TC_STATUS_SERIALIZER(statusData, many = True)

    for status in statusSerializer.data:
        if status['CardType'] == "NOT FOUND":
            for info in infoSerializer.data:
                if info['TcID'] == status['TcID']:
                    tcInfo = TC_INFO_SERIALIZER(info)
                    stat = TC_STATUS_SERIALIZER(status)
                    updatedData = stat.data

                    updatedData['TcName'] = tcInfo.data['TcName']
                    updatedData['Domain'] = tcInfo.data['Domain']
                    updatedData['SubDomain'] = tcInfo.data['SubDomain']
                    updatedData['CardType'] = tcInfo.data['CardType']

                    s = TC_STATUS.objects.using(Release).get(id = status['id'])

                    updateStatusData(updatedData, s, Release)

def updateLatestStatus(Release, CardType, TcID, statusDict):
    try:
        status = LATEST_TC_STATUS.objects.using(Release).filter(TcID = TcID).get(CardType = CardType)
        statusSerializer = TC_STATUS_SERIALIZER(status)
        
        updatedData = statusSerializer.data
        updatedData['Build'] = statusDict['Build']
        updatedData['Result'] = statusDict['Result']
        try:
            updatedData['Bugs'] = statusDict['Bugs']
        except:
            pass
        try:
            updatedData['Date'] = statusDict['Date']
        except:
            pass

        updateStatusData(updatedData, status, Release)
    except:
        fd = LatestStatusForm(statusDict)
        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
        else:
            print(fd.errors)

def latestResultUpdateFunction(Release):
    data = TC_STATUS.objects.using(Release).all().order_by("Date")
    serializer = TC_STATUS_SERIALIZER(data, many = True)
    
    statusDict = {}
    
    for status in serializer.data:
        cardType = status["CardType"]
        tcid = status["TcID"]
    
        if cardType not in statusDict:
            statusDict[cardType] = {}
    
        statusDict[cardType][tcid] = status
        
    for CardType in statusDict:
        for TcID in statusDict[CardType]:
            updateLatestStatus(Release, CardType, TcID, statusDict[CardType][TcID])
    #updateDomainSubDomain(Release)
    
    latestData = LATEST_TC_STATUS.objects.using(Release).all()
    latestSerializer = LATEST_TC_STATUS_SERIALIZER(latestData, many = True)
    
    print(len(serializer.data), len(latestSerializer.data))
    
    #return HttpResponse(serializer.data)


@csrf_exempt
def LATEST_STATUS_VIEW_UPDATE_ALL(request, Release):
    if request.method == "GET":
        latestResultUpdateFunction(Release)
        return HttpResponse("SUCESS")

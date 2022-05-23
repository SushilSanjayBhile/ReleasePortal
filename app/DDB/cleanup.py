from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import Trunc
import json, time

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, TC_INFO_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LATEST_TC_STATUS
from .forms import TcInfoForm
from django.db.models import Q

import datetime
from .forms import LogForm
from .latestStatusUpdate import updateLatestStatus, latestResultUpdateFunction

@csrf_exempt
def RemoveStatus(request, Release):
    lateststatusData = LATEST_TC_STATUS.objects.using(Release).filter(Domain = "User Management")
    #lateststatusData = LATEST_TC_STATUS.objects.using(Release).filter(Domain = "User Management", Build = 184, Result = "Pass")
    lateststatusSerializer = LATEST_TC_STATUS_SERIALIZER(lateststatusData, many = True)

    for status in lateststatusSerializer.data:
        card = status["CardType"]
        tcid = status["TcID"]
        domain = status["Domain"]
        build = status["Build"]
        result = status["Result"]
        #print(card, tcid, domain, build, result)
        #DANGEROUS STATEMENT #####    LATEST_TC_STATUS.objects.using(Release).get(id = status["id"]).delete()

    statusData = TC_STATUS.objects.using(Release).filter(Domain = "User Management", Build = 184, Result = "Pass").order_by('Date')
    statusSerializer = TC_STATUS_SERIALIZER(statusData, many = True)

    latestStatusDict = {}
    for status in statusSerializer.data:
        card = status["CardType"]
        tcid = status["TcID"]
        build = status["Build"]
        result = status["Result"]
        domain = status["Domain"]
        #print(card, tcid, build, result, domain)

        #DANGEROUS STATEMENT TC_STATUS.objects.using(Release).get(id = status["id"]).delete()

        #DANGEROOUS STATEMENT updateLatestStatus(Release, card, tcid, status)
    #statusData = TC_STATUS.objects.using(Release).filter(Domain = "User Management").order_by('Date')
    #statusSerializer = TC_STATUS_SERIALIZER(statusData, many = True)

    #latestDict = {}
    #c = 0
    #for status in statusSerializer.data:
    #    c += 1
    #    latestDict[status["TcID"]] = 1
    #    print(c, len(latestDict))

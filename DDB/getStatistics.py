# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, LATEST_TC_STATUS, \
        DEFAULT_DOMAIN_SUBDOMAIN, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_LATEST_TC_STATUS

from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm, \
        DomainSubDomainForm

from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, \
    DOMAIN_SUBDOMAIN_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER

from .createDB import createReleaseDB

import datetime
from .forms import LogForm

# Third party softwares / libraries
import gzip
import psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from .latestStatusUpdate import updateLatestStatus, latestResultUpdateFunction
from .tcinfo import updateStatusData

@csrf_exempt
def BUG_WISE_BLOCKED_TCS(request, Release):
    if request.method == "GET":
        blockedDict = {}

        # cli blocker bugs
        data = LATEST_TC_STATUS.objects.using(Release).all()
        serializer = LATEST_TC_STATUS_SERIALIZER(data, many=True)

        for tc in serializer.data:
            if tc["Result"] == 'Blocked':
                if tc["Bugs"] != '':
                    print(tc["Result"], tc["Bugs"])
                    if tc["Bugs"] in blockedDict:
                        blockedDict[tc["Bugs"]] += 1
                    else:
                        blockedDict[tc["Bugs"]] = 1

        # GUI blocker bugs
        data = GUI_LATEST_TC_STATUS.objects.using(Release).all()
        serializer = LATEST_TC_STATUS_GUI_SERIALIZER(data, many=True)

        for tc in serializer.data:
            if tc["Result"] == 'Blocked':
                if tc["Bugs"] != '':
                    if tc["Bugs"] in blockedDict:
                        blockedDict[tc["Bugs"]] += 1
                    else:
                        blockedDict[tc["Bugs"]] = 1
        print("blocked dict value",blockedDict)

        #blockedDict = sorted(blockedDict.items(), key=lambda x: x[1], reverse=True)
        return HttpResponse(json.dumps(blockedDict))

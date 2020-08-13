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
        DEFAULT_DOMAIN_SUBDOMAIN, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_LATEST_TC_STATUS,GUI_TC_STATUS

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
from .views import get_cli_dataDict,get_gui_dataDict
@csrf_exempt
def BUG_WISE_BLOCKED_TCS(request, Release):
    if request.method == "GET":
        
        cliTcInfo = TC_INFO.objects.using(Release).all()
        cliStatus = TC_STATUS.objects.using(Release).all().order_by('-Date')
        cid,csd = get_cli_dataDict(cliTcInfo,cliStatus)

        # GUI TC INFO AND STATUS
        guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
        guiStatus = GUI_TC_STATUS.objects.using(Release).all().order_by('-Date')
        gid,gsd = get_gui_dataDict(guiTcInfo,guiStatus)

        blockedDict = {}
        clilateststatuslist = []
        guilateststatuslist = []

        for domain in csd:
            for card in csd[domain]:
                for tc in csd[domain][card]:
                    clilateststatuslist.append(csd[domain][card][tc])
        
        
        for stat in clilateststatuslist:
            sres = stat["Result"]
            stcname = stat["TcName"]
            
            try:
                spriority = stat["Priority"]
            except:
                continue

            #priority check
            if spriority != "Skip" and spriority != "NA":
                try:
                    if stat["Bugs"] != '':
                        if stat["Bugs"] in blockedDict:
                            blockedDict[stat["Bugs"]] += 1
                        else:
                            blockedDict[stat["Bugs"]] = 1
                except:
                    pass
        
        
        for id in gsd:
            try:
                sres = gsd[id]["Result"]
                sprior = gsd[id]["Priority"]

                if sprior != "Skip" and sprior != "NA":
            
                    if gsd[id]["Bugs"] != '':
                        if gsd[id]["Bugs"] in blockedDict:
                            blockedDict[gsd[id]["Bugs"]] += 1
                        else:
                            blockedDict[gsd[id]["Bugs"]] = 1
            except:
                pass


            #for card in gsd[domain]:
            #    for tc in gsd[domain][card]:
            #        guilateststatuslist.append(gsd[domain][card][tc])
        
       # for stat in guilateststatuslist:
       #     sres = stat["Result"]
       #     stcname = stat["TcName"]
       #     spriority = stat["Priority"]

       #     #priority check
       #     if spriority != "Skip" and spriority != "NA":
       #         try:
       #             if stat["Bugs"] != '':
       #                 if stat["Bugs"] in blockedDict:
       #                     print(sres,stat["Bugs"])
       #                     blockedDict[stat["Bugs"]] += 1
       #                 else:
       #                     blockedDict[stat["Bugs"]] = 1
       #         except:
       #             pass

        print("blocked dict value",blockedDict)
        #blockedDict = sorted(blockedDict.items(), key=lambda x: x[1], reverse=True)
        return HttpResponse(json.dumps(blockedDict))

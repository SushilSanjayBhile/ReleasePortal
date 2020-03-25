# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI
from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm
from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER

# Third party softwares / libraries
import gzip
import psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from .latestStatusUpdate import latestResultUpdateFunction        

errorTCs = []
sucessTCs = []

passCount = 0
failCount = 0
skipCount = 0

def updateStatusFunc(domain, subdomain, tcid, tcname, build, result, cardtype, Release):
    statusDict = {}
    global errorTCs, sucessTCs
    global passCount, failCount, skipCount

    statusDict['Domain'] = domain
    statusDict['SubDomain'] = subdomain
    statusDict['TcID'] = tcid
    statusDict['TcName'] = tcname
    statusDict['Build'] = build
    statusDict['Result'] = result
    statusDict['CardType'] = cardtype

    if "pass" in result.lower():
        passCount += 1
    elif "fail" in result.lower():
        failCount += 1
    else:
        skipCount += 1

    fd = TcStatusForm(statusDict)
    if fd.is_valid():
        data = fd.save(commit = False)
        data.save(using = Release)
        sucessTCs.append(tcid)
    else:
        errorTCs.append(tcid)

@csrf_exempt
def e2eResultUpdate(request):
    global errorTCs, sucessTCs
    global passCount, failCount, skipCount
    passCount = 0
    failCount = 0
    skipCount = 0

    errorTCs = []
    sucessTCs = []

    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))

        if "master" in req["drive_dir_name"].lower():
            Release = "master"
        elif "ga-" in req["drive_dir_name"].lower():
            Release = req["drive_dir_name"].split("-")[-1]
        else:
            return HttpResponse(json.dumps({"ERROR":"UNABLE TO IDENTIFY RELEASE NUMBER. PROVIDE LIKE: GA-2.3.0/GA-<number>/Master"}))

        if 'drive_sub_directory' in req:
            CardType = req['drive_sub_directory']
        else:
            return HttpResponse(json.dumps({"ERROR":"UNABLE TO IDENTIFY SUB DIRECTORY NAME"}))
        if 'build_name' in req:
            build = req['build_name']
        else:
            return HttpResponse(json.dumps({"ERROR":"UNABLE TO IDENTIFY BUILD NUMBER. PLEASE PROVIDE IN COMMAND LINE ARGUMENT LIKE ./non_jenkins_user_update_sheets.sh -f log -d GA-2.3.0 -s NYNJ"}))

        if "pass_name_list" in req:
            for tc in req['pass_name_list']:
                statusDict = {}
                try:
                    singleTc = TC_INFO.objects.using(Release).filter(TcName = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)
                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Pass", CardType, Release)
                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).get(TcName = tc)
                        serializer = TC_INFO_SERIALIZER(singleTc)
                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Pass", CardType, Release)
                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", "NOT FOUND", tc, build, "Pass", "NOT FOUND", Release)
                        #errorTCs.append(tc)

            for tc in req['fail_name_list']:
                statusDict = {}
                try:
                    singleTc = TC_INFO.objects.using(Release).filter(TcName = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)

                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Fail", CardType, Release)

                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).get(TcName = tc)
                        serializer = TC_INFO_SERIALIZER(singleTc)

                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Fail", CardType, Release)
                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", "NOT FOUND", tc, build, "Fail", "NOT FOUND", Release)
                        #errorTCs.append(tc)
            for tc in req['skipped_name_list']:
                statusDict = {}
                try:
                    singleTc = TC_INFO.objects.using(Release).filter(TcName = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)

                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Skip", CardType, Release)

                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).get(TcName = tc)
                        serializer = TC_INFO_SERIALIZER(singleTc)

                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Skip", CardType, Release)

                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", "NOT FOUND", tc, build, "Skip", "NOT FOUND", Release)
                        #errorTCs.append(tc)
        else:
            for tc in req['pass_id_list']:
                try:
                    statusDict = {}
                    singleTc = TC_INFO.objects.using(Release).filter(TcID = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)
                
                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Pass", CardType, Release)

                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).get(TcID = tc)
                        serializer = TC_INFO_SERIALIZER(singleTc)
                
                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Pass", CardType, Release)

                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", tc, "NOT FOUND", build, "Pass", "NOT FOUND", Release)
                        #errorTCs.append(tc)

            for tc in req['fail_id_list']:
                try:
                    statusDict = {}
                    singleTc = TC_INFO.objects.using(Release).filter(TcID = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)
                
                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Fail", CardType, Release)

                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).get(TcID = tc)
                        serializer = TC_INFO_SERIALIZER(singleTc)
                
                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Fail", CardType, Release)

                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", tc, "NOT FOUND", build, "Fail", "NOT FOUND", Release)
                        #errorTCs.append(tc)

            for tc in req['skipped_id_list']:
                try:
                    statusDict = {}
                    singleTc = TC_INFO.objects.using(Release).filter(TcID = tc).get(CardType= CardType)
                    serializer = TC_INFO_SERIALIZER(singleTc)
                
                    updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Skip", CardType, Release)

                except:
                    try:
                        singleTc = TC_INFO.objects.using(Release).filter(TcID = tc).get(CardType= CardType)
                        serializer = TC_INFO_SERIALIZER(singleTc)
                
                        updateStatusFunc(serializer.data['Domain'], serializer.data['SubDomain'], serializer.data['TcID'], serializer.data['TcName'], build, "Skip", CardType, Release)

                    except:
                        updateStatusFunc("NOT FOUND", "NOT FOUND", tc, "NOT FOUND", build, "Skip", "NOT FOUND", Release)
                        #errorTCs.append(tc)

        latestResultUpdateFunction(Release)

        if len(errorTCs) > 0:
            return HttpResponse(json.dumps([{"ERROR UPDATING FOLLOWING TCs IN RELEASE DATABASE. TC WITH GIVEN ID DOES NOT EXIST: " + str(len(errorTCs)) :errorTCs}, {"SUCCESSFULLY UPDATED FOLLOWING TCS " + str(len(sucessTCs)) : sucessTCs}]))
        return HttpResponse(json.dumps({"SUCESS":"ALL RECORDS SUCCESFULLY UPDATED. Pass: " + str(passCount) + " ,fail: " + str(failCount) + " ,Skip: " + str(skipCount)}))

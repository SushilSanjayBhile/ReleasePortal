# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO, TC_STATUS, USER_INFO, LOGS, RELEASES, AGGREGATE_TC_STATE, TC_STATUS_GUI, LATEST_TC_STATUS, \
        DEFAULT_DOMAIN_SUBDOMAIN, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LOGSGUI

from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm, \
        DomainSubDomainForm

from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, GUI_LOGS_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, \
    DOMAIN_SUBDOMAIN_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER , TC_INFO_GUI_SERIALIZER

from .createDB import createReleaseDB

import datetime
from datetime import timedelta
from django.utils import timezone
from .forms import LogForm
from .new import rootRelease

# Third party softwares / libraries
import gzip, copy, psycopg2
from sh import pg_dump
from psycopg2 import sql
import json, datetime, os, time
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from .latestStatusUpdate import updateLatestStatus, latestResultUpdateFunction
from .tcinfo import updateStatusData, duplicate_clitc_ddmtodd330
from .gui import duplicate_guitc_ddmtodd330
from dp import settings
# GLOBAL VARIABLES
statusList = ['Pass', 'Fail', 'Skip', 'Blocked']


@csrf_exempt
def FIXVERSION(request):
    if request.method == "GET":
        data = RELEASES.objects.all().values('fixVList').using('universal').get(ReleaseNumber = rootRelease)
        return HttpResponse(json.dumps(data))
    elif request.method == "PUT":
        try:
            req = json.loads(request.body.decode("utf-8"))
            tdata  = RELEASES.objects.using('universal').get(ReleaseNumber = rootRelease)
            serializer = RELEASE_SERIALIZER(tdata)
            serData = json.dumps(serializer.data)

            for i in req['fixVList']:
                if i['value'] in tdata.fixVList and i['isChecked'] == False:
                    tdata.fixVList.remove(i['value'])
                    tdata.save()
                if i['value'] not in tdata.fixVList and i['isChecked'] == True:
                    tdata.fixVList.append(i['value'])
                    tdata.save()
            return HttpResponse(" UPDATED SUCCESSFULLY", status = 200)
        except:
            return HttpResponse("SOME ERROR OCCURED", status = 400)

def createDB(release):
    con = psycopg2.connect(dbname='postgres',
        user=userName, host='',
        password=passwd)

    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cur = con.cursor()

    # verifying for database does not exist
    cur.execute(sql.SQL("select datname from pg_database;"))
    rows = cur.fetchall()
    for row in rows:
        if release in row:
        	return 0

    # creating and granting privileges to database
    cur.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(release))
        )

    cur.execute(sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} to {}").format(
            sql.Identifier(release), sql.Identifier(userName))
        )


    string = "echo " + hostName + ":" + portNumber + ":" + release + ":" + userName + ":" + passwd
    os.system(string + ">> ~/.pgpass")

    os.system("pg_dump -h localhost -U " + userName + " -Fc master -f backup.sql")
    os.system("pg_restore -h localhost -d " + release + " -U " + userName + " backup.sql")

    lineNo = 0
    with open('dp/settings.py', 'r') as fp:
        f = fp.readlines()
        for line in f:
            lineNo += 1
            if "DATABASES = {" in line:
                
                string = """    '{release}': {{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '{release}',
        'USER': userName,
        'PASSWORD': passwd,
        'HOST': hostName,
        'PORT': portNumber,
        }},
"""
                finalString = string.format(release=release, userName=userName, passwd=passwd, hostName=hostName, portNumber=portNumber)
                f.insert(lineNo, finalString)
                contents = "".join(f)
    fp.close()

    newfp = open("dp/newsettings.py", "w+")
    newfp.write(contents)
    newfp.close()

    os.system("cp dp/settings.py dp/oldsettings.py")
    os.system("mv dp/newsettings.py dp/settings.py")
    return 1

@csrf_exempt
def TCSTATUSGETPOSTVIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        #print(req)
        if "Activity" in req:
            AD = req['Activity']
            GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])

        data = TC_INFO.objects.using(Release).filter(TcID = req['TcID'])
        serializer = TC_INFO_SERIALIZER(data, many = True)
        data = json.dumps(serializer.data)
        data = json.loads(data)
        try:
            req['TcName'] = data[0]['TcName']
        except:
            req['TcName'] = data['TcName']

        try:
            print("THIS IS REQUEST", req)
        except:
            pass

        updateLatestStatus(Release, req['CardType'], req['TcID'], req)

        fd = TcStatusForm(req)
        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
        else:
            print(req, fd.errors)
        # return JsonResponse({'Error': fd.errors}, status = 400)
        return HttpResponse(fd.errors)

    elif request.method == "GET":
        data = TC_STATUS.objects.using(Release).all().order_by('TcID')
        # data = TC_STATUS.objects.using(Release).all().order_by('TcID')[:50]
        serializer = TC_STATUS_SERIALIZER(data, many=True)
        # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
        return HttpResponse(json.dumps(serializer.data))

    elif request.method == "PUT":
        req = json.loads(request.body.decode("utf-8"))

        # latest status update
        data = LATEST_TC_STATUS.objects.using(Release).filter(TcID = req["TcID"], CardType = req["CardType"], Result = "Fail")
        serializer = TC_STATUS_SERIALIZER(data, many=True)

        if len(serializer.data) == 0:
            return HttpResponse("You are updating result to non existent test case")

        record = serializer.data[0]

        stat = LATEST_TC_STATUS.objects.using(Release).get(id = record['id'])
        serializer = TC_STATUS_SERIALIZER(stat)
        newData = record
        newData["Bugs"] = req["Bugs"]

        updateStatusData(newData, stat, Release)

        # all status update
        data = TC_STATUS.objects.using(Release).filter(TcID = req["TcID"], CardType = req["CardType"], Result = "Fail").order_by('-Date')
        serializer = TC_STATUS_SERIALIZER(data, many=True)

        if len(serializer.data) == 0:
            return HttpResponse("You are updating result to non existent test case")

        record = serializer.data[0]

        stat = TC_STATUS.objects.using(Release).get(id = record['id'])
        serializer = TC_STATUS_SERIALIZER(stat)
        newData = record
        newData["Bugs"] = req["Bugs"]

        updateStatusData(newData, stat, Release)

        return HttpResponse("Sucess")

@csrf_exempt
def DOMAINWISETCSTATUS(request, Release, Domain):
    if request.method == "GET":
        AllInfoData = []

        infodata = TC_INFO.objects.using(Release).filter(Domain = Domain)
        if Domain == "GUI":
            statusdata = TC_STATUS_GUI.objects.using(Release).filter(Domain = Domain)
            statusserializer = TC_STATUS_GUI_SERIALIZER(statusdata, many=True)
        else:
            statusdata = TC_STATUS.objects.using(Release).filter(Domain = Domain)
            statusserializer = TC_STATUS_SERIALIZER(statusdata, many=True)

        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)

        d = json.dumps(statusserializer.data)
        d = json.loads(d)

        for info in infoserializer.data:
            stat = {}
            stat['TcID'] = info['TcID']
            stat['TcName'] = info['TcName']
            stat['Build'] = ''
            stat['Result'] = 'Not Tested'
            stat['Bugs'] = ''
            stat['Date'] = ''
            stat['Domain'] = info['Domain']
            stat['SubDomain'] = info['SubDomain']
            stat['CardType'] = info['CardType']

            try:
                for status in d:
                    if status['TcID'] == info['TcID'] and status['CardType'] == info['CardType']:
                        stat = status
                        d.remove(status)
                        AllInfoData.append(stat)
            except:
                pass
            AllInfoData.append(stat)
        return HttpResponse(json.dumps(AllInfoData))

@csrf_exempt
def DOMAINWISETCINFO(request, Release, Domain):
    if request.method == "GET":
        data = TC_INFO.objects.using(Release).filter(Domain = Domain)
        serializer = TC_INFO_SERIALIZER(data, many=True)
        # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
        return HttpResponse({len(serializer.data), json.dumps(serializer.data)})

#attaching tcid to tcinfo row 
def createInfoDict(data, Release):
    infoDict = {}

    for row in data:
        infoDict[row["id"]] = row

    return infoDict


@csrf_exempt
def GUITCSTATUSGETPOSTVIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        fd = GuiTcInfoForm(req)
        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        else:
            print(fd.errors)
            return JsonResponse({'Error': fd.errors}, status = 400)
        # GenerateLogData(1, 'POST', 'specificuserbyid/' + str(id) + " => " + json.dumps(req))
        return HttpResponse("SUCCESS")
        # return JsonResponse({'Success': "Record added successfully"}, status = 200)
    elif request.method == "GET":
        data = TC_STATUS_GUI.objects.using(Release).all()
        serializer = TC_STATUS_GUI_SERIALIZER(data, many = True)
        return HttpResponse(json.dumps(serializer.data))
        # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)

def get_cli_dataDict(cliTcInfo, cliStatus):

    cid = {} #cid stands for cli info dict
    csd = {} #csd stands for cli status dict  # csd consist of only latest tc status'

    tcinfoserializer = TC_INFO_SERIALIZER(cliTcInfo, many=True)
    #statusserializer = LATEST_TC_STATUS_SERIALIZER(cliStatus, many=True)
    statusserializer = TC_STATUS_SERIALIZER(cliStatus, many=True)
    for status in statusserializer.data:
        domain = status["Domain"]
        card = status["CardType"]
        tcid = status["TcID"]

        if domain not in csd:
            csd[domain]= {}
        if card not in csd[domain]:
            csd[domain][card] = {}
        if tcid not in csd[domain][card]:
            csd[domain][card][tcid] = status

    for tc in tcinfoserializer.data:
        domain = tc["Domain"]
        card = tc["CardType"]
        tcid = tc["TcID"]

        if domain not in cid:
            cid[domain]= {}

        if card not in cid[domain]:
            cid[domain][card] = {}

        if tcid not in cid[domain][card]:
            cid[domain][card][tcid] = tc

        try:
            cid[domain][card][tcid].update(csd[domain][card][tcid])
        except:
            pass
    return (cid,csd)
def platform_wise_domain_subdomain_cli_dict1(cliTcInfo, platformsCli):
    pwddcli = {}
    #platformsCli = cliTcInfo.values('Platform').distinct()
    #platformsCli = cliTcInfo.values('CardType').distinct()
    #print(platformsCli)
    for p in platformsCli:
        platform = p["CardType"]

        if len(platform) > 0:
            #for p in platform:
            if platform not in pwddcli:
                pwddcli[platform] = {}

            domainCliTcInfo = cliTcInfo.filter(CardType__contains = platform).values("Domain").distinct()
            for domain in domainCliTcInfo:
                domain = domain["Domain"]
                if domain not in pwddcli[platform]:
                    pwddcli[platform][domain] = []

                #subDomainCliTcInfo = domainCliTcInfo.all().values("SubDomain").distinct()
                subDomainCliTcInfo = domainCliTcInfo.filter(Domain__contains = domain).values("SubDomain").distinct()
                for subdomain in subDomainCliTcInfo:
                    subdomain = subdomain["SubDomain"]
                    if subdomain not in pwddcli[platform][domain]:
                        pwddcli[platform][domain].append(subdomain)
    return pwddcli
def platform_wise_domain_subdomain_gui_dict1(guiTcInfo, platformsGui):
    pwddgui = {}
    #platformsCli = cliTcInfo.values('Platform').distinct()
    #platformsGui = guiTcInfo.values('CardType').distinct()
    #print(platformsCli)
    for p in platformsGui:
        platform = p["CardType"]

        if len(platform) > 0:
            #for p in platform:
            if platform not in pwddgui:
                pwddgui[platform] = {}

            domainGuiTcInfo = guiTcInfo.filter(CardType__contains = platform).values("Domain").distinct()
            for domain in domainGuiTcInfo:
                domain = domain["Domain"]
                if domain not in pwddgui[platform]:
                    pwddgui[platform][domain] = []

                #subDomainCliTcInfo = domainCliTcInfo.all().values("SubDomain").distinct()
                subDomainGuiTcInfo = domainGuiTcInfo.filter(Domain__contains = domain).values("SubDomain").distinct()
                for subdomain in subDomainGuiTcInfo:
                    subdomain = subdomain["SubDomain"]
                    if subdomain not in pwddgui[platform][domain]:
                        pwddgui[platform][domain].append(subdomain)
    return pwddgui


def platform_wise_domain_subdomain_cli_dict(cliTcInfo):
    pwddcli = {}
    platformsCli = cliTcInfo.values('Platform').distinct()
    for p in platformsCli:
        platform = p["Platform"]

        if len(platform) > 0:
            for p in platform:
                if p not in pwddcli:
                    pwddcli[p] = {}

                domainCliTcInfo = cliTcInfo.filter(Platform__contains = [p]).values("Domain").distinct()
                for domain in domainCliTcInfo:
                    domain = domain["Domain"]
                    if domain not in pwddcli[p]:
                        pwddcli[p][domain] = []

                    #subDomainCliTcInfo = domainCliTcInfo.all().values("SubDomain").distinct()
                    subDomainCliTcInfo = domainCliTcInfo.filter(Domain__contains = domain).values("SubDomain").distinct()
                    for subdomain in subDomainCliTcInfo:
                        subdomain = subdomain["SubDomain"]
                        if subdomain not in pwddcli[p][domain]:
                            pwddcli[p][domain].append(subdomain)
    return pwddcli
def platform_wise_domain_subdomain_gui_dict(guiTcInfo):
    pwddgui = {}
    platformsGui = guiTcInfo.values('Platform').distinct()
    for p in platformsGui:
        platform = p["Platform"]

        if len(platform) > 0:
            for p in platform:
                if p not in pwddgui:
                    pwddgui[p] = {}

                domainGuiTcInfo = guiTcInfo.filter(Platform__contains = [p]).values("Domain").distinct()
                for domain in domainGuiTcInfo:
                    domain = domain["Domain"]
                    if domain not in pwddgui[p]:
                        pwddgui[p][domain] = []

                    #subDomainGuiTcInfo = domainGuiTcInfo.all().values("SubDomain").distinct()
                    subDomainGuiTcInfo = domainGuiTcInfo.filter(Domain__contains = domain).values("SubDomain").distinct()
                    for subdomain in subDomainGuiTcInfo:
                        subdomain = subdomain["SubDomain"]
                        if subdomain not in pwddgui[p][domain]:
                            pwddgui[p][domain].append(subdomain)

    return pwddgui
def domain_cli_aggreggation(cliTcInfo, cliStatus):
    cid = {} #cid stands for cli info dict
    csd = {} #csd stands for cli status dict
    myDict = {}
    myDict['domain-cli'] = {}
    subDomainDict = {}
    global statusList

    cid, csd = get_cli_dataDict(cliTcInfo, cliStatus)
    tcinfoserializer = TC_INFO_SERIALIZER(cliTcInfo, many=True)
    statusserializer = LATEST_TC_STATUS_SERIALIZER(cliStatus, many=True)

    priorityList = ['P0','P1','P2','P3','P4','P5','P6','P7']

    domains = cliTcInfo.values('Domain').distinct()

    # domain wise CLI statistics
    # domain-cli default dictionary creation
    for dom in domains:
        sdomain = dom["Domain"]
        domainCliTcInfo = cliTcInfo.filter(Domain=sdomain)
        if sdomain not in myDict['domain-cli']:
            myDict['domain-cli'][sdomain] = {}
        #myDict['domain-cli'][sdomain]["subDomain-cli"] = subDomain_cli_aggreggation(domainCliTcInfo, cliStatus) # subDomain wise aggregation

        if "NotApplicable" not in myDict['domain-cli'][sdomain]:
            myDict['domain-cli'][sdomain]['NotApplicable'] = 0
        if "Not Tested" not in myDict['domain-cli'][sdomain]:
            myDict['domain-cli'][sdomain]['NotTested'] = 0
        if "Tested" not in myDict['domain-cli'][sdomain]:
            myDict['domain-cli'][sdomain]['Tested'] = {}

        if "manual" not in myDict['domain-cli'][sdomain]['Tested']:
            myDict['domain-cli'][sdomain]['Tested']['manual'] = {}
        if "auto" not in myDict['domain-cli'][sdomain]['Tested']:
            myDict['domain-cli'][sdomain]['Tested']['auto'] = {}

        for item in statusList:
            if item not in myDict['domain-cli'][sdomain]['Tested']['manual']:
                myDict['domain-cli'][sdomain]['Tested']['manual'][item] = 0
            if item not in myDict['domain-cli'][sdomain]['Tested']['auto']:
                myDict['domain-cli'][sdomain]['Tested']['auto'][item] = 0

    lateststatuslist = []
    for d in cid:
        for c in cid[d]:
            for i in cid[d][c]:
                lateststatuslist.append(cid[d][c][i])

    # aggregation calculation
    for stat in lateststatuslist:
        sdomain = stat["Domain"]
        stcid = stat["TcID"]
        scard = stat["CardType"]
        stcname = stat["TcName"]
        sPriority = stat["Priority"]
        sApplicable = stat["applicable"]

        # Skip and NA checking
        #if sPriority == "Skip" or sPriority == "NA": #commenting Priority check bcoz using applicability as NA/Skip 
        if sApplicable == "Skip" or sApplicable == "NA":
            continue

        try:
            sres = stat["Result"]

            if sres == "Unblocked": # unblocked key is not present in VALID STATUS', as we are counting it into NOTTESTED
                continue
            #applicable count calculations
            if stcname == "TC NOT AUTOMATED":
                myDict['domain-cli'][sdomain]['Tested']['manual'][sres] += 1
                myDict['domain-cli'][sdomain]['NotTested'] -= 1
            if stcname != "TC NOT AUTOMATED":
                myDict['domain-cli'][sdomain]['Tested']['auto'][sres] += 1
                myDict['domain-cli'][sdomain]['NotTested'] -= 1
        except:
            pass

    for tc in tcinfoserializer.data:
        #if tc["Priority"] == "Skip": # we need NA count, so skipping only SKIP(priority) tcs
        if tc["applicable"] == "Skip": #commenting Priority check bcoz using applicability as NA/Skip
            continue

        domain = tc["Domain"]
        card = tc["CardType"]
        tcid = tc["TcID"]

        #if tc["Priority"] == "NA":
        if tc["applicable"] == "NA":
            myDict['domain-cli'][domain]['NotApplicable'] += 1
            continue

        myDict["domain-cli"][domain]["NotTested"] += 1

    return myDict["domain-cli"]

def get_cli_priorityDict(cliTcInfo,cliStatus):
    myDict = {}
    myDict['Priority'] = {}

    cid, csd = get_cli_dataDict(cliTcInfo, cliStatus)
    priorities = cliTcInfo.values('Priority').distinct()
    priorityStatusList = ['Pass', 'Fail', 'Skip', 'Blocked', 'NotTested']

    for prior in priorities:
        #if prior["Priority"] == "Skip" or prior["Priority"]  == "NA":   # only applicable
        #if prior["applicable"] == "Skip" or prior["applicable"]  == "NA":
        #    continue

        myDict['Priority'][prior['Priority']] = {}
        for item in priorityStatusList:
            myDict['Priority'][prior['Priority']][item] = 0

    for domain in cid:
        for tc in cid[domain]:
            for item in cid[domain][tc]:
                appl = cid[domain][tc][item]["applicable"]
                priority = cid[domain][tc][item]["Priority"]
                #if priority == "Skip" or priority == "NA":
                #    continue
                if appl == "Skip" or appl == "NA":
                    continue
                try:
                    result = cid[domain][tc][item]["Result"]
                except:
                    myDict['Priority'][priority]['NotTested'] += 1
                    continue

                #check to add unblocked in not tested
                try:
                    if result == "Unblocked":
                        myDict['Priority'][priority]['NotTested'] += 1
                    elif result != "":
                        myDict['Priority'][priority][result] += 1
                except:
                    continue
    return myDict["Priority"]


def get_gui_dataDict(guiTcInfo, guiStatus):

    gid = {} #gid stands for gui info dict
    gsd = {} #gsd stands for gui status dict

    tcinfoserializer = TC_INFO_GUI_SERIALIZER(guiTcInfo, many=True)
    statusserializer = LATEST_TC_STATUS_GUI_SERIALIZER(guiStatus, many=True)

    for tc in tcinfoserializer.data:
        id = tc["id"]

        if id not in gid:
            gid[id] = tc
    for status in statusserializer.data:
        id = status["tcInfoNum"]
        if id not in gsd:
            gsd[id] = status
        try:
            appl = gid[id]["applicable"]
            prio = gid[id]["Priority"]
            gid[id].update(gsd[id])
            gid[id]["applicable"] = appl
            gid[id]["Priority"] = prio
            #gsd[id].update(gid[id])
        except:
            pass

    return (gid,gsd)

def get_gui_dataDict1(guiTcInfo, guiStatus):

    gid = {} #gid stands for gui info dict
    gsd = {} #gsd stands for gui status dict

    tcinfoserializer = TC_INFO_GUI_SERIALIZER(guiTcInfo, many=True)
    statusserializer = LATEST_TC_STATUS_GUI_SERIALIZER(guiStatus, many=True)

    for tc in tcinfoserializer.data:
        id = tc["id"]

        if id not in gid:
            gid[id] = tc
    for status in statusserializer.data:
        id = status["tcInfoNum"]
        if id not in gsd:
            gsd[id] = status
        try:
            gsd[id].update(gid[id])
        except:
            pass

    return (gid,gsd)


def get_gui_priorityDict(guiTcInfo,guiStatus):
    myDict = {}
    myDict['Priority'] = {}
    priorityStatusList = ['Pass','Fail','Skip','Blocked','NotTested']

    #_, gsd = get_gui_dataDict(guiTcInfo, guiStatus)
    gsd, _ = get_gui_dataDict(guiTcInfo, guiStatus)
    # creating priority wise default dictionary
    priorities = guiTcInfo.values('Priority').distinct()
    for prior in priorities:
        #if prior["Priority"] == "Skip" or prior["Priority"]  == "NA":
        #    continue
        myDict['Priority'][prior['Priority']] = {}
        for item in priorityStatusList:
            myDict['Priority'][prior['Priority']][item] = 0

    for id in gsd:
        try:
            priority = gsd[id]["Priority"]
            applicable = gsd[id]["applicable"]
            result = gsd[id]["Result"]

            #if priority == "Skip" or priority == "NA":
            #    continue
            if applicable == "Skip" or applicable == "NA":
                continue
            #check to add unblocked in not tested
            if result == 'Unblocked':
                myDict['Priority'][priority]['NotTested'] += 1
            else:
                myDict['Priority'][priority][result] += 1
        except:
            #pass
            priority = gsd[id]["Priority"]
            myDict['Priority'][priority]['NotTested'] +=1

    return myDict["Priority"]

def domain_gui_aggreggation(guiTcInfo, guiStatus):
    gid = {} #gid stands for gui info dict
    gsd = {} #gsd stands for cli status dict
    myDict = {}
    myDict['domain-gui'] = {}
    global statusList

    gid,gsd = get_gui_dataDict1(guiTcInfo, guiStatus)

    priorityList = ['P0','P1','P2','P3','P4','P5','P6','P7']

    domains = guiTcInfo.values('Domain').distinct()
    #print("gui domain",domains,"\n\n")

    # domain wise GUI statistics
    # domain-gui default dictionary creation
    for dom in domains:
        sdomain = dom["Domain"]
        if sdomain not in myDict['domain-gui']:
            myDict['domain-gui'][sdomain] = {}

        if "NotApplicable" not in myDict['domain-gui'][sdomain]:
            myDict['domain-gui'][sdomain]['NotApplicable'] = 0
        if "Not Tested" not in myDict['domain-gui'][sdomain]:
            myDict['domain-gui'][sdomain]['NotTested'] = 0
        if "Tested" not in myDict['domain-gui'][sdomain]:
            myDict['domain-gui'][sdomain]['Tested'] = {}

        if "manual" not in myDict['domain-gui'][sdomain]['Tested']:
            myDict['domain-gui'][sdomain]['Tested']['manual'] = {}
        if "auto" not in myDict['domain-gui'][sdomain]['Tested']:
            myDict['domain-gui'][sdomain]['Tested']['auto'] = {}

        for item in statusList:
            if item not in myDict['domain-gui'][sdomain]['Tested']['manual']:
                myDict['domain-gui'][sdomain]['Tested']['manual'][item] = 0
            if item not in myDict['domain-gui'][sdomain]['Tested']['auto']:
                myDict['domain-gui'][sdomain]['Tested']['auto'][item] = 0

    for status in gsd:
        try:
            prior = gsd[status]["Priority"]
        except:
            continue

        res = gsd[status]["Result"]
        domain = gsd[status]["Domain"]
        tcname = gsd[status]["AutomatedTcName"]

        #if prior == "Skip" or prior == "NA" or res == "Unblocked":
        #     continue

        if tcname == "TC NOT AUTOMATED":
            myDict['domain-gui'][domain]['Tested']['manual'][res] += 1
            myDict['domain-gui'][domain]['NotTested'] -= 1
        else:
            myDict['domain-gui'][domain]['Tested']['auto'][res] += 1
            myDict['domain-gui'][domain]['NotTested'] -= 1

    ser = TC_INFO_GUI_SERIALIZER(guiTcInfo, many = True)
    for tc in ser.data:
        #if tc["Priority"] == "Skip":
        #    continue
        if tc["applicable"] == "Skip":
            continue
        domain = tc["Domain"]
        card = tc["CardType"]
        tcid = tc["TcID"]

        #if tc["Priority"] == "NA":
        if tc["applicable"] == "NA":
            myDict['domain-gui'][domain]['NotApplicable'] += 1
            continue

        myDict["domain-gui"][domain]["NotTested"] += 1
    
    return myDict["domain-gui"]

def cli_gui_combined_aggregation(cliDict,guiDict):
    dictionary = copy.deepcopy(cliDict)

    for domain in guiDict:
        if domain not in dictionary:
            dictionary[domain] = guiDict[domain]
        else:
            dictionary[domain]['NotApplicable'] += guiDict[domain]['NotApplicable']
            dictionary[domain]['NotTested'] += guiDict[domain]['NotTested']

            for testedType in dictionary[domain]["Tested"]:
                testedData = dictionary[domain]["Tested"][testedType]
                for res in testedData:
                    dictionary[domain]["Tested"][testedType][res] += guiDict[domain]["Tested"][testedType][res]
    return dictionary

def TCAGGREGATE(Release):
    dictionary = {}
    global statusList

    dictionary['domain'] = {}
    dictionary['AvailableScenarios'] = []
    dictionary["AvailableDomainOptions"] = {}

    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).all()
    domSer = DOMAIN_SUBDOMAIN_SERIALIZER(domains, many = True)

    for dom in domSer.data:
        dictionary["AvailableDomainOptions"][dom["Domain"]] = dom["SubDomain"]

    scenario = TC_INFO.objects.using(Release).values('Scenario').distinct()
    for tc in scenario:
        dictionary['AvailableScenarios'].append(tc['Scenario'])

    # CLI TC INFO AND STATUS
    myDict = {}
    #cliTcInfo = TC_INFO.objects.using(Release).all()
    cliTcInfo = TC_INFO.objects.using(Release).filter(stateUserMapping__icontains = "Manual Assignee")
    #cliStatus = LATEST_TC_STATUS.objects.using(Release).all().order_by('-Date')
    cliStatus = TC_STATUS.objects.using(Release).all().order_by('-Date')

    # cli function call
    dictionary['domain-cli'] = domain_cli_aggreggation(cliTcInfo, cliStatus) # domain wise aggregation
    dictionary["Priority"] = get_cli_priorityDict(cliTcInfo,cliStatus) # priority wise aggregation

    # GUI TC INFO AND STATUS
    #guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
    guiTcInfo = TC_INFO_GUI.objects.using(Release).filter(stateUserMapping__icontains = "Manual Assignee")
    guiStatus = GUI_TC_STATUS.objects.using(Release).all().order_by('-Date')

    #domain-gui function call
    dictionary['domain-gui'] = domain_gui_aggreggation(guiTcInfo, guiStatus) #domain wise aggregation
    dictionary["PriorityGui"] = get_gui_priorityDict(guiTcInfo,guiStatus) #priority wise aggregation

    #cli gui combined output
    dictionary["domain"] = cli_gui_combined_aggregation(dictionary['domain-cli'],dictionary['domain-gui'])

    ############################################
    # cli total numbers calculation for dashboard
    applicableCliInfo = cliTcInfo.filter(applicable = "Applicable").filter(~Q(Priority = "Skip")).filter(~Q(Priority = "NA"))
    # default dictionary for CLI
    dictionary["all"] = {}
    dictionary["all"]["Blocked"] = 0 # default values
    dictionary["all"]["NotTested"] = 0 # default values

    dictionary["all"]["Tested"] = {}
    dictionary["all"]["Tested"]["auto"] = {}
    dictionary["all"]["Tested"]["manual"] = {}
    for status in statusList:
        dictionary["all"]["Tested"]["auto"][status] = 0
        dictionary["all"]["Tested"]["manual"][status] = 0

    # actual values calculation for CLI
    dictionary["all"]["All"] = cliTcInfo.count()
    dictionary["all"]["Skip"] = cliTcInfo.filter(Priority = "Skip").count()
    dictionary["all"]["NotApplicable"] = cliTcInfo.filter(Priority = "NA").count()
    dictionary["all"]["NonAutomated"] = applicableCliInfo.filter(TcName = "TC NOT AUTOMATED").count()
    dictionary["all"]["Automated"] = applicableCliInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).count()

    for domain in dictionary["domain-cli"]:
        # nottested
        dictionary["all"]["NotTested"] += dictionary["domain-cli"][domain]["NotTested"]

        # blocked
        dictionary["all"]["Blocked"] += dictionary["domain-cli"][domain]["Tested"]["manual"]["Blocked"]
        dictionary["all"]["Blocked"] += dictionary["domain-cli"][domain]["Tested"]["auto"]["Blocked"]

        #tested
        for testedType in dictionary["domain-cli"][domain]["Tested"]:
            testedData = dictionary["domain-cli"][domain]["Tested"][testedType]

            for res in testedData:
                dictionary["all"]["Tested"][testedType][res] += testedData[res]

    #############################################
    # GUI total numbers calculation for dashboard
    applicableGuiInfo = guiTcInfo.filter(applicable = "Applicable").filter(~Q(Priority = "Skip")).filter(~Q(Priority = "NA"))

    # default dictionary for CLI
    dictionary["allGUI"] = {}
    dictionary["allGUI"]["Pass"] = 0 # default values
    dictionary["allGUI"]["Fail"] = 0 # default values
    dictionary["allGUI"]["Blocked"] = 0 # default values
    dictionary["allGUI"]["NotTested"] = 0 # default values

    dictionary["allGUI"]["Tested"] = {}
    dictionary["allGUI"]["Tested"]["auto"] = {}
    dictionary["allGUI"]["Tested"]["manual"] = {}
    for status in statusList:
        dictionary["allGUI"]["Tested"]["auto"][status] = 0
        dictionary["allGUI"]["Tested"]["manual"][status] = 0

    # actual values calculation for CLI
    dictionary["allGUI"]["All"] = guiTcInfo.count()
    dictionary["allGUI"]["Skip"] = guiTcInfo.filter(Priority = "Skip").count()
    dictionary["allGUI"]["NotApplicable"] = guiTcInfo.filter(Priority = "NA").count()
    dictionary["allGUI"]["NonAutomated"] = applicableGuiInfo.filter(TcName = "TC NOT AUTOMATED").count()
    dictionary["allGUI"]["Automated"] = applicableGuiInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).count()

    for domain in dictionary["domain-gui"]:
        # nottested
        dictionary["allGUI"]["NotTested"] += dictionary["domain-gui"][domain]["NotTested"]

        # blocked
        dictionary["allGUI"]["Blocked"] += dictionary["domain-gui"][domain]["Tested"]["manual"]["Blocked"]
        dictionary["allGUI"]["Blocked"] += dictionary["domain-gui"][domain]["Tested"]["auto"]["Blocked"]

        #tested
        for testedType in dictionary["domain-gui"][domain]["Tested"]:
            testedData = dictionary["domain-gui"][domain]["Tested"][testedType]

            for res in testedData:
                dictionary["allGUI"]["Tested"][testedType][res] += testedData[res]
                if res == "Pass":
                    dictionary["allGUI"]["Pass"] += testedData[res]
                elif res == "Fail":
                    dictionary["allGUI"]["Fail"] += testedData[res]

    dictionary["PlatformWiseDomainSubdomainCli"]= platform_wise_domain_subdomain_cli_dict1(cliTcInfo)
    dictionary["PlatformWiseDomainSubdomainGui"]= platform_wise_domain_subdomain_gui_dict1(guiTcInfo)
    return dictionary

@csrf_exempt
def TCAGGREGATE_DASHBOARD(request, Release):
    if request.method == "GET":
        dictionary = {}
        global statusList

        dictionary['domain'] = {}
        dictionary['AvailableScenarios'] = []
        dictionary["AvailableDomainOptions"] = {}

        domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).all()
        domSer = DOMAIN_SUBDOMAIN_SERIALIZER(domains, many = True)

        for dom in domSer.data:
            dictionary["AvailableDomainOptions"][dom["Domain"]] = dom["SubDomain"]

        scenario = TC_INFO.objects.using(Release).values('Scenario').distinct()
        for tc in scenario:
            dictionary['AvailableScenarios'].append(tc['Scenario'])

        # CLI TC INFO AND STATUS
        myDict = {}
        cliTcInfo = TC_INFO.objects.using(Release).all()
        #cliTcInfo = TC_INFO.objects.using(Release).filter(~Q(Priority = "NA"))
        #cliStatus = LATEST_TC_STATUS.objects.using(Release).all().order_by('-Date')
        cliStatus = TC_STATUS.objects.using(Release).all().order_by('-Date')

        # cli function call
        dictionary['domain-cli'] = domain_cli_aggreggation(cliTcInfo, cliStatus) # domain wise aggregation
        dictionary["Priority"] = get_cli_priorityDict(cliTcInfo,cliStatus) # priority wise aggregation

        # GUI TC INFO AND STATUS
        guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
        #guiTcInfo = TC_INFO_GUI.objects.using(Release).filter(~Q(Priority = "NA"))
        #guiStatus = GUI_TC_STATUS.objects.using(Release).all().order_by('-Date')
        guiStatus = GUI_LATEST_TC_STATUS.objects.using(Release).all().order_by('-Date')
        #domain-gui function call
        dictionary['domain-gui'] = domain_gui_aggreggation(guiTcInfo, guiStatus) #domain wise aggregation
        dictionary["PriorityGui"] = get_gui_priorityDict(guiTcInfo,guiStatus) #priority wise aggregation

        #cli gui combined output
        dictionary["domain"] = cli_gui_combined_aggregation(dictionary['domain-cli'],dictionary['domain-gui'])

        ############################################
        # cli total numbers calculation for dashboard
        #applicableCliInfo = cliTcInfo.filter(applicable = "Applicable").filter(~Q(Priority = "Skip")).filter(~Q(Priority = "Skp")).filter(~Q(Priority = "NA"))
        applicableCliInfo = cliTcInfo.filter(applicable = "Applicable").filter(~Q(applicable = "Skip")).filter(~Q(applicable = "NA"))
        # default dictionary for CLI
        dictionary["all"] = {}
        dictionary["all"]["Blocked"] = 0 # default values
        dictionary["all"]["NotTested"] = 0 # default values

        dictionary["all"]["Tested"] = {}
        dictionary["all"]["Tested"]["auto"] = {}
        dictionary["all"]["Tested"]["manual"] = {}
        for status in statusList:
            dictionary["all"]["Tested"]["auto"][status] = 0
            dictionary["all"]["Tested"]["manual"][status] = 0

        # actual values calculation for CLI
        dictionary["all"]["All"] = cliTcInfo.count()
        #dictionary["all"]["Skip"] = cliTcInfo.filter(Priority = "Skip").count() + cliTcInfo.filter(Priority = "Skp").count()
        dictionary["all"]["Skip"] = cliTcInfo.filter(applicable = "Skip").count()
        #dictionary["all"]["NotApplicable"] = cliTcInfo.filter(Priority = "NA").count()
        dictionary["all"]["NotApplicable"] = cliTcInfo.filter(applicable = "NA").count()
        dictionary["all"]["NonAutomated"] = applicableCliInfo.filter(TcName = "TC NOT AUTOMATED").count()
        temp = applicableCliInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).filter(~Q(TcName = "NOT AUTOMATED")).filter(~Q(TcName = "undefined"))
        #dictionary["all"]["Automated"] = applicableCliInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).count()
        dictionary["all"]["Automated"] = temp.count()
        for domain in dictionary["domain-cli"]:
            # nottested
            dictionary["all"]["NotTested"] += dictionary["domain-cli"][domain]["NotTested"]

            # blocked
            dictionary["all"]["Blocked"] += dictionary["domain-cli"][domain]["Tested"]["manual"]["Blocked"]
            dictionary["all"]["Blocked"] += dictionary["domain-cli"][domain]["Tested"]["auto"]["Blocked"]

            #tested
            for testedType in dictionary["domain-cli"][domain]["Tested"]:
                testedData = dictionary["domain-cli"][domain]["Tested"][testedType]

                for res in testedData:
                    dictionary["all"]["Tested"][testedType][res] += testedData[res]

        #############################################
        # GUI total numbers calculation for dashboard
        #applicableGuiInfo = guiTcInfo.filter(applicable = "Applicable").filter(~Q(Priority = "Skip")).filter(~Q(Priority = "Skp")).filter(~Q(Priority = "NA"))
        applicableGuiInfo = guiTcInfo.filter(applicable = "Applicable").filter(~Q(applicable = "Skip")).filter(~Q(applicable = "NA"))

        # default dictionary for CLI
        dictionary["allGUI"] = {}
        dictionary["allGUI"]["Pass"] = 0 # default values
        dictionary["allGUI"]["Fail"] = 0 # default values
        dictionary["allGUI"]["Blocked"] = 0 # default values
        dictionary["allGUI"]["NotTested"] = 0 # default values

        dictionary["allGUI"]["Tested"] = {}
        dictionary["allGUI"]["Tested"]["auto"] = {}
        dictionary["allGUI"]["Tested"]["manual"] = {}
        for status in statusList:
            dictionary["allGUI"]["Tested"]["auto"][status] = 0
            dictionary["allGUI"]["Tested"]["manual"][status] = 0

        # actual values calculation for CLI
        dictionary["allGUI"]["All"] = guiTcInfo.count()
        #dictionary["allGUI"]["Skip"] = guiTcInfo.filter(Priority = "Skip").filter(Priority = "Skp").count()
        dictionary["allGUI"]["Skip"] = guiTcInfo.filter(applicable = "Skip").count()
        #dictionary["allGUI"]["NotApplicable"] = guiTcInfo.filter(Priority = "NA").count()
        dictionary["allGUI"]["NotApplicable"] = guiTcInfo.filter(applicable = "NA").count()
        dictionary["allGUI"]["NonAutomated"] = applicableGuiInfo.filter(TcName = "TC NOT AUTOMATED").count()
        #dictionary["allGUI"]["Automated"] = applicableGuiInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).count()
        tempg = applicableGuiInfo.filter(~Q(TcName = "TC NOT AUTOMATED")).filter(~Q(TcName = "NOT AUTOMATED")).filter(~Q(TcName = "undefined"))
        dictionary["allGUI"]["Automated"] = tempg.count()

        for domain in dictionary["domain-gui"]:
            # nottested
            dictionary["allGUI"]["NotTested"] += dictionary["domain-gui"][domain]["NotTested"]

            # blocked
            dictionary["allGUI"]["Blocked"] += dictionary["domain-gui"][domain]["Tested"]["manual"]["Blocked"]
            dictionary["allGUI"]["Blocked"] += dictionary["domain-gui"][domain]["Tested"]["auto"]["Blocked"]

            #tested
            for testedType in dictionary["domain-gui"][domain]["Tested"]:
                testedData = dictionary["domain-gui"][domain]["Tested"][testedType]

                for res in testedData:
                    dictionary["allGUI"]["Tested"][testedType][res] += testedData[res]
                    if res == "Pass":
                        dictionary["allGUI"]["Pass"] += testedData[res]
                    elif res == "Fail":
                        dictionary["allGUI"]["Fail"] += testedData[res]

        #dictionary["PlatformWiseDomainSubdomainCli"]= platform_wise_domain_subdomain_cli_dict1(cliTcInfo)
        #dictionary["PlatformWiseDomainSubdomainGui"]= platform_wise_domain_subdomain_gui_dict1(guiTcInfo)
        serData = {}
        serData['TcAggregate'] = dictionary
        return HttpResponse(json.dumps(serData))



def subDomain_cli_aggreggation(cliTcInfo,cliStatus):
    cid = {} #cid stands for cli info dict
    csd = {} #csd stands for cli status dict
    myDict = {}
    myDict['subDomain-cli'] = {}
    global statusList

    cid, csd = get_cli_dataDict(cliTcInfo, cliStatus)
    tcinfoserializer = TC_INFO_SERIALIZER(cliTcInfo,many=True)
    statusserializer = LATEST_TC_STATUS_SERIALIZER(cliStatus, many=True)

    priorityList = ['P0','P1','P2','P3','P4','P5','P6','P7']

    subDomains = cliTcInfo.values('SubDomain').distinct()

    for subDom in subDomains:
        subDomain = subDom['SubDomain']
        if subDomain not in myDict['subDomain-cli']:
            myDict['subDomain-cli'][subDomain]={}

            if "NotApplicable" not in myDict['subDomain-cli'][subDomain]:
                myDict['subDomain-cli'][subDomain]['NotApplicable'] = 0
            if "NotTested" not in myDict['subDomain-cli'][subDomain]:
                myDict['subDomain-cli'][subDomain]['NotTested'] = 0
            if "Tested" not in myDict['subDomain-cli'][subDomain]:
                myDict['subDomain-cli'][subDomain]['Tested'] = {}

            if "manual" not in myDict['subDomain-cli'][subDomain]['Tested']:
                myDict['subDomain-cli'][subDomain]['Tested']['manual'] = {}
            if "auto" not in myDict['subDomain-cli'][subDomain]['Tested']:
                myDict['subDomain-cli'][subDomain]['Tested']['auto'] = {}

            for item in statusList:
                if item not in myDict['subDomain-cli'][subDomain]['Tested']['manual']:
                    myDict['subDomain-cli'][subDomain]['Tested']['manual'][item] = 0
                if item not in myDict['subDomain-cli'][subDomain]['Tested']['auto']:
                    myDict['subDomain-cli'][subDomain]['Tested']['auto'][item] = 0

    lateststatuslist = []
    for d in cid:
        for c in cid[d]:
            for i in cid[d][c]:
                lateststatuslist.append(cid[d][c][i])

    # aggregation calculation
    for stat in lateststatuslist:
        subDomain = stat["SubDomain"]
        stcid = stat["TcID"]
        scard = stat["CardType"]
        stcname = stat["TcName"]
        sPriority = stat["Priority"]

        # Skip and NA checking
        if sPriority == "Skip" or sPriority == "NA":
            continue

        try:
            sres = stat["Result"]

            if sres == "Unblocked": # unblocked key is not present in VALID STATUS', as we are counting it into NOTTESTED
                continue
            #applicable count calculations
            if stcname == "TC NOT AUTOMATED":
                myDict['subDomain-cli'][subDomain]['Tested']['manual'][sres] += 1
                myDict['subDomain-cli'][subDomain]['NotTested'] -= 1
            if stcname != "TC NOT AUTOMATED":
                myDict['subDomain-cli'][subDomain]['Tested']['auto'][sres] += 1
                myDict['subDomain-cli'][subDomain]['NotTested'] -= 1
        except:
            pass

    for tc in tcinfoserializer.data:
        if tc["Priority"] == "Skip": # we need NA count, so skipping only SKIP(priority) tcs
            continue

        subDomain = tc["SubDomain"]
        card = tc["CardType"]
        tcid = tc["TcID"]

        if tc["Priority"] == "NA":
            myDict['subDomain-cli'][subDomain]['NotApplicable'] += 1
            continue

        myDict["subDomain-cli"][subDomain]["NotTested"] += 1

    return myDict["subDomain-cli"]


def DOMAINWISERELEASEINFO(request,Release,Domain):
    dictionary = {}
    cliTcInfo = TC_INFO.objects.using(Release).filter(Domain=Domain)
    cliStatus = TC_STATUS.objects.using(Release).all().order_by('-Date')
    dictionary['subDomain-cli'] = subDomain_cli_aggreggation(cliTcInfo, cliStatus) # subDomain wise aggregation
    return JsonResponse(dictionary['subDomain-cli'])

def TCAGGREGATEOLD(Release):
        dictionary = {}

        dictionary['domain'] = {}
        dictionary['AvailableDomainOptions'] = {}
        dictionary['AvailableScenarios'] = []

        total = 0
        totalpass = 0
        totalfail = 0
        totalskipped = 0
        totalblocked = 0
        totalnottested = 0

        autopass = 0
        autofail = 0
        autoskipped = 0
        autoblocked = 0

        #CLI aggregation
        data = LATEST_TC_STATUS.objects.using(Release).all()
        serializer = LATEST_TC_STATUS_SERIALIZER(data, many=True)

        tcinfo = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(~Q(Priority = "NA"))
        tcinfoserializer = TC_INFO_SERIALIZER(tcinfo, many=True)

        tcinfoWithNA = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
        automated = tcinfoWithNA.filter(~Q(TcName = "TC NOT AUTOMATED")).count()
        nonautomated = tcinfoWithNA.filter(TcName = "TC NOT AUTOMATED").count()
        notapplicable = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(Priority = "NA").count()

        dictionary["AvailableDomainOptions"] = {}

        domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).all()
        domSer = DOMAIN_SUBDOMAIN_SERIALIZER(domains, many = True)

        for dom in domSer.data:
            dictionary["AvailableDomainOptions"][dom["Domain"]] = dom["SubDomain"]

        scenario = TC_INFO.objects.using(Release).values('Scenario').distinct()
        for tc in scenario:
            dictionary['AvailableScenarios'].append(tc['Scenario'])

        domains = tcinfo.values('Domain').distinct()
        for tc in domains:
            domain = tc['Domain']
            tccount = 0

            if domain not in dictionary['domain']:
                dictionary['domain'][domain] = {}

                dictionary['domain'][domain]['Tested'] = {}

                domainallcount = TC_INFO.objects.using(Release).filter(Domain = tc['Domain']).filter(~Q(Priority = 'Skip')).filter(~Q(Priority = 'NA')).count()
                #if Release == "DMC-3.0":
                #    print("\n", tc["Domain"], domainallcount)
                dictionary['domain'][tc['Domain']]['NotApplicable'] = 0

                dictionary['domain'][tc['Domain']]['Tested']['auto'] = {}
                dictionary['domain'][tc['Domain']]['Tested']['manual'] = {}

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Pass").count()
                if Release == "2.3.0":
                    d = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'])
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Pass'] = tccount
                totalpass += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Fail").count()
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Fail'] = tccount
                totalfail += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "NotTested").count()
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Skip'] = tccount
                totalskipped += tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Blocked").count()
                #print("Cli manyal blocked", domain, tccount)
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Blocked'] = tccount
                totalblocked += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Unblocked").count()

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Pass").count()
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Pass'] = tccount
                totalpass += tccount
                autopass += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Fail").count()
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Fail'] = tccount
                totalfail += tccount
                autofail += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "NotTested").count()
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Skip'] = tccount
                totalskipped += tccount
                autoskipped += tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Blocked").count()
                #print("Cli auto blocked", domain, tccount)
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Blocked'] = tccount
                totalblocked += tccount
                autoblocked += tccount
                domainallcount -= tccount

                tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Unblocked").count()

                dictionary['domain'][tc['Domain']]['NotTested'] = domainallcount
                totalnottested += dictionary['domain'][tc['Domain']]['NotTested']

        ###################################################################################
        tcinfo = TC_INFO.objects.using(Release).filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip"))
        tcinfoserializer = TC_INFO_SERIALIZER(tcinfo, many=True)

        status = LATEST_TC_STATUS.objects.using(Release).all()
        statusserializer = LATEST_TC_STATUS_SERIALIZER(status, many=True)

        d = {}

        for tc in tcinfoserializer.data:
            domain = tc["Domain"]
            card = tc["CardType"]
            tcid = tc["TcID"]

            if domain not in d:
                d[domain]= {}

            if card not in d[domain]:
                d[domain][card] = {}

            if tcid not in d[domain][card]:
                d[domain][card][tcid] = tc


        dictionary['domain'] = {}
        dictionary['domain-cli'] = {}
        dictionary['domain-gui'] = {}

        for stat in statusserializer.data:
            scard = stat["CardType"]
            stcid = stat["TcID"]
            sdomain = stat["Domain"]
            tcname = stat["TcName"]

            # aggregation for cli+gui
            if sdomain not in dictionary["domain"]:
                dictionary["domain"][sdomain] = {}
            if "Tested" not in dictionary["domain"][sdomain]:
                dictionary["domain"][sdomain]["Tested"] = {}

            # aggregation for cli
            if sdomain not in dictionary["domain-cli"]:
                dictionary["domain-cli"][sdomain] = {}
            if "Tested" not in dictionary["domain-cli"][sdomain]:
                dictionary["domain-cli"][sdomain]["Tested"] = {}


            #manual variables for all (cli + gui)
            if "manual" not in dictionary["domain"][sdomain]["Tested"]:
                dictionary["domain"][sdomain]["Tested"]["manual"] = {}
            if "Pass" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                dictionary["domain"][sdomain]["Tested"]["manual"]["Pass"] = 0
            if "Fail" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                dictionary["domain"][sdomain]["Tested"]["manual"]["Fail"] = 0
            if "Skip" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                dictionary["domain"][sdomain]["Tested"]["manual"]["Skip"] = 0
            if "Blocked" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                dictionary["domain"][sdomain]["Tested"]["manual"]["Blocked"] = 0

            #auto variables for all (cli + gui)
            if "auto" not in dictionary["domain"][sdomain]["Tested"]:
                dictionary["domain"][sdomain]["Tested"]["auto"] = {}
            if "Pass" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                dictionary["domain"][sdomain]["Tested"]["auto"]["Pass"] = 0
            if "Fail" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                dictionary["domain"][sdomain]["Tested"]["auto"]["Fail"] = 0
            if "Skip" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                dictionary["domain"][sdomain]["Tested"]["auto"]["Skip"] = 0
            if "Blocked" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                dictionary["domain"][sdomain]["Tested"]["auto"]["Blocked"] = 0

            #manual variables for cli
            if "manual" not in dictionary["domain-cli"][sdomain]["Tested"]:
                dictionary["domain-cli"][sdomain]["Tested"]["manual"] = {}
            if "Pass" not in dictionary["domain-cli"][sdomain]["Tested"]["manual"]:
                dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Pass"] = 0
            if "Fail" not in dictionary["domain-cli"][sdomain]["Tested"]["manual"]:
                dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Fail"] = 0
            if "Skip" not in dictionary["domain-cli"][sdomain]["Tested"]["manual"]:
                dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Skip"] = 0
            if "Blocked" not in dictionary["domain-cli"][sdomain]["Tested"]["manual"]:
                dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Blocked"] = 0

            #auto variables for cli
            if "auto" not in dictionary["domain-cli"][sdomain]["Tested"]:
                dictionary["domain-cli"][sdomain]["Tested"]["auto"] = {}
            if "Pass" not in dictionary["domain-cli"][sdomain]["Tested"]["auto"]:
                dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Pass"] = 0
            if "Fail" not in dictionary["domain-cli"][sdomain]["Tested"]["auto"]:
                dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Fail"] = 0
            if "Skip" not in dictionary["domain-cli"][sdomain]["Tested"]["auto"]:
                dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Skip"] = 0
            if "Blocked" not in dictionary["domain-cli"][sdomain]["Tested"]["auto"]:
                dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Blocked"] = 0


            try:
                a = d[sdomain][scard][stcid]
                res = stat["Result"]

                if tcname == "TC NOT AUTOMATED":
                    if res == "Pass":
                        dictionary["domain"][sdomain]["Tested"]["manual"]["Pass"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Pass"] += 1
                    if res == "Fail":
                        dictionary["domain"][sdomain]["Tested"]["manual"]["Fail"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Fail"] += 1
                    if res == "Blocked":
                        dictionary["domain"][sdomain]["Tested"]["manual"]["Blocked"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Blocked"] += 1
                else:
                    if res == "Pass":
                        dictionary["domain"][sdomain]["Tested"]["auto"]["Pass"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Pass"] += 1
                    if res == "Fail":
                        dictionary["domain"][sdomain]["Tested"]["auto"]["Fail"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Fail"] += 1
                    if res == "Blocked":
                        dictionary["domain"][sdomain]["Tested"]["auto"]["Blocked"] += 1
                        dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Blocked"] += 1
            except:
                continue

        for sdomain in dictionary["domain"]:
            # aggregate calculation for all (cli + gui)
            if "NotApplicable" not in dictionary["domain"][sdomain]:
                dictionary["domain"][sdomain]["NotApplicable"] = TC_INFO.objects.using(Release).filter(Priority = "NA", Domain = sdomain).count()
            if "NotTested" not in dictionary["domain"][sdomain]:
                allcount = TC_INFO.objects.using(Release).filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip")).filter(Domain = sdomain).count()
                passcounter = dictionary["domain"][sdomain]["Tested"]["manual"]["Pass"] + dictionary["domain"][sdomain]["Tested"]["auto"]["Pass"]
                failcounter = dictionary["domain"][sdomain]["Tested"]["manual"]["Fail"] + dictionary["domain"][sdomain]["Tested"]["auto"]["Fail"]
                blockedcounter = dictionary["domain"][sdomain]["Tested"]["manual"]["Blocked"] + dictionary["domain"][sdomain]["Tested"]["auto"]["Blocked"]

                dictionary["domain"][sdomain]["NotTested"] = allcount - (passcounter + failcounter + blockedcounter)

            # aggregate calculation for cli
            if "NotApplicable" not in dictionary["domain-cli"][sdomain]:
                dictionary["domain-cli"][sdomain]["NotApplicable"] = TC_INFO.objects.using(Release).filter(Priority = "NA", Domain = sdomain).count()
            if "NotTested" not in dictionary["domain-cli"][sdomain]:
                allcount = TC_INFO.objects.using(Release).filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip")).filter(Domain = sdomain).count()
                passcounter = dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Pass"] + dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Pass"]
                failcounter = dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Fail"] + dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Fail"]
                blockedcounter = dictionary["domain-cli"][sdomain]["Tested"]["manual"]["Blocked"] + dictionary["domain-cli"][sdomain]["Tested"]["auto"]["Blocked"]

                dictionary["domain-cli"][sdomain]["NotTested"] = allcount - (passcounter + failcounter + blockedcounter)

        #GUI aggregation
        if Release == "DMC-3.0":
            data = GUI_LATEST_TC_STATUS.objects.using(Release).all()
            serializer = LATEST_TC_STATUS_GUI_SERIALIZER(data, many=True)

            tcinfo = TC_INFO_GUI.objects.using(Release).filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip"))
            tcinfoserializer = TC_INFO_GUI_SERIALIZER(tcinfo, many=True)

            tcinfoWithNA = TC_INFO_GUI.objects.using(Release).all()
            automated = tcinfoWithNA.filter(~Q(AutomatedTcName = "TC NOT AUTOMATED")).count()
            nonautomated = tcinfoWithNA.filter(AutomatedTcName = "TC NOT AUTOMATED").count()
            notapplicable = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(Priority = "NA").count()

            infoserializer = TC_INFO_GUI_SERIALIZER(tcinfo, many = True)
            infoDict = createInfoDict(infoserializer.data, Release)

            for status in serializer.data:
                try:
                    status.update(infoDict[status["tcInfoNum"]])
                except:
                    pass

            domains = tcinfo.values('Domain').distinct()

            # domain wise GUI statistics
            for tc in domains:
                sdomain = tc["Domain"]

                # aggregation for cli+gui
                if sdomain not in dictionary["domain"]:
                    dictionary["domain"][sdomain] = {}
                if "Tested" not in dictionary["domain"][sdomain]:
                    dictionary["domain"][sdomain]["Tested"] = {}
                if "NotTested" not in dictionary["domain"][sdomain]:
                    dictionary["domain"][sdomain]["NotTested"] = 0
                if "NotApplicable" not in dictionary["domain"][sdomain]:
                    dictionary["domain"][sdomain]["NotApplicable"] = 0

                # aggregation for cli
                if sdomain not in dictionary["domain-gui"]:
                    dictionary["domain-gui"][sdomain] = {}
                if "Tested" not in dictionary["domain-gui"][sdomain]:
                    dictionary["domain-gui"][sdomain]["Tested"] = {}
                if "NotTested" not in dictionary["domain-gui"][sdomain]:
                    dictionary["domain-gui"][sdomain]["NotTested"] = 0
                if "NotApplicable" not in dictionary["domain-gui"][sdomain]:
                    dictionary["domain-gui"][sdomain]["NotApplicable"] = 0


                #manual variables for all (cli + gui)
                if "manual" not in dictionary["domain"][sdomain]["Tested"]:
                    dictionary["domain"][sdomain]["Tested"]["manual"] = {}
                if "Pass" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                    dictionary["domain"][sdomain]["Tested"]["manual"]["Pass"] = 0
                if "Fail" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                    dictionary["domain"][sdomain]["Tested"]["manual"]["Fail"] = 0
                if "Skip" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                    dictionary["domain"][sdomain]["Tested"]["manual"]["Skip"] = 0
                if "Blocked" not in dictionary["domain"][sdomain]["Tested"]["manual"]:
                    dictionary["domain"][sdomain]["Tested"]["manual"]["Blocked"] = 0

                #auto variables for all (cli + gui)
                if "auto" not in dictionary["domain"][sdomain]["Tested"]:
                    dictionary["domain"][sdomain]["Tested"]["auto"] = {}
                if "Pass" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                    dictionary["domain"][sdomain]["Tested"]["auto"]["Pass"] = 0
                if "Fail" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                    dictionary["domain"][sdomain]["Tested"]["auto"]["Fail"] = 0
                if "Skip" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                    dictionary["domain"][sdomain]["Tested"]["auto"]["Skip"] = 0
                if "Blocked" not in dictionary["domain"][sdomain]["Tested"]["auto"]:
                    dictionary["domain"][sdomain]["Tested"]["auto"]["Blocked"] = 0

                #manual variables for gui
                if "manual" not in dictionary["domain-gui"][sdomain]["Tested"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["manual"] = {}
                if "Pass" not in dictionary["domain-gui"][sdomain]["Tested"]["manual"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["manual"]["Pass"] = 0
                if "Fail" not in dictionary["domain-gui"][sdomain]["Tested"]["manual"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["manual"]["Fail"] = 0
                if "Skip" not in dictionary["domain-gui"][sdomain]["Tested"]["manual"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["manual"]["Skip"] = 0
                if "Blocked" not in dictionary["domain-gui"][sdomain]["Tested"]["manual"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["manual"]["Blocked"] = 0

                #auto variables for gui
                if "auto" not in dictionary["domain-gui"][sdomain]["Tested"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["auto"] = {}
                if "Pass" not in dictionary["domain-gui"][sdomain]["Tested"]["auto"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["auto"]["Pass"] = 0
                if "Fail" not in dictionary["domain-gui"][sdomain]["Tested"]["auto"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["auto"]["Fail"] = 0
                if "Skip" not in dictionary["domain-gui"][sdomain]["Tested"]["auto"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["auto"]["Skip"] = 0
                if "Blocked" not in dictionary["domain-gui"][sdomain]["Tested"]["auto"]:
                    dictionary["domain-gui"][sdomain]["Tested"]["auto"]["Blocked"] = 0

                domain = tc['Domain']
                tccount = 0

                domainallcount = TC_INFO_GUI.objects.using(Release).filter(Domain = tc['Domain']).filter(~Q(Priority = 'NA')).filter(~Q(Priority = "Skip")).count()     #all applicable

                tccount = 0
                manualPass = 0
                manualFail = 0
                manualSkip = 0
                manualBlocked = 0

                autoPass = 0
                autoFail = 0
                autoSkip = 0
                autoBlocked = 0
                for status in serializer.data:
                    try:
                        if status["Priority"] == "Skip":
                            continue
                        if status["Priority"] == "NA":
                            continue

                        if status["Domain"] == tc["Domain"]:
                            domainallcount -= 1
                            if status["AutomatedTcName"] == "TC NOT AUTOMATED":
                                tccount +=1

                                if "pass" in status["Result"].lower():
                                    manualPass += 1
                                if "fail" in status["Result"].lower():
                                    manualFail += 1
                                if "skip" in status["Result"].lower():
                                    manualSkip += 1
                                if "blocked" == status["Result"].lower():
                                    manualBlocked += 1
                                if "unblocked" in status["Result"].lower():
                                    domainallcount += 1
                            elif status["AutomatedTcName"] != "TC NOT AUTOMATED":
                                tccount +=1

                                if "pass" in status["Result"].lower():
                                    autoPass += 1
                                if "fail" in status["Result"].lower():
                                    autoFail += 1
                                if "skip" in status["Result"].lower():
                                    autoSkip += 1
                                if "blocked" == status["Result"].lower():
                                    autoBlocked += 1
                                if "unblocked" in status["Result"].lower():
                                    domainallcount += 1
                    except:
                        pass

                # aggregation summation with previously calculated cli stats (cli + gui)
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Pass'] += manualPass
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Fail'] += manualFail
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Skip'] += manualSkip
                dictionary['domain'][tc['Domain']]['Tested']['manual']['Blocked'] += manualBlocked

                dictionary['domain'][tc['Domain']]['Tested']['auto']['Pass'] += autoPass
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Fail'] += autoFail
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Skip'] += autoSkip
                dictionary['domain'][tc['Domain']]['Tested']['auto']['Blocked'] += autoBlocked

                dictionary['domain'][tc['Domain']]['NotTested'] += domainallcount
                totalnottested += dictionary['domain'][tc['Domain']]['NotTested']

                dictionary["domain"][tc["Domain"]]["NotApplicable"] += TC_INFO_GUI.objects.using(Release).filter(Domain = tc['Domain']).filter(Priority = 'NA').count()

                # aggregation for GUI
                dictionary['domain-gui'][tc['Domain']]['Tested']['manual']['Pass'] += manualPass
                dictionary['domain-gui'][tc['Domain']]['Tested']['manual']['Fail'] += manualFail
                dictionary['domain-gui'][tc['Domain']]['Tested']['manual']['Skip'] += manualSkip
                dictionary['domain-gui'][tc['Domain']]['Tested']['manual']['Blocked'] += manualBlocked

                dictionary['domain-gui'][tc['Domain']]['Tested']['auto']['Pass'] += autoPass
                dictionary['domain-gui'][tc['Domain']]['Tested']['auto']['Fail'] += autoFail
                dictionary['domain-gui'][tc['Domain']]['Tested']['auto']['Skip'] += autoSkip
                dictionary['domain-gui'][tc['Domain']]['Tested']['auto']['Blocked'] += autoBlocked

                dictionary['domain-gui'][tc['Domain']]['NotTested'] += domainallcount
                totalnottested += dictionary['domain-gui'][tc['Domain']]['NotTested']

                dictionary["domain-gui"][tc["Domain"]]["NotApplicable"] += TC_INFO_GUI.objects.using(Release).filter(Domain = tc['Domain']).filter(Priority = 'NA').count()

        notapplicable = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(Priority = "NA").count()

        dictionary['all'] = {}
        dictionary['all']['Tested'] = {}
        dictionary['allGUI'] = {}

        guitcinfo = TC_INFO_GUI.objects.using(Release).all()
        guiTotalTc = guitcinfo.count()
        guiNotApplicable = guitcinfo.filter(Priority = "NA").count()

        GuiLatestResult = GUI_LATEST_TC_STATUS.objects.using(Release).all()
        GuiTested = GuiLatestResult.count()

        GuiSkippedFromRelease = guitcinfo.filter(Priority = "Skip").count()
        GuiSkippedWhileTesting = GuiLatestResult.filter(Result = "Skip").count()

        guiApplicable = guiTotalTc - guiNotApplicable - GuiSkippedFromRelease

        GuiAutomated = guitcinfo.filter(~Q(AutomatedTcName = "TC NOT AUTOMATED")).count()
        GuiNonAutomated = guitcinfo.filter(AutomatedTcName = "TC NOT AUTOMATED").count()

        GuiPass = GuiLatestResult.filter(Result = "Pass").count()
        GuiFail = GuiLatestResult.filter(Result = "Fail").count()
        GuiBlocked = GuiLatestResult.filter(Result = "Blocked").count()
        GuiUnblocked = GuiLatestResult.filter(Result = "Unblocked").count()
        GuiNotTested = (guiApplicable - GuiTested) + GuiUnblocked

        dictionary['allGUI']['TotalTCs'] = guiTotalTc

        dictionary['allGUI']['Applicable'] = guiApplicable
        dictionary['allGUI']['NotApplicable'] = guiNotApplicable

        dictionary['allGUI']['SkippedFromRelease'] = GuiSkippedFromRelease
        dictionary['allGUI']['SkippedWhileTesting'] = GuiSkippedWhileTesting

        dictionary['allGUI']['Automated'] = GuiAutomated
        dictionary['allGUI']['NonAutomated'] = GuiNonAutomated

        dictionary['allGUI']['Tested'] = GuiTested
        dictionary['allGUI']['NotTested'] = GuiNotTested
        dictionary['allGUI']['Pass'] = GuiPass
        dictionary['allGUI']['Fail'] = GuiFail
        dictionary['allGUI']['Blocked'] = GuiBlocked

        NeededToTest = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip"))
        infoSerializer = TC_INFO_SERIALIZER(NeededToTest, many = True)
        totalCount = NeededToTest.count()

        latestStatusData = LATEST_TC_STATUS.objects.using(Release).all()
        latestStatusSer = LATEST_TC_STATUS_SERIALIZER(latestStatusData, many=True)
        notTestedCount = totalCount
        blockedCount = 0

        # cli nottesteeed calculations
        for status in latestStatusSer.data:
            for tc in infoSerializer.data:
                if status["TcID"] == tc["TcID"] and status["CardType"] == tc["CardType"]:
                    if tc["Priority"] != "NA" or tc["Priority"] != "Skip":
                        if status["Result"] != "Unblocked":
                            notTestedCount -= 1
                        if status["Result"] == "Blocked":
                            blockedCount += 1

        dictionary['all']['NotTested'] = notTestedCount
        dictionary['all']['Blocked'] = blockedCount
        dictionary['all']['NonAutomated'] = nonautomated
        dictionary['all']['Automated'] = automated
        dictionary['all']['NotApplicable'] = notapplicable

        dictionary['all']['Tested']['auto'] = {}
        tcinfo1 = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
        dictionary['all']['All'] = tcinfo1.count()
        tcstatus1 = LATEST_TC_STATUS.objects.using(Release).all()
        tcstatusserializer1 = LATEST_TC_STATUS_SERIALIZER(tcstatus1, many = True)

        manualpass = totalpass - autopass
        manualfail = totalfail - autofail
        manualskipped = totalskipped - autoskipped

        totalSkipped = tcinfo1.filter(Priority = "Skip").count()

        # cli priorities
        priorities = tcinfo1.values('Priority').distinct()
        dictionary['Priority'] = {}

        for prior in priorities:
            if prior["Priority"] == "Skip" or prior["Priority"]  == "NA":
                continue
            dictionary['Priority'][prior['Priority']] = {}

            dictionary['Priority'][prior['Priority']]['Pass'] = 0
            dictionary['Priority'][prior['Priority']]['Fail'] = 0
            dictionary['Priority'][prior['Priority']]['NotTested'] = 0
            dictionary['Priority'][prior['Priority']]['Skip'] = 0
            dictionary['Priority'][prior['Priority']]['Blocked'] = 0

            priorityWiseTcInfo = tcinfo1.filter(Priority = prior['Priority'])
            priorityWiseTcInfoSerializer = TC_INFO_SERIALIZER(priorityWiseTcInfo, many = True)

            for info in priorityWiseTcInfoSerializer.data:
                flag = 0
                for status in tcstatusserializer1.data:
                    if status['TcID'] == info['TcID'] and status['CardType'] == info['CardType']:
                        flag = 1
                        if status['Result'] == "Pass":
                            dictionary['Priority'][prior['Priority']]['Pass'] += 1
                        if status['Result'] == "Fail":
                            dictionary['Priority'][prior['Priority']]['Fail'] += 1
                        if status['Result'] == "Skip":
                            dictionary['Priority'][prior['Priority']]['Skip'] += 1
                        if status['Result'] == "Blocked":
                            dictionary['Priority'][prior['Priority']]['Blocked'] += 1

                if flag == 0:
                    dictionary['Priority'][prior['Priority']]['NotTested'] += 1

        #gui priority
        priorities = TC_INFO_GUI.objects.using(Release).values('Priority').distinct()
        dictionary['PriorityGui'] = {}
        guistatusdata = GUI_LATEST_TC_STATUS.objects.using(Release).all()
        guistatusserializer = LATEST_TC_STATUS_GUI_SERIALIZER(data, many=True)

        guitcinfo = TC_INFO_GUI.objects.using(Release).filter(~Q(Priority = "Skip")).filter(~Q(Priority = "NA"))
        priorityWiseTcInfoSerializer = TC_INFO_GUI_SERIALIZER(priorityWiseTcInfo, many = True)

        for prior in priorities:
            if prior["Priority"] == "Skip" or prior["Priority"]  == "NA":
                continue
            dictionary['PriorityGui'][prior['Priority']] = {}

            dictionary['PriorityGui'][prior['Priority']]['Pass'] = 0
            dictionary['PriorityGui'][prior['Priority']]['Fail'] = 0
            dictionary['PriorityGui'][prior['Priority']]['NotTested'] = 0
            dictionary['PriorityGui'][prior['Priority']]['Skip'] = 0
            dictionary['PriorityGui'][prior['Priority']]['Blocked'] = 0

            priorityWiseTcInfo = TC_INFO_GUI.objects.using(Release).filter(Priority = prior['Priority'])
            priorityWiseTcInfoSerializer = TC_INFO_GUI_SERIALIZER(priorityWiseTcInfo, many = True)

            for info in priorityWiseTcInfoSerializer.data:
                flag = 0
                for status in guistatusserializer.data:
                    if status['tcInfoNum'] == info['id']:
                        if status['Result'] == "Pass":
                            dictionary['PriorityGui'][prior['Priority']]['Pass'] += 1
                            flag = 1
                        if status['Result'] == "Fail":
                            dictionary['PriorityGui'][prior['Priority']]['Fail'] += 1
                            flag = 1
                        if status['Result'] == "Skip":
                            dictionary['PriorityGui'][prior['Priority']]['Skip'] += 1
                            flag = 1
                        if status['Result'] == "Blocked":
                            dictionary['PriorityGui'][prior['Priority']]['Blocked'] += 1
                            flag = 1

                if flag == 0:
                    dictionary['PriorityGui'][prior['Priority']]['NotTested'] += 1

        tcinfo2 = tcinfo1.filter(~Q(Priority = "NA")).filter(~Q(Priority = "Skip"))
        tcinfoserializer1 = TC_INFO_SERIALIZER(tcinfo2, many = True)
        autopass = 0
        autofail = 0
        autoskipped = 0
        autoblocked = 0
        manualpass = 0
        manualfail = 0
        manualskipped = 0
        manualblocked = 0

        for status in tcstatusserializer1.data:
            flag = 0
            for tc in tcinfoserializer1.data:
                if tc['TcID'] == status['TcID'] and tc['CardType'] == status['CardType']:
                    flag = 1


            if flag == 1:
                if status["TcName"] == "TC NOT AUTOMATED":
                    if status['Result'].lower() == "pass":
                        manualpass += 1
                    elif status['Result'].lower() == "fail":
                        manualfail += 1
                    elif status['Result'].lower() == "skip":
                        manualskipped += 1
                    elif status['Result'].lower() == "blocked":
                        manualblocked += 1
                else:
                    if status['Result'].lower() == "pass":
                        autopass += 1
                    elif status['Result'].lower() == "fail":
                        autofail += 1
                    elif status['Result'].lower() == "skip":
                        autoskipped += 1
                    elif status['Result'].lower() == "blocked":
                        autoblocked += 1

        dictionary['all']['Skip'] = totalSkipped

        dictionary['all']['Tested']['auto']['Pass'] = autopass
        dictionary['all']['Tested']['auto']['Fail'] = autofail
        dictionary['all']['Tested']['auto']['Skip'] = autoskipped
        dictionary['all']['Tested']['auto']['Blocked'] = autoblocked

        dictionary['all']['Tested']['manual'] = {}
        dictionary['all']['Tested']['manual']['Pass'] = manualpass
        dictionary['all']['Tested']['manual']['Fail'] = manualfail
        dictionary['all']['Tested']['manual']['Skip'] = manualskipped
        dictionary['all']['Tested']['manual']['Blocked'] = manualblocked

        return dictionary

def updateDomainData(newData, oldData, Release):
    oldData.Domain = newData['Domain']
    oldData.SubDomain = newData['SubDomain']

    oldData.save(using = Release)

def addDomain(domain, Release):
    domainGet = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).filter(Domain = domain)
    if len(domainGet) < 1:
        fd = DomainSubDomainForm({"Domain" : domain})
        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
        else:
            print(fd.errors)

def addSubDomain(domain, subDomain, Release):
    subDomainGet = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).get(Domain = domain)
    ser = DOMAIN_SUBDOMAIN_SERIALIZER(subDomainGet)
    newData = ser.data

    if subDomain not in ser.data['SubDomain']:
        newData['SubDomain'].append(subDomain)
        updateDomainData(newData, subDomainGet, Release)

def tcaggr(Release):
    tcInfo = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
    domains = tcInfo.values("Domain").distinct()

    for i in domains:
        domain = i['Domain']
        addDomain(domain, Release)
        subDomains = tcInfo.filter(Domain = domain).values("Domain","SubDomain").distinct()
        for i in subDomains:
            addSubDomain(domain, i['SubDomain'], Release)

@csrf_exempt
def AddDomainSubDomain(request, Release):
    req = json.loads(request.body.decode("utf-8"))

    for dom in req['domains']:
        addDomain(dom, Release)

    for subdom in req['subdomains']:
        addSubDomain(req['selectedDomain'], subdom, Release)
    return HttpResponse("Domains and Subdomains added successfully", status = 200)

@csrf_exempt
def USER_INFO_GET_POST_VIEW(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        fd = UserInfoForm(req)
        if fd.is_valid():
            fd.save()
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        else:
            print(fd.errors)
        # GenerateLogData(1, 'POST', 'specificuserbyid/' + str(id) + " => " + json.dumps(req))
        # return JsonResponse({'Error': fd.errors}, status = 400)
        return HttpResponse(fd.errors)

    elif request.method == "PUT":
        req = json.loads(request.body.decode("utf-8"))
        if "emails" in req:
            for i in req['emails']:
                data = USER_INFO.objects.get(email = i)
                if req['ReleasesEdit'] not in data.AssignedReleases:
                    data.AssignedReleases.append(req['ReleasesEdit'])
                    data.save()
            return HttpResponse("UPDATED SUCCESSFULLY", status = 200)
        else:
            data = USER_INFO.objects.get(email = req['email'])
            for i in req['ReleasesEdit']:
                if i['value'] in data.AssignedReleases and i['isChecked'] == False:
                    data.AssignedReleases.remove(i['value'])
                    data.save()
                if i['value'] not in data.AssignedReleases and i['isChecked'] == True:
                    data.AssignedReleases.append(i['value'])
                    data.save()

            if req['EngineerType'] != '':
                data.EngineerType = req['EngineerType']
                data.save()
            if req['role'] != '':
                data.role = req['role']
                data.save()

            return HttpResponse("UPDATED SUCCESSFULLY", status = 200)

    elif request.method == "DELETE":
        req = json.loads(request.body.decode("utf-8"))
        data = USER_INFO.objects.get(email = req['email'])
        data.delete()
        return HttpResponse("DELETED SUCCESSFULLY", status = 200)
    else:
        # data = USER_INFO.objects.using(req['ReleaseNumber']).all()
        data = USER_INFO.objects.all()
        serializer = USER_SERIALIZER(data, many = True)
        # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
        return HttpResponse(json.dumps(serializer.data))

def USER_INFO_SPECIFIC_BY_ID(request, id):
    data = USER_INFO.objects.using('users').get(UserId = id)
    serializer = USER_SERIALIZER(data)
    #GenerateLogData(6, 'GET', 'specificuserbyid/' + str(id) + " => " + json.dumps(serializer.data))
    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def USER_INFO_SPECIFIC_BY_NAME(request, email):
    if request.method == "GET":
    	data = USER_INFO.objects.filter(email__icontains = email)
    	serializer = USER_SERIALIZER(data, many=True)
    	# return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    	return HttpResponse(json.dumps(serializer.data))
    elif request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        data = USER_INFO.objects.get(email__icontains = email)
        serializer = USER_SERIALIZER(data)

        req['role'] = "ENGG"
        data.role = req['role']
        #data.PreviousCompany = req["PreviousCompany"]
        data.save()
        if "Activity" in req:
            AD = req['Activity']
            GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])

        #if fd.is_valid():
        #     data = fd.save(commit = False)
        #     data.save()
        #else:
        #     print("INVALID")
        #     print(fd.errors)
    return HttpResponse("ASDASD")

@require_http_methods(["GET"])
@csrf_exempt
def LOG(request, Release):
    data = LOGS.objects.using(Release).all()
    serializer = LOG_SERIALIZER(data, many = True)
    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def RESULT_LOGS(request, Release):
    if request.method == "GET":
        result = {}
        if Release not in result:
            result[Release] = {}

        data = LOGS.objects.using(Release).all()
        serializer = LOG_SERIALIZER(data, many = True)

        for log in serializer.data:
            if "status" in log["LogData"].lower():
                user = log["UserName"]
                if user == "":
                    continue

                if user not in result[Release]:
                    result[Release][user] = {}

                logData = log["LogData"]

                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                date_time_obj = date_time_obj.date()

                some_day_last_week = date_time_obj - timedelta(days=7)
                monday_of_last_week = some_day_last_week - timedelta(days=(some_day_last_week.isocalendar()[2] - 1))
                monday_of_this_week = monday_of_last_week + timedelta(days=7)
                key = str(monday_of_last_week) + " : " + str(monday_of_this_week)

                if key not in result[Release][user]:
                    result[Release][user][key] = 0
                result[Release][user][key] += 1
                #Entry.objects.filter(created_at__gte=monday_of_last_week, created_at__lt=monday_of_this_week)

        return JsonResponse({"Weekly User Report": result}, status = 200)

@csrf_exempt
def RESULT_LOGS_GUI(request, Release):
    if request.method == "GET":
        result = {}
        if Release not in result:
            result[Release] = {}

        data = LOGSGUI.objects.using(Release).all()
        serializer = GUI_LOGS_SERIALIZER(data, many = True)

        for log in serializer.data:
            try:
                if "status" in log["LogData"].lower():
                    print(log["UserName"])
            except:
                pass
            if "status" in log["LogData"].lower():
                user = log["UserName"]
                if user == "":
                    continue

                if user not in result[Release]:
                    result[Release][user] = {}

                logData = log["LogData"]

                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                date_time_obj = date_time_obj.date()

                some_day_last_week = date_time_obj - timedelta(days=7)
                monday_of_last_week = some_day_last_week - timedelta(days=(some_day_last_week.isocalendar()[2] - 1))
                monday_of_this_week = monday_of_last_week + timedelta(days=7)
                key = str(monday_of_last_week) + " : " + str(monday_of_this_week)

                if key not in result[Release][user]:
                    print(Release, user, key)
                    result[Release][user][key] = 0
                result[Release][user][key] += 1
                #Entry.objects.filter(created_at__gte=monday_of_last_week, created_at__lt=monday_of_this_week)

        return JsonResponse({"Weekly User Report": result}, status = 200)

@csrf_exempt
def RESULT_LOGS_GUI(request, Release):
    if request.method == "GET":
        result = {}
        if Release not in result:
            result[Release] = {}

        data = LOGSGUI.objects.using(Release).all()
        serializer = GUI_LOGS_SERIALIZER(data, many = True)

        for log in serializer.data:
            try:
                if "status" in log["LogData"].lower():
                    print(log["UserName"])
            except:
                pass
            if "status" in log["LogData"].lower():
                user = log["UserName"]
                if user == "":
                    continue

                if user not in result[Release]:
                    result[Release][user] = {}

                logData = log["LogData"]

                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ')
                date_time_obj = date_time_obj.date()

                some_day_last_week = date_time_obj - timedelta(days=7)
                monday_of_last_week = some_day_last_week - timedelta(days=(some_day_last_week.isocalendar()[2] - 1))
                monday_of_this_week = monday_of_last_week + timedelta(days=7)
                key = str(monday_of_last_week) + " : " + str(monday_of_this_week)

                if key not in result[Release][user]:
                    result[Release][user][key] = 0
                result[Release][user][key] += 1
                #Entry.objects.filter(created_at__gte=monday_of_last_week, created_at__lt=monday_of_this_week)

        return JsonResponse({"Weekly User Report": result}, status = 200)

def GenerateLogData(UserName, RequestType, url, logData, tcid, card, Release):
    Logs = json.dumps(logData)
    Timestamp = datetime.datetime.now()
    data = {'UserName': UserName, 'RequestType': RequestType, 'LogData': logData, 'Timestamp': Timestamp, 'URL': url, 'TcID': tcid, 'CardType': card}
    fd = LogForm(data)
    if fd.is_valid():
        data = fd.save(commit = False)
        data.save(using = Release)
    else:
        print("INVALID", fd.errors)

list1 = {}
list2 = {}

def GETSETUPWISETCINFO(request, SetupName):
    global list1
    tccounter = 0
    c = 0

    data = TC_INFO.objects.filter(Setup__icontains = SetupName)
    serializer = TC_INFO_SERIALIZER(data, many=True)
    d = json.dumps(serializer.data)
    d = json.loads(d)
    for i in range(len(d)):
        co = (d[i]['Setup']).count(SetupName)
        c += co

    tccounter = 0
    data = TC_INFO.objects.all()
    serializer = TC_INFO_SERIALIZER(data, many=True)
    d = json.dumps(serializer.data)
    d = json.loads(d)
    for i in range(len(d)):
        tccounter += len(d[i]['Setup'])

    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def RELEASEINFOPOST(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        req.pop('TcAggregate', None)

        fd = ReleaseInfoForm(req)
        if fd.is_valid():
            fd.save()
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            # return JsonResponse({'Sucess': 'SUCCESSFULLY ADDED NEW RELEASE'}, status = 200)
            print("SUCCESSFULLY ADDED NEW RELEASE")
            res = createReleaseDB(req['ReleaseNumber'], req["ParentRelease"])
            #res = createReleaseDB(req['PlatformsCli'], req["ReleaseNumber"])
            if res == 0:
                print("Database already exists")
            else:
                print("Created Database succesfully")
            return HttpResponse("SUCCESSFULLY ADDED NEW RELEASE")
        else:
            print(fd.errors)
            # GenerateLogData(1, 'POST', 'specificuserbyid/' + str(id) + " => " + json.dumps(req))
            # return JsonResponse({'Error': fd.errors}, status = 400)
            return HttpResponse(fd.errors)
@csrf_exempt
def RELEASEWISE_CLI_PLATFORM(request, Release):
    if request.method == "GET":
        platformList = []
        #cliTcInfo = RELEASES.objects.using(Release).all()
        cliTcInfo = RELEASES.objects.filter(ReleaseNumber = Release)
        print("printingcliTCinfo",cliTcInfo)
        platformsCli = cliTcInfo.values('PlatformsCli').distinct()
        print("Printing",platformsCli)
        for p in platformsCli:
            platform = p["PlatformsCli"]

            if len(platform) > 0:
                for p in platform:
                    if p not in platformList:
                        platformList.append(p)
    print(platformList)
    return HttpResponse(json.dumps(platformList))

@csrf_exempt
def RELEASEWISE_GUI_PLATFORM(request, Release):
    if request.method == "GET":
        platformList = []
        #guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
        guiTcInfo = RELEASES.objects.filter(ReleaseNumber = Release)
        print(guiTcInfo)
        platformsGui = guiTcInfo.values('PlatformsGui').distinct()
        print(platformsGui)
        for p in platformsGui:
            platform = p["PlatformsGui"]

            if len(platform) > 0:
                for p in platform:
                    if p not in platformList:
                        platformList.append(p)
    print(platformList)
    return HttpResponse(json.dumps(platformList))

@csrf_exempt
def getPlatformWiseDomainSubdomain(request, Release, interface):
    if request.method == "GET":
        if interface == "CLI":
            dictionary = {}
            cliTcInfo = TC_INFO.objects.using(Release).all()
            dictionary = platform_wise_domain_subdomain_cli_dict(cliTcInfo)
            return HttpResponse(json.dumps(dictionary))
        elif interface == "GUI":
            dictionary = {}
            guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
            dictionary = platform_wise_domain_subdomain_gui_dict(guiTcInfo)
            return HttpResponse(json.dumps(dictionary))


@csrf_exempt
def RELEASEINFO(request, Release):
    if request.method == "GET":
        print("COMING inside RELEASEINFO", Release)
        list = []

        if(Release == "info"):
            data = RELEASES.objects.using("universal").values("ReleaseNumber").all()
            serializer = RELEASE_SERIALIZER(data, many = True)
            return HttpResponse(json.dumps(serializer.data))
        elif(Release == 'all'):
            data = RELEASES.objects.using("universal").values("ReleaseNumber").all()
            serializer = RELEASE_SERIALIZER(data, many = True)
            return HttpResponse(json.dumps(serializer.data))
        elif(Release == 'infoAsc'):
            data = RELEASES.objects.using("universal").all().order_by("ReleaseNumber")
            serializer = RELEASE_SERIALIZER(data, many = True)
            return HttpResponse(json.dumps(serializer.data))

        elif(Release == 'cdate'):
            data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
            serializer = RELEASE_SERIALIZER(data, many = True)
            return HttpResponse(json.dumps(serializer.data))

        else:
            t = time.time()
            
            data = RELEASES.objects.using('universal').get(ReleaseNumber = Release)
            cliTcInfo = TC_INFO.objects.using(Release).all()
            guiTcInfo = TC_INFO_GUI.objects.using(Release).all()
            #platformsCli = cliTcInfo.values('Platform').distinct()
            platformsCli = cliTcInfo.values('CardType').distinct()
            #print(platformsCli)
            platformsGui = guiTcInfo.values('CardType').distinct()
            #platformsGui = guiTcInfo.values('Platform').distinct()
            serializer = RELEASE_SERIALIZER(data)

            serData = json.dumps(serializer.data)
            serData = json.loads(serData)
            for p in platformsGui:
                if p["CardType"] not in serData["PlatformsGui"]:
                    data.PlatformsGui.append(p["CardType"])
                    data.save()
            for p in platformsCli:
                if p["CardType"] not in serData["PlatformsCli"]:
                    data.PlatformsCli.append(p["CardType"])
                    data.save()


            pcli = []
            pgui = []
            for p in platformsCli:
                #for p1 in p["Platform"]:
                    #if p1 not in pcli:
                    #   pcli.append(p1)
                if p["CardType"] not in pcli:
                    pcli.append(p["CardType"])

            for p3 in serData["PlatformsCli"]:
                if p3 not in pcli:
                    serData["PlatformsCli"].remove(p3)
                    data.PlatformsCli.remove(p3)
                    data.save()
            for p in platformsGui:
                #for p1 in p["Platform"]:
                    #if p1 not in pgui:
                    #   pgui.append(p1)
                if p["CardType"] not in pgui:
                    pgui.append(p["CardType"])
            for p3 in serData["PlatformsGui"]:
                if p3 not in pgui:
                    serData["PlatformsGui"].remove(p3)
                    data.PlatformsGui.remove(p3)
                    data.save()

            #print(aggregateData)
            #data = json.load(open("/portal/app/DDB/dummy_response.json", "r"))
            #data = json.dumps(data["TcAggregate"])
            #data = data.replace("'","\"")
            aggregateData = TCAGGREGATE_MOD(Release,platformsCli, platformsGui)
            serData['TcAggregate'] = aggregateData
            return HttpResponse(json.dumps(serData))

    elif request.method == "PUT":
        try:
            req = json.loads(request.body.decode("utf-8"))
            data = RELEASES.objects.get(ReleaseNumber__icontains = Release)
            serializer = RELEASE_SERIALIZER(data, data = req)
            if serializer.is_valid():
                serializer.save()
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            else:
                print(serializer.errors)
            return HttpResponse("RELEASE " + Release + " UPDATED SUCCESSFULLY", status = 200)
        except:
            return HttpResponse("SOME ERROR OCCURED", status = 400)

def TCAGGREGATE_MOD(Release, pcli, pgui):
    dictionary = {}
    dictionary["AvailableDomainOptions"] = {}

    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).all()
    domSer = DOMAIN_SUBDOMAIN_SERIALIZER(domains, many = True)

    for dom in domSer.data:
        dictionary["AvailableDomainOptions"][dom["Domain"]] = dom["SubDomain"]

    # CLI TC INFO AND STATUS
    cliTcInfo = TC_INFO.objects.using(Release).all()

    guiTcInfo = TC_INFO_GUI.objects.using(Release).all()

    dictionary["PlatformWiseDomainSubdomainCli"]= platform_wise_domain_subdomain_cli_dict1(cliTcInfo, pcli)
    dictionary["PlatformWiseDomainSubdomainGui"]= platform_wise_domain_subdomain_gui_dict1(guiTcInfo, pgui)
    return dictionary


def GETPLATFORMWISETCINFO(request, OrchestrationPlatform):
    data = TC_INFO.objects.filter(OrchestrationPlatform__icontains = OrchestrationPlatform)
    serializer = TC_INFO_SERIALIZER(data, many=True)
    print("orchestartion platform name: ", OrchestrationPlatform, "number of TCs: ", len(serializer.data))
    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))


def GETPLATFORMANDSETUPWISETCINFO(request, OrchestrationPlatform, SetupName):
    data = TC_INFO.objects.filter(CardType__icontains = SetupName, OrchestrationPlatform__icontains = OrchestrationPlatform)
    serializer = TC_INFO_SERIALIZER(data, many=True)
    print("Setupname: ", SetupName, "orchestartion platform name: ", OrchestrationPlatform, "number of TCs: ", len(serializer.data))
    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def USER_LOGIN_VIEW(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        print(req)

        try:
            data = USER_INFO.objects.get(email = req['email'])
            print(data)
            serializer = USER_SERIALIZER(data)
            #GenerateLogData(serializer.data['UserName'], 'POST', 'user/login', json.dumps(req))
            return JsonResponse({'role': serializer.data['role']}, status = 200)
        except:
            print("except")
            data ={}
            data['name'] = req['name']
            data['email'] = req['email']
            if req['email'] == "amandeep@diamanti.com" or req['email'] == "chris@diamanti.com":
                data['role'] = "EXECUTIVE"
            elif 'Role' not in req:
                data['role'] = "Dev"
            else:
                data['role'] = req['role']
            temp = []
            for rel in settings.DATABASES:
                temp.append(rel)
            data["AssignedReleases"] = temp
            fd = UserInfoForm(data)
            if fd.is_valid():
                fd.save()
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                return JsonResponse({'role': data['role']}, status = 200)
            else:
                return JsonResponse({'error': fd.errors}, status = 400)
            #GenerateLogData(data['UserName'], 'POST', 'user/login', json.dumps(req))

        return JsonResponse({'role': data['role']}, status = 200)

@csrf_exempt
def IMPORT_TCs(request):
    if request.method == "GET":
        interface = request.GET.get("interface")
        froRelease = request.GET.get("froRelease")
        toRelease = request.GET.get("toRelease")
        platform = request.GET.get("platform")
        domains = request.GET.get("domains")
        domains = json.loads(domains)
        dom = []
        #check if domains subdomains are in toRelease if not adding it
        for d in domains:
            dom.append(d)
            domainGet = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(toRelease).filter(Domain = d)
            if len(domainGet) < 1:
                addDomain(d, toRelease)
                for subd in domains[d]:
                    addSubDomain(d, subd, toRelease)
            else:
                subdomainGet = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(toRelease).get(Domain = d)
                ser = DOMAIN_SUBDOMAIN_SERIALIZER(subdomainGet)
                for subd in domains[d]:
                    if subd not in ser.data['SubDomain']:
                        addSubDomain(d, subd, toRelease)
        #Adding given platform and domain tcs to intended release
        if interface == "CLI":
            duplicate_clitc_ddmtodd330(platform, dom, toRelease, froRelease)
            return HttpResponse("UNCOMMENT CODE")
        elif interface == "GUI":
            duplicate_guitc_ddmtodd330(platform, dom, toRelease, froRelease)
            return HttpResponse("UNCOMMENT CODE")

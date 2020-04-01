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
        DEFAULT_DOMAIN_SUBDOMAIN

from .forms import TcInfoForm, TcStatusForm, UserInfoForm, LogForm, ReleaseInfoForm, AggregationForm, GuiTcInfoForm, \
        DomainSubDomainForm

from DDB.serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, USER_SERIALIZER, LOG_SERIALIZER, \
    RELEASE_SERIALIZER, AGGREGATION_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, \
    DOMAIN_SUBDOMAIN_SERIALIZER

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

        print("THIS IS REQUEST", req)

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
            print(req)
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

# @csrf_exempt
# def DEFAULT_VALUE_SETTER_GETTER(request):
#     if request.method == "POST":

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
    return HttpResponse("COMING", status = 200)

def editAggregate(newData, oldData, Release):
    oldData.Domain = newData["Domain"]

    oldData.Total  = newData["Total"]
    oldData.NotApplicable = newData["NotApplicable"]
    oldData.Skipped = newData["Skipped"]
    oldData.Automated  = newData["Automated"]
    oldData.NonAutomated  = newData["NonAutomated"]

    oldData.Tested  = newData["Tested"]
    oldData.NotTested  = newData["NotTested"]

    oldData.ManualPass  = newData["ManualPass"]
    oldData.ManualFail  = newData["ManualFail"]
    oldData.ManualSkip  = newData["ManualSkip"]

    oldData.AutomatedPass  = newData["AutomatedPass"]
    oldData.AutomatedFail  = newData["AutomatedFail"]
    oldData.AutomatedSkip  = newData["AutomatedSkip"]

def getAggregate(Release):
    dic = {}

    dic["TcAggregate"] = {}
    dic["TcAggregate"]["domain"] = {}

    # calculation 2
    # avaiable domains and their subdomains
    dic["AvailableDomainOptions"] = {}

    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).all()
    domSer = ser = DOMAIN_SUBDOMAIN_SERIALIZER(domains, many = True)

    for dom in domSer.data:
        dic["AvailableDomainOptions"][dom["Domain"]] = dom["SubDomain"]


    # calclation 3
    # available scenarios
    dic['AvailableScenarios'] = []

    tcInfoAll = TC_INFO.objects.using(Release)
    tcInfoCli = tcInfoAll.filter(~Q(Domain = "GUI"))
    tcinfo = tcInfoCli.filter(~Q(Priority = "NA"))

    scenario = tcinfo.values('Scenario').distinct()
    for tc in scenario:
        dic['AvailableScenarios'].append(tc['Scenario'])


    # calculation 4
    # all info not specific to domain, etc
    dic["all"] = {}

    tcStatus = LATEST_TC_STATUS.objects.using(Release).all()

    dic["all"]["All"] = tcInfoCli.count() #total cli test cases
    dic["all"]["GUI"] = tcInfoAll.filter(Domain = "GUI").count()
    dic["all"]["NotTested"] = dic["all"]["All"] - tcStatus.count()
    dic["all"]["NotApplicable"] = tcInfoCli.filter(Priority = "NA").count()
    dic["all"]["NonAutomated"] = tcInfoCli.filter(TcName = "TC NOT AUTOMATED").count()
    dic["all"]["Automated"] = tcInfoCli.filter(~Q(TcName = "TC NOT AUTOMATED")).count()

    dic["all"]["Tested"] = {}

    dic["all"]["Tested"]["auto"] = {}
    dic["all"]["Tested"]["auto"]["Pass"] = 0
    dic["all"]["Tested"]["auto"]["Fail"] = 0
    dic["all"]["Tested"]["auto"]["Skip"] = 0

    dic["all"]["Tested"]["manual"] = {}
    dic["all"]["Tested"]["manual"]["Pass"] = 0
    dic["all"]["Tested"]["manual"]["Fail"] = 0
    dic["all"]["Tested"]["manual"]["Skip"] = 0



    # calculation 1
    # Domain wise pass, fail, skip, automated etc calculation
    aggData = AGGREGATE_TC_STATE.objects.using(Release).all()
    aggSer = AGGREGATION_SERIALIZER(aggData, many = True)

    for dom in aggSer.data:
        dic["TcAggregate"]["domain"][dom["Domain"]] = {}

        dic["TcAggregate"]["domain"][dom["Domain"]]["NotApplicable"] = dom["NotApplicable"]
        dic["TcAggregate"]["domain"][dom["Domain"]]["NotTested"] = dom["NotTested"]

        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"] = {}

        dic["all"]["Tested"]["auto"]["Pass"] = dic["all"]["Tested"]["auto"]["Pass"] + dom["AutomatedPass"]
        dic["all"]["Tested"]["auto"]["Fail"] = dic["all"]["Tested"]["auto"]["Fail"] + dom["AutomatedFail"]
        dic["all"]["Tested"]["auto"]["Skip"] = dic["all"]["Tested"]["auto"]["Skip"] + dom["AutomatedSkip"]
        dic["all"]["Tested"]["manual"]["Pass"] = dic["all"]["Tested"]["manual"]["Pass"] + dom["ManualPass"]
        dic["all"]["Tested"]["manual"]["Fail"] = dic["all"]["Tested"]["manual"]["Fail"] + dom["ManualFail"]
        dic["all"]["Tested"]["manual"]["Skip"] = dic["all"]["Tested"]["manual"]["Skip"] + dom["ManualSkip"]

        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["auto"] = {}
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["auto"]["Pass"] = dom["AutomatedPass"]
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["auto"]["Fail"] = dom["AutomatedFail"]
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["auto"]["Skip"] = dom["AutomatedSkip"]

        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["manual"] = {}
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["manual"]["Pass"] = dom["ManualPass"]
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["manual"]["Fail"] = dom["ManualFail"]
        dic["TcAggregate"]["domain"][dom["Domain"]]["Tested"]["manual"]["Skip"] = dom["ManualSkip"]

    return dic

def aggregateTcStatus(Release):
    print(Release)
    tcInfo = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
    applicableTcInfo = tcInfo.filter(~Q(Priority = "NA"))

    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(Release).values("Domain").all()

    latestTcStatus = LATEST_TC_STATUS.objects.using(Release).all()

    for dom in domains:
        newData = {}

        domain = dom["Domain"]
        domainTc = tcInfo.filter(Domain = domain)
        applicableDomainTc = domainTc.filter(~Q(Priority = "NA"), ~Q(Priority = "Skip"))

        newData["Domain"] = domain

        newData["Total"] = domainTc.count()
        newData["NotApplicable"] = domainTc.filter(Priority = "NA").count()
        newData["Skipped"] = domainTc.filter(Priority = "Skip").count()
        newData["Automated"] = domainTc.filter(~Q(TcName = "TC NOT AUTOMATED")).count()
        newData["NonAutomated"] = domainTc.filter(TcName = "TC NOT AUTOMATED").count()

        newData["Tested"] = latestTcStatus.filter(Domain = domain).count()
        newData["NotTested"] = applicableDomainTc.count() - newData["Tested"]

        manualTcStatus = latestTcStatus.filter(Domain = domain).filter(TcName = "TC NOT AUTOMATED")
        newData["ManualPass"] = manualTcStatus.filter(Result = "Pass").count()
        newData["ManualFail"] = manualTcStatus.filter(Result = "Fail").count()
        newData["ManualSkip"] = manualTcStatus.filter(Result = "Skip").count()

        automatedTcStatus = latestTcStatus.filter(Domain = domain).filter(~Q(TcName = "TC NOT AUTOMATED"))
        newData["AutomatedPass"] = automatedTcStatus.filter(Result = "Pass").count()
        newData["AutomatedFail"] = automatedTcStatus.filter(Result = "Fail").count()
        newData["AutomatedSkip"] = automatedTcStatus.filter(Result = "Skip").count()

        aggrTcStatus = AGGREGATE_TC_STATE.objects.using(Release).filter(Domain = domain)
        if len(aggrTcStatus) == 0:
            fd = AggregationForm(newData)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
            else:
                print(fd.errors)
    return getAggregate(Release)


def TCAGGREGATE(Release):
        dictionary = {}

        total = 0
        totalpass = 0
        totalfail = 0
        totalskipped = 0
        totalnottested = 0

        autopass = 0
        autofail = 0
        autoskipped = 0

        #dictionary['domain'] = {}
        #dictionary['AvailableDomainOptions'] = {}
        #dictionary['AvailableScenarios'] = []

        data = LATEST_TC_STATUS.objects.using(Release).all()
        serializer = LATEST_TC_STATUS_SERIALIZER(data, many=True)

        tcInfoCli = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
        tcinfo = tcInfoCli.filter(~Q(Priority = "NA"))
        tcinfoserializer = TC_INFO_SERIALIZER(tcinfo, many=True)

        automated = tcinfo.filter(~Q(TcName = "TC NOT AUTOMATED")).count()
        nonautomated = tcinfo.filter(TcName = "TC NOT AUTOMATED").count()
        notapplicable = tcInfoCli.filter(Priority = "NA").count()

        scenario = tcinfo.values('Scenario').distinct()
        for tc in scenario:
            pass
            #dictionary['AvailableScenarios'].append(tc['Scenario'])

        domains = tcinfo.values('Domain').distinct()
        for tc in domains:
            domain = tc['Domain']

            subdomains = tcinfo.values('SubDomain').filter(Domain = domain).distinct()
            for sd in subdomains:
                subdomain = sd['SubDomain']

                #if domain not in dictionary['AvailableDomainOptions']:
                #    pass
                #    dictionary['AvailableDomainOptions'][domain] = []
                #dictionary['AvailableDomainOptions'][domain].append(subdomain)

            #if domain not in dictionary['domain']:
            #    dictionary['domain'][domain] = {}
            #    dictionary['domain'][domain]['Tested'] = {}

            #    tcByDomain = tcInfoCli.filter(Domain = domain)
            #    domainallcount = tcInfoCli.filter(Domain = tc['Domain']).count()

            #    dictionary['domain'][tc['Domain']]['NotApplicable'] = tcByDomain.filter(Priority = "NA").count()

            #    dictionary['domain'][tc['Domain']]['Tested']['auto'] = {}
            #    dictionary['domain'][tc['Domain']]['Tested']['manual'] = {}

            #    tcinfocount = tcByDomain.filter(TcName = "TC NOT AUTOMATED").count()
            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Pass").count()
            #    if Release == "2.3.0":
            #        d = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'])
            #    dictionary['domain'][tc['Domain']]['Tested']['manual']['Pass'] = tccount
            #    totalpass += tccount
            #    domainallcount -= tccount

            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "Fail").count()
            #    dictionary['domain'][tc['Domain']]['Tested']['manual']['Fail'] = tccount
            #    totalfail += tccount
            #    domainallcount -= tccount

            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(TcName = "TC NOT AUTOMATED").filter(Domain = tc['Domain'], Result = "NotTested").count()
            #    dictionary['domain'][tc['Domain']]['Tested']['manual']['Skip'] = tccount
            #    totalskipped += tccount

            #    tcinfocount = TC_INFO.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain']).count()
            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Pass").count()
            #    dictionary['domain'][tc['Domain']]['Tested']['auto']['Pass'] = tccount
            #    totalpass += tccount
            #    autopass += tccount
            #    domainallcount -= tccount

            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "Fail").count()
            #    dictionary['domain'][tc['Domain']]['Tested']['auto']['Fail'] = tccount
            #    totalfail += tccount
            #    autofail += tccount
            #    domainallcount -= tccount

            #    tccount = LATEST_TC_STATUS.objects.using(Release).filter(~Q(TcName = "TC NOT AUTOMATED")).filter(Domain = tc['Domain'], Result = "NotTested").count()
            #    dictionary['domain'][tc['Domain']]['Tested']['auto']['Skip'] = tccount
            #    totalskipped += tccount
            #    autoskipped += tccount

            #    dictionary['domain'][tc['Domain']]['NotTested'] = domainallcount
            #    totalnottested += dictionary['domain'][tc['Domain']]['NotTested']

        notapplicable = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI")).filter(Priority = "NA").count()

        #dictionary['all'] = {}

        #dictionary['all']['Tested'] = {}
        #guitcinfo = TC_INFO.objects.using(Release).filter(Domain = "GUI").count()
        #dictionary['all']['GUI'] = guitcinfo
        #dictionary['all']['NotTested'] = totalnottested
        #dictionary['all']['NonAutomated'] = nonautomated
        #dictionary['all']['Automated'] = automated
        #dictionary['all']['NotApplicable'] = notapplicable

        #dictionary['all']['Tested']['auto'] = {}
        tcinfo1 = TC_INFO.objects.using(Release).filter(~Q(Domain = "GUI"))
        #dictionary['all']['All'] = tcinfo1.count()
        tcstatus1 = LATEST_TC_STATUS.objects.using(Release).all()
        tcstatusserializer1 = LATEST_TC_STATUS_SERIALIZER(tcstatus1, many = True)

        #manualpass = totalpass - autopass
        #manualfail = totalfail - autofail
        #manualskipped = totalskipped - autoskipped

        #totalSkipped = tcinfo1.filter(Priority = "Skip").count()
        
        priorities = tcinfo1.values('Priority').distinct()
        dictionary['Priority'] = {}

        for prior in priorities:
            dictionary['Priority'][prior['Priority']] = {}

            dictionary['Priority'][prior['Priority']]['Pass'] = 0
            dictionary['Priority'][prior['Priority']]['Fail'] = 0
            dictionary['Priority'][prior['Priority']]['NotTested'] = 0
            dictionary['Priority'][prior['Priority']]['Skip'] = 0

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

                if flag == 0:
                    dictionary['Priority'][prior['Priority']]['NotTested'] += 1

        #if Release == "2.4.0" or Release == "5.0.0":
        #    tcinfoserializer1 = TC_INFO_SERIALIZER(tcinfo1, many = True)
        #    autopass = 0
        #    autofail = 0
        #    autoskipped = 0
        #    manualpass = 0
        #    manualfail = 0
        #    manualskipped = 0

        #    for status in tcstatusserializer1.data:
        #        flag = 0
        #        for tc in tcinfoserializer1.data:
        #            if tc['TcID'] == status['TcID'] and tc['CardType'] == status['CardType']:
        #                flag = 1


        #        if flag == 1:
        #            if status["TcName"] == "TC NOT AUTOMATED":
        #                if status['Result'].lower() == "pass":
        #                    manualpass += 1
        #                elif status['Result'].lower() == "fail":
        #                    manualfail += 1
        #                elif status['Result'].lower() == "skip":
        #                    manualskipped += 1
        #            else:
        #                if status['Result'].lower() == "pass":
        #                    autopass += 1
        #                elif status['Result'].lower() == "fail":
        #                    autofail += 1
        #                elif status['Result'].lower() == "skip":
        #                    autoskipped += 1

        #dictionary['all']['Skip'] = totalSkipped

        #dictionary['all']['Tested']['auto']['Pass'] = autopass
        #dictionary['all']['Tested']['auto']['Fail'] = autofail
        #dictionary['all']['Tested']['auto']['Skip'] = autoskipped

        #dictionary['all']['Tested']['manual'] = {}
        #dictionary['all']['Tested']['manual']['Pass'] = manualpass
        #dictionary['all']['Tested']['manual']['Fail'] = manualfail
        #dictionary['all']['Tested']['manual']['Skip'] = manualskipped

        return dictionary

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
            print(req)
            print(fd.errors)
        # GenerateLogData(1, 'POST', 'specificuserbyid/' + str(id) + " => " + json.dumps(req))
        # return JsonResponse({'Error': fd.errors}, status = 400)
        return HttpResponse(fd.errors)
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
    print(SetupName, c)

    tccounter = 0
    data = TC_INFO.objects.all()
    serializer = TC_INFO_SERIALIZER(data, many=True)
    d = json.dumps(serializer.data)
    d = json.loads(d)
    print("row count of tc in db",len(d))
    for i in range(len(d)):
        tccounter += len(d[i]['Setup'])
    print("all tcs with addded setups", tccounter)

    # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def RELEASEINFOPOST(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        req.pop('TcAggregate', None)

        fd = ReleaseInfoForm(req)
        if fd.is_valid():
            res = createReleaseDB(req['ReleaseNumber'])
            if res == 0:
                print("Database already exists")
            else:
                print("Created Database succesfully")
            fd.save()
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            # return JsonResponse({'Sucess': 'SUCCESSFULLY ADDED NEW RELEASE'}, status = 200)
            print("SUCCESSFULLY ADDED NEW RELEASE")
            return HttpResponse("SUCCESSFULLY ADDED NEW RELEASE")
        else:
            print(fd.errors)
            # GenerateLogData(1, 'POST', 'specificuserbyid/' + str(id) + " => " + json.dumps(req))
            # return JsonResponse({'Error': fd.errors}, status = 400)
            return HttpResponse(fd.errors)


@csrf_exempt
def RELEASEINFO(request, Release):
    if request.method == "GET":
        startTime = time.time()
        list = []
        
        if(Release == 'all'):
            data = RELEASES.objects.all()
            serializer = RELEASE_SERIALIZER(data, many = True)

            for i in serializer.data:
                data = json.dumps(i)
                data = json.loads(data)
    
                if(i['ReleaseNumber'] != "universal"):
                    tcaggr(i['ReleaseNumber'])
                    a = getAggregate(i['ReleaseNumber'])   #remove this comment after hitting release/all first and then comment below line, one more condition is bytes returned by both the functions must be same else UI will not work!!!
                    a = TCAGGREGATE(i['ReleaseNumber']) #comment this line after above given condition is met
                    aggregateTcStatus(i["ReleaseNumber"])
                    data['TcAggregate'] = a

                    if i['ReleaseNumber'] == "5.0.0":
                        #continue
                        i['ReleaseNumber'] = "Test Database"
                    #data['TcAggregate'] = a
                list.insert(0, data)

            endTime = time.time()
            print("Total time taken by release/all", endTime - startTime)
            return HttpResponse(json.dumps(list), status = 200)
        else:
            data = RELEASES.objects.using('universal').filter(ReleaseNumber__icontains = Release)
            serializer = RELEASE_SERIALIZER(data, many = True)
            return HttpResponse(json.dumps(serializer.data), status = 200)

    elif request.method == "DELETE":
        try:
            data = RELEASES.objects.get(ReleaseNumber__icontains = Release).delete()
            if "Activity" in req:
               AD = request['Activity']
               GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            # return JsonResponse({'Success': "DELETED SUCCESSFULLY"}, status = 200)
            return HttpResponse("DELETED SUCCESSFULLY")
        except RELEASES.DoesNotExist:
            error_message = "OBJECT NOT PRESENT CANNOT BE DELETED!!"
            # return JsonResponse({'Error': error_message}, status = 400)
            return HttpResponse(error_message)

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
            # return JsonResponse({'Success': "RECORD UPDATED SUCCESSFULLY"}, status = 200)
            return HttpResponse("SUCCESS")
        except:
            # return JsonResponse({'error': "SOME ERROR OCCURED"}, status = 400)
            return HttpResponse("SOME ERROR OCCURED")

    # elif request.method == "POST":
    #     try:
    #         data = RELEASES.objects.get(ReleaseNumber__icontains = Release)
    #         serializer = RELEASE_SERIALIZER(data, data=request.data)

    #         if serializer.is_valid():
    #             serializer.save()
    #         return HttpResponse(json.dumps(serializer))
    #     except:
    #         pass

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
            data = USER_INFO.objects.get(UserName = req['email'])
            serializer = USER_SERIALIZER(data)
            #GenerateLogData(serializer.data['UserName'], 'POST', 'user/login', json.dumps(req))
            return JsonResponse({'role': serializer.data['Role']}, status = 200)
        except:
            print("except")
            data ={}
            data['Designation'] = "UNKNOWN"
            data['UserName'] = req['email']
            if 'Role' not in req:
                data['Role'] = "ADMIN"
            else:
                data['Role'] = req['Role']

            fd = UserInfoForm(data)
            if fd.is_valid():
                fd.save()
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                return JsonResponse({'role': data['Role']}, status = 200)
            else:
                return JsonResponse({'error': fd.errors}, status = 400)
            #GenerateLogData(data['UserName'], 'POST', 'user/login', json.dumps(req))

        return JsonResponse({'role': data['Role']}, status = 200)

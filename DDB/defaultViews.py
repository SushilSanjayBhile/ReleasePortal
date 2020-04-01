# Django packages
from django.db.models import Q
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

# imports from django app
from .models import DEFAULT_DOMAIN_SUBDOMAIN
from .forms import DomainSubDomainForm
from DDB.serializers import DOMAIN_SUBDOMAIN_SERIALIZER

import datetime
from .forms import LogForm

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
def DEFAULT_SUBDOMAIN_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        try:
            dom = DEFAULT_DOMAIN.objects.using(Release).get(Domain = req['Domain'])
            print(dom.id)
            data = DEFAULT_SUBDOMAIN.objects.using(Release).filter(SubDomain = req['SubDomain']).filter(Domain = int(dom.id))
            print(len(data))
            if len(data) > 0:
                return HttpResponse("Conflict: Values already exists", status = 409)
        except:
            pass

        req['Domain'] = dom.id
        fd = SubDomainForm(req)
        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            return HttpResponse("Sucess", status = 200)
        else:
            return HttpResponse(json.dumps(fd.errors), status = 500)

    if request.method == "GET":
       data = DEFAULT_SUBDOMAIN.objects.using(Release).all()
       serializer = SUBDOMAIN_SERIALIZER(data, many = True)
       return HttpResponse(json.dumps(serializer.data), status = 200)

@csrf_exempt
def DEFAULT_DOMAIN_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        errorList = []

        for domain in req['domains']:
            dictionary = {}
            dictionary['Domain'] = domain
            try:
                data = DEFAULT_DOMAIN.objects.using(Release).get(Domain = domain)
                errorList.append("Domain- " + domain + " already exists")
                #return HttpResponse("Conflict: Values already exists", status = 409)
            except:
                fd = DomainForm(dictionary)
                if fd.is_valid():
                    data = fd.save(commit = False)
                    print(domain, "NOT AVAILABLE")
                    data.save(using = Release)
                    if "Activity" in req:
                        AD = req['Activity']
                        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                else:
                    errorList.append(str(fd.errors))

            if len(errorList) > 0:
                return HttpResponse("Error: " + json.dumps(errorList), status = 500)
            return HttpResponse("Sucess", status = 200)

    if request.method == "GET":
       data = DEFAULT_DOMAIN.objects.using(Release).all()
       serializer = DOMAIN_SERIALIZER(data, many = True)
       return HttpResponse(json.dumps(serializer.data), status = 200)

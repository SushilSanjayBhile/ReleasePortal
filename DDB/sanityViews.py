from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import Trunc
import json, time

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, E2E_SERIALIZER, STRESS_SERIALIZER, LONGEVITY_SERIALIZER,UI_SERIALIZER
from .models import E2E, LONGEVITY, STRESS, LOGS,UI
from .forms import TcInfoForm, E2EForm, StressForm, LongevityForm,UIForm
from django.db.models import Q
import datetime
from .forms import LogForm


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
def SANITY_VIEW(request, SanityType, Release):
    if "update" in SanityType.lower():
        return SanityUpdateView(request, Release, SanityType)
    if "delete" not in SanityType.lower():
        return SanityView(request, Release, SanityType)
    else:
        return SanityDeleteView(request, Release, SanityType)

def SanityDeleteView(request, Release, SanityType):
    if request.method == "POST":
        requests = json.loads(request.body.decode("utf-8"))

        for req in requests:
            if "e2e" in SanityType.lower():
                data = E2E.objects.using(Release).get(id = req['id']).delete()
            if "ui" in SanityType.lower():
                data = UI.objects.using(Release).get(id = req['id']).delete()
            if "stress" in SanityType.lower():
                data = STRESS.objects.using(Release).get(id = req['id']).delete()
            if "longevity" in SanityType.lower():
                data = LONGEVITY.objects.using(Release).get(id = req['id']).delete()

            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        return HttpResponse("SUCCESS")
        # return JsonResponse({'Success': "Record added successfully"}, status = 200)

def SanityView(request, Release, SanityType):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        req['CardType'] = req['CardType'][0]


        if SanityType.lower() == "e2e":
            fd = E2EForm(req)
        if SanityType.lower() == "ui":
            fd = UIForm(req)
        if SanityType.lower() == "stress":
            fd = StressForm(req)
        if SanityType.lower() == "longevity":
            fd = LongevityForm(req)

        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
            if "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        else:
            print(fd.errors)
            return JsonResponse({'Error': fd.errors}, status = 400)
        return HttpResponse("SUCCESS")
        # return JsonResponse({'Success': "Record added successfully"}, status = 200)


    elif request.method == "GET":
        if SanityType.lower() == "e2e":
            data = E2E.objects.using(Release).all()
            serializer = E2E_SERIALIZER(data, many = True)
        if SanityType.lower() == "ui":
            data = UI.objects.using(Release).all()
            serializer = UI_SERIALIZER(data, many = True)
        if SanityType.lower() == "stress":
            data = STRESS.objects.using(Release).all()
            serializer = STRESS_SERIALIZER(data, many = True)
        if SanityType.lower() == "longevity":
            data = LONGEVITY.objects.using(Release).all()
            serializer = LONGEVITY_SERIALIZER(data, many = True)

        return HttpResponse(json.dumps(serializer.data))
        # return JsonResponse({'data': json.dumps(serializer.data)}, status = 200)

    elif request.method == "DELETE":
        req = json.loads(request.body.decode("utf-8"))
        req['CardType'] = req['CardType'][0]
        print(req)

def updateUI(updatedData, data, Release):
    try:
        data.User = updatedData['User']
        data.Date = updatedData['Date']
        data.Build = updatedData['Build']
        data.Tag = updatedData['Tag']
        data.Result = updatedData['Result']
        data.Bugs = updatedData['Bugs']
        data.CardType = updatedData['CardType']
        data.NoOfTCsPassed = updatedData['NoOfTCsPassed']
        data.UIFocus = updatedData['UIFocus']
        data.UISkipList = updatedData['UISkipList']
        data.Setup = updatedData['Setup']
        data.Notes = updatedData['Notes']

        data.save(using = Release)
        return "S"
    except:
        return "F"

def updateE2E(updatedData, data, Release):
    try:
        data.User = updatedData['User']
        data.Date = updatedData['Date']
        data.Build = updatedData['Build']
        data.Tag = updatedData['Tag']
        data.Result = updatedData['Result']
        data.Bugs = updatedData['Bugs']
        data.CardType = updatedData['CardType']
        data.NoOfTCsPassed = updatedData['NoOfTCsPassed']
        data.E2EFocus = updatedData['E2EFocus']
        data.E2ESkipList = updatedData['E2ESkipList']
        data.Setup = updatedData['Setup']
        data.Notes = updatedData['Notes']

        data.save(using = Release)
        return "S"
    except:
        return "F"

def updateStress(updatedData, data, Release):
    try:
        data.User = updatedData['User']
        data.Date = updatedData['Date']
        data.Build = updatedData['Build']
        data.CardType = updatedData['CardType']
        data.CfgFileUsed = updatedData['CfgFileUsed']
        data.Result = updatedData['Result']
        data.LinkFlap = updatedData['LinkFlap']
        data.NoOfIteration = updatedData['NoOfIteration']
        data.Bugs = updatedData['Bugs']
        data.Notes = updatedData['Notes']
        data.Setup = updatedData['Setup']

        data.save(using = Release)
        return "S"
    except:
        return "F"

def updateLongevity(updatedData, data, Release):
    try:
        data.User = updatedData['User']
        data.Date = updatedData['Date']
        data.Build = updatedData['Build']
        data.Result = updatedData['Result']
        data.Bugs = updatedData['Bugs']
        data.CardType = updatedData['CardType']
        data.NoOfDuration = updatedData['NoOfDuration']
        data.Notes = updatedData['Notes']
        data.Setup = updatedData['Setup']

        data.save(using = Release)
        return "S"
    except:
        return "F"


def SanityUpdateView(request, Release, SanityType):
    if request.method == "POST":
        errRecords  = []
        request = json.loads(request.body.decode("utf-8"))

        for req in request:

            if "ui" in SanityType.lower():
                data = UI.objects.using(Release).get(id = req['id'])
                serializer = UI_SERIALIZER(data)
                updatedData = serializer.data
                print(updatedData, req)

                for key in req:
                    updatedData[key] = req[key]

                res = updateUI(updatedData, data, Release)
                if res == "F":
                    errRecords.append(req)

            if "e2e" in SanityType.lower():
                data = E2E.objects.using(Release).get(id = req['id'])
                serializer = E2E_SERIALIZER(data)
                updatedData = serializer.data
                print(updatedData, req)

                for key in req:
                    updatedData[key] = req[key]

                res = updateE2E(updatedData, data, Release)
                if res == "F":
                    errRecords.append(req)

            if "stress" in SanityType.lower():
                data = STRESS.objects.using(Release).get(id = req['id'])
                serializer = STRESS_SERIALIZER(data)
                updatedData = serializer.data
                print(updatedData, req)

                for key in req:
                    updatedData[key] = req[key]

                res = updateStress(updatedData, data, Release)
                if res == "F":
                    errRecords.append(req)

            if "longevity" in SanityType.lower():
                data = LONGEVITY.objects.using(Release).get(id = req['id'])
                serializer = LONGEVITY_SERIALIZER(data)
                updatedData = serializer.data
                print(updatedData, req)

                for key in req:
                    updatedData[key] = req[key]

                res = updateLongevity(updatedData, data, Release)
                if res == "F":
                    errRecords.append(req)

            if res == "S":
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])

        if len(errRecords) > 0:
            return HttpResponse(errRecords, status = 500)
        return HttpResponse("SUCCESS", status = 200)
        # return JsonResponse({'Success': "Record added successfully"}, status = 200)


from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import Trunc
import json, time
from django.db.models import Q

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS
from .forms import TcInfoForm
from .views import GenerateLogData

@csrf_exempt
def WHOLE_TC_INFO(request, Release):
    if request.method == "GET":
        AllInfoData = []
        statusDict = {}

        infodata = TC_INFO.objects.using(Release).all()
        #infodata = TC_INFO.objects.using(Release).filter(~Q(Priority = "NA"))
        statusdata = TC_STATUS.objects.using(Release).all().order_by('Date')

        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
        statusserializer = TC_STATUS_SERIALIZER(statusdata, many=True)

        d = json.dumps(statusserializer.data)
        d = json.loads(d)

        for i in d:
            card = i['CardType']
            tcid = i['TcID']

            if card not in statusDict:
                statusDict[card]= {}
            else:
                if tcid in statusDict[card]: 
                    statusDict[card][tcid].append(i)
                else:
                    statusDict[card][tcid] = []
                    statusDict[card][tcid].append(i)
        
        for info in infoserializer.data:
            info['StautsList'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}
            info['CurrentStauts'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}

            card = info['CardType']
            tcid = info['TcID']

            if len(statusDict) > 0:
                if card in statusDict and tcid in statusDict[card]:
                    info['StatusList'] = statusDict[card][tcid]
                    if len(statusDict[card][tcid]) > 0:
                        info['CurrentStatus'] = statusDict[card][tcid][-1]

            AllInfoData.append(info)

        return HttpResponse(json.dumps(AllInfoData))


@csrf_exempt
def TC_INFO_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        for i in req['CardType']:
            data = TC_INFO.objects.using(Release).filter(TcID = req['TcID']).filter(CardType = i)
            if len(data) != 1 and len(data) != 0:
                return JsonResponse({'message': 'Duplicate TcID'}, status = 401)

            serializer = TC_INFO_SERIALIZER(data, many = True)
            newData  = req
            newData = json.dumps(newData)
            newData = json.loads(newData)
            newData['CardType'] = i
            print("\nnewdata", newData,"\n")
            
            fd = TcInfoForm(newData)

            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], i, AD['Release'])
                
                
        return HttpResponse("SUCCESSFULLY UPDATED")

    elif request.method == "GET":
        index = int(request.GET.get('index', 0))
        count = int(request.GET.get('count', 100))

        try:
            if count == 0:
                data = TC_INFO.objects.using(Release).all()[index : ]
            else:
                data = TC_INFO.objects.using(Release).all()[index : (index + count)]
        except:
            return JsonResponse({'message': 'Unknown error occured'}, status = 400)

        if len(data) == 0:
            return JsonResponse({'message': 'Records no found at given index'}, status = 400)

        serializer = TC_INFO_SERIALIZER(data, many=True)
        return HttpResponse(json.dumps(serializer.data))
    """
    elif request.method == "DELETE":
        req = json.loads(request.body.decode("utf-8"))
        data = TC_INFO.objects.filter(TcID = req['TcID'])
        serializer = TC_INFO_SERIALIZER(data,many = True)
        d = json.dumps(serializer.data)
        d = json.loads(d)        
        
        if(len(d[0]['Setup']) > 1):
            print(d[0]['Setup'])
            return HttpResponse("PLEASE PROVIDE SETUP ALSO NAME ALSO AS THERE ARE MULTIPLE SETUPS")
        if(len(d[0]['OrchestrationPlatform']) > 1):
            print(d[0]['OrchestrationPlatform'])
            return HttpResponse("PLEASE PROVIDE ORCHESTRATION PLATFORM NAME AS THERE ARE MULTIPLE PLATFORMS")

        return HttpResponse(json.dumps(d))
    """

@csrf_exempt
def MULTIPLE_TC_UPDATION(request, Release):
    if request.method == "PUT":
        req = json.loads(request.body.decode("utf-8"))
        print(len(req))

        for i in req:
            #print(req[i])
            card = i['CardType']
            tcid = i['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
            serializer = TC_INFO_SERIALIZER(data)
            newData = serializer.data
        
            for key in i:
                newData[key] = i[key]
            result = data.delete()

            fd = TcInfoForm(newData)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                """
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                """
                #result = data.delete()
            else:
                HttpResponse({"ERROR": fd.errors})
        
        return HttpResponse({"SUCCESS": "Record Successfully updated"})

    elif request.method == "DELETE":
        req = json.loads(request.body.decode("utf-8"))

        for i in req:
            card = i['CardType']
            tcid = i['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
            serializer = TC_INFO_SERIALIZER(data)
        
            newData = serializer.data
            newData['Status'] = "SKIP"
        
            fd = TcInfoForm(newData)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                """
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                """
                result = data.delete()
            else:
                HttpResponse({"ERROR": fd.errors})
        
        return HttpResponse({"SUCCESS": "Record Successfully updated"})
            
        
        return HttpResponse({"SUCCESS": "Record Successfully deleted of all cards"})

@csrf_exempt
def SPECIFIC_TC_INFO_BY_ID(request, Release, id, card):
    if request.method == "GET":
        data = TC_INFO.objects.using(Release).filter(TcID = id).get(CardType = card)
        activitydata = LOGS.objects.using(Release).filter(TcID = id).filter(CardType = card)
        logdata = LOG_SERIALIZER(activitydata, many = True)
        serializer = TC_INFO_SERIALIZER(data)
    
        try:
            statusData = TC_STATUS.objects.using(Release).filter(TcID = id).filter(CardType = card).order_by('Date')
            statusserializer = TC_STATUS_SERIALIZER(statusData, many=True)
    
            tcdata = serializer.data
            tcdata['Activity'] = logdata.data
            tcdata['StatusList'] = []
            for status in statusserializer.data:
                tcdata['StatusList'].append(status)
        except:
            return HttpResponse({"ERROR": "NO RECORD FOUND"})
            
        return HttpResponse(json.dumps(tcdata))

@csrf_exempt
def SPECIFIC_TC_INFO_BY_ID2(request, Release, id, card):
    if request.method == "PUT":
        req = json.loads(request.body.decode("utf-8"))

        data = TC_INFO.objects.using(Release).filter(TcID = id)
        serializer = TC_INFO_SERIALIZER(data, many = True)
        newData = serializer.data

        for d in serializer.data:
            singleData = TC_INFO.objects.using(Release).filter(TcID = id).get(CardType = d['CardType'])
            singleSerializer = TC_INFO_SERIALIZER(singleData)
            newData = singleSerializer.data

            for key in req:
                if key != "CardType" and key != "TcID" and key != "Activity":
                    newData[key] = req[key]


            fd = TcInfoForm(newData)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                singleData.delete()
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            else:
                HttpResponse({"ERROR": fd.errors})
        return HttpResponse({"SUCCESS": "Record Successfully updated"})

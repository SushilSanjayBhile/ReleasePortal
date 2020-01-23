from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse

import json

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER
from .models import TC_INFO, TC_STATUS
from .forms import TcInfoForm

@csrf_exempt
def WHOLE_TC_INFO(request, Release):
    if request.method == "GET":
        AllInfoData = []
        count = 0

        data = TC_INFO.objects.using(Release).all()
        
        serializer = TC_INFO_SERIALIZER(data, many=True)
        for i in serializer.data:
            count += 1
            id = i['TcID']
            print(i['CardType'])
            data = TC_STATUS.objects.using(Release).filter(TcID = id).order_by('Date').filter(CardType = i['CardType'])
            serializedData = TC_STATUS_SERIALIZER(data, many=True)
            try:
                i['CurrentStatus'] = serializedData.data[0]
            except:
                i['CurrentStatus'] = serializedData.data

            AllInfoData.append(i)
            print(count, len(serializer.data))

        
        return HttpResponse(json.dumps(AllInfoData))


@csrf_exempt
def WHOLE_TC_INFO1(request, Release):
    if request.method == "GET":
        AllInfoData = []

        infodata = TC_INFO.objects.using(Release).all()
        statusdata = TC_STATUS.objects.using(Release).all()

        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
        statusserializer = TC_STATUS_SERIALIZER(statusdata, many=True)

        d = json.dumps(statusserializer.data)
        d = json.loads(d)

        for info in infoserializer.data:
            try:
                for status in d:
                    if status['TcID'] == info['TcID'] and status['CardType'] == info['CardType']:
                        info['CurrentStatus'] = status
                        d.remove(status)
                        AllInfoData.append(info)
            except:
                pass
        return HttpResponse(json.dumps(AllInfoData))


@csrf_exempt
def TC_INFO_PUT_VIEW(request, Release, id, card):
    req = json.loads(request.body.decode("utf-8"))

    data = TC_INFO.objects.using(Release).filter(TcID = id).get(CardType = card)
    serializer = TC_INFO_SERIALIZER(data, data = req)

    if serializer.is_valid():
        serializer.save()
        return HttpResponse("RECORD SUCCESSFULLY UPDATED")
    else:
        print(serializer.errors)
        return HttpResponse(json.dumps(serializer.errors))


@csrf_exempt
def TC_INFO_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))

        data = TC_INFO.objects.using(Release).filter(TcID = req['TcID']).filter(CardType = req['CardType'])
        if len(data) == 1:
            return HttpResponse("ERROR: RECORD WITH SAME ID AND CARD TYPE ALREADY EXISTS")

        fd = TcInfoForm(req)

        if fd.is_valid():
            data = fd.save(commit = False)
            data.save(using = Release)
            return HttpResponse("SUCCESSFULLY SAVED")
        else:
            try:
                data = TC_INFO.objects.using(Release).get(TcID = req['TcID'])
                # data.CardType.append(req['CardType'])
                # data.OrchestrationPlatform.append(req['OrchestrationPlatform'])
                data = data.save(commit = False)
                data.save(using = Release)
                return HttpResponse("SUCCESSFULLY UPDATED")
            except:
                return HttpResponse("ERROR OCCURED")

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


@csrf_exempt
def SPECIFIC_TC_INFO_BY_NAME(request, Release, name, card):
    d = {}
    # data = TC_INFO.objects.using(Release).filter(TcID = name).filter(CardType = card)
    data = TC_INFO.objects.using(Release).all()
    serializer = TC_INFO_SERIALIZER(data, many = True)
    for i in serializer.data:
        if i['CardType'] in d:
            if i['TcID'] in d[i['CardType']]:
                d[i['CardType']][i['TcID']] += 1
            else:
                d[i['CardType']][i['TcID']] = 1
        else:
            d[i['CardType']] = {}

    for i in d:
        for j in d[i]:
            if d[i][j] > 1:
                print(i, j, d[i][j])
                
    return HttpResponse(json.dumps(serializer.data))

@csrf_exempt
def SPECIFIC_TC_INFO_BY_ID(request, Release, id, card):
    data = TC_INFO.objects.using(Release).filter(TcID = id).filter(CardType = card)
    serializer = TC_INFO_SERIALIZER(data, many = True)

    try:
        statusData = TC_STATUS.objects.using(Release).filter(TcID = id).filter(CardType = card)
        statusserializer = TC_STATUS_SERIALIZER(statusData, many=True)

        tcdata = serializer.data[0]
        tcdata['StatusList'] = []
        for status in statusserializer.data:
            tcdata['StatusList'].append(status)
    except:
        tcdata = serializer.data[0]
        tcdata['StatusList'] = []

    return HttpResponse(json.dumps(tcdata))
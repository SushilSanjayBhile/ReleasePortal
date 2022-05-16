
# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import  RELEASEBUILDSINFO
from DDB.serializers import RELEASE_BUILD_INFO_SERIALIZER
from .forms import RELEASEBUILDINFO_Form
import json

@csrf_exempt
def RELEASEBUILDINFOGETPOSTVIEW(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        #print("reques",req)
        for i in req['buildDataArray']:
            fd = RELEASEBUILDINFO_Form(i)
            if fd.is_valid():
                data = fd.save(commit = False)
                data.save()
                # if "Activity" in req:
                #     AD = req['Activity']
                #     GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            else:
                print(req)
                print(fd.errors)
                return JsonResponse({'Error': fd.errors}, status = 400)
        
        return HttpResponse("SUCCESS")
    
    elif request.method == "GET":
        data = RELEASEBUILDSINFO.objects.all()
        serializer = RELEASE_BUILD_INFO_SERIALIZER(data, many = True)
        buildDataDict = {}
        arr = []
        arr1 = []
        successCount = 0
        failureCount = 0

        for item in serializer.data:
            if item['buildName'] not in iter(buildDataDict.values()):
                buildDataDict['buildName'] = item['buildName']
                arr.append({'buildName' : item['buildName'],'ReleaseNumber':item['ReleaseNumber']})
        
        for i in arr:
            name = i['buildName']
            release = i['ReleaseNumber']
            successCount = 0
            failureCount = 0
            for itr in serializer.data:
                if name == itr['buildName']:
                    if itr['buildResult'] == 'SUCCESS':
                        successCount += 1
                    if itr['buildResult'] == 'FAILURE':
                        failureCount += 1
            arr1.append({'ReleaseNumber':release,'buildName':name,'success':successCount,'failure':failureCount})
        return JsonResponse({'data':arr1})
    


@csrf_exempt
def RELEASEBUILDINFODELETEVIEW(request):

    if request.method == "DELETE":
        
        req = json.loads(request.body.decode("utf-8"))
        buildName = req['data1'][0]['buildName']
        data = RELEASEBUILDSINFO.objects.filter(buildName=buildName).delete()
        serializer = RELEASE_BUILD_INFO_SERIALIZER(data, many = True)
        print(data)
        
        #buildDataDict = {}
        #arr = []
        #arr1 = []
        #successCount = 0
        #failureCount = 0

        #for item in serializer.data:
        #    if item['buildName'] == buildName:
        #        #print("\n\n",item,"\n\n")
        #        del(item)

        #print("After Delete Operation")
        #for item in serializer.data:
        #    print("\n\n",item,"\n\n")
        
        return JsonResponse({'status':"SUCCESS"})

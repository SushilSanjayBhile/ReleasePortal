
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

        print(req,"\n\n\n\n")
        #req = request.body
        fd = RELEASEBUILDINFO_Form(req['buildDataArray3'])
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
        data = RELEASEBUILDSINFO.objects.using().all()
        serializer = TC_STATUS_GUI_SERIALIZER(data, many = True)
        return HttpResponse(json.dumps(serializer.data))

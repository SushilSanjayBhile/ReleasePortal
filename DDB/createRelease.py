# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO,TC_INFO_GUI

from DDB.serializers import TC_INFO_SERIALIZER,TC_INFO_GUI_SERIALIZER

from .forms import TcInfoForm

def mergeDB(request,Release):
    release = "DCX-DMC-Master"
    if request.method == 'GET':
        print("\n " ,Release,"\n")
        data = TC_INFO.objects.using(Release).all().order_by('TcID')
        serializer = TC_INFO_SERIALIZER(data, many = True)

        print("len",len(serializer.data))
        for i in serializer.data:
            tcid = i["TcID"]
            card = i["CardType"]

            data = TC_INFO.objects.using(release).filter(TcID = tcid, CardType = card)
            if len(data) == 0:
                print("data",len(data),i)
                fd = TcInfoForm(i)

                if fd.is_valid():
            	    data = fd.save(commit = False)
            	    #data.save(using = release)
                else:
                    print("data is not valid for insert operation")


        return HttpResponse("Request served")

    

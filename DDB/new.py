from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
#from django.db.models.functions import Trunc

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, TC_STATUS_GUI_SERIALIZER, \
        LATEST_TC_STATUS_GUI_SERIALIZER, TC_INFO_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, \
        APPLICABILITY_SERIALIZER, AUTOMATION_COUNT_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LATEST_TC_STATUS, APPLICABILITY, \
        AUTOMATION_COUNT
from .forms import TcInfoForm
from django.db.models import Q

import json, time, os
from dp import settings
import datetime
from .forms import LogForm
from itertools import chain

rootRelease = "DCX-DMC-Master"

def get_previous_monday_date():
    now = datetime.datetime.now()
    previous_monday = now - (datetime.timedelta(days = 7) + datetime.timedelta(days = now.weekday()))
    return previous_monday

def get_previous_monday_record():
    previous_monday = get_previous_monday_date()
    data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = monday)

def get_if_monday_present():
    monday = now - datetime.timedelta(days = now.weekday())
    data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = monday)
    serializer = AUTOMATION_COUNT_SERIALIZER(data, many = True)
    return serializer.data

def get_current_monday_date():
    monday = now - datetime.timedelta(days = now.weekday())
    return monday

def create_current_monday_record():
    automation_count_dict = {}
    automation_count_dict["DateRange"] = get_current_monday_date()
    #automation_count_dict["Total"] = 
    #automation_count_dict["Automated"] = 
    print("Created")

@csrf_exempt
def automation_count_get_post_view(request):
    if request.method == "GET":
        previous_monday = get_previous_monday_date()
        monday_present = get_if_monday_present()

        return HttpResponse("get method")

    if request.method == "POST":
        return HttpResponse("POST method")

def update_automation_count(operation):
    if operation == "increaseTotal":
        monday_present = get_if_monday_present()

        #if monday_present == 0:


    #if operation == "increaseAutomated":
    #if operation == "decreaseTotal":
    #if operation == "decreaseAutomated":



from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
#from django.db.models.functions import Trunc

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, TC_STATUS_GUI_SERIALIZER, \
        LATEST_TC_STATUS_GUI_SERIALIZER, TC_INFO_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, \
        APPLICABILITY_SERIALIZER, AUTOMATION_COUNT_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LATEST_TC_STATUS, APPLICABILITY, \
        AUTOMATION_COUNT
from .forms import TcInfoForm, AUTOMATION_COUNT_FORM
from django.db.models import Q

import json, time, os, pytz
from dp import settings
import datetime
from .forms import LogForm
from itertools import chain

rootRelease = "DCX-DMC-Master"

def get_previous_monday_date():
    now = datetime.datetime.now()
    previous_monday = now - (datetime.timedelta(days = 7) + datetime.timedelta(days = now.weekday()))
    return previous_monday

def get_total_cli():
    infodata = TC_INFO.objects.using(rootRelease).all()
    return len(infodata)

def get_automated_cli():
    infodata = TC_INFO.objects.using(rootRelease).filter(~Q(TcName = "TC NOT AUTOMATED"))
    return len(infodata)

def get_total_gui():
    infodata = TC_INFO_GUI.objects.using(rootRelease).all()
    return len(infodata)

def get_automated_gui():
    infodata = TC_INFO_GUI.objects.using(rootRelease).filter(~Q(TcName = "TC NOT AUTOMATED"))
    return len(infodata)

def get_previous_monday_record():
    previous_monday = get_previous_monday_date()
    data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = previous_monday)

    if len(data) == 0:
        recordDict = {}
        recordDict["TotalCli"] = get_total_cli()
        recordDict["AutomatedCli"] = get_automated_cli()
        recordDict["TotalGui"] = get_total_gui()
        recordDict["AutomatedGui"] = get_automated_gui()

        return recordDict
    else:
        print(len(data))

def get_current_monday_record():
    monday = get_current_monday_date()
    data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = monday)
    serializer = AUTOMATION_COUNT_SERIALIZER(data, many = True)

    if len(data) == 0:
        recordDict = {}
        recordDict["TotalCli"] = get_total_cli()
        recordDict["AutomatedCli"] = get_automated_cli()
        recordDict["TotalGui"] = get_total_gui()
        recordDict["AutomatedGui"] = get_automated_gui()

        return recordDict
    else:
        data = AUTOMATION_COUNT.objects.using(rootRelease).get(DateRange = monday)
        serializer = AUTOMATION_COUNT_SERIALIZER(data)
        return data

def gcmr():
        monday = get_current_monday_date()
        data = AUTOMATION_COUNT.objects.using(rootRelease).get(DateRange = monday)
        serializer = AUTOMATION_COUNT_SERIALIZER(data)
        return serializer.data

def get_if_monday_present():
    monday = get_current_monday_date()
    data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = monday)
    serializer = AUTOMATION_COUNT_SERIALIZER(data, many = True)
    return len(serializer.data)

def get_current_monday_date():
    now = datetime.date.today()
    monday = now - datetime.timedelta(days = now.weekday())
    return monday

def create_current_monday_record():
    data = get_previous_monday_record()
    data["DateRange"] = get_current_monday_date()

    fd = AUTOMATION_COUNT_FORM(data)
    if fd.is_valid():
        print("CREATING NEW MONDAY RECORD")
        data = fd.save(commit = False)
        data.save(using = rootRelease)
    else:
        print("Error: ", fd.errors)

@csrf_exempt
def automation_count_get_post_view(request):
    if request.method == "GET":
        previous_monday = get_previous_monday_date()
        monday_present = get_if_monday_present()

        update_automation_count("increaseTotal", "GUI")
        update_automation_count("increaseAutomated", "GUI")
        update_automation_count("increaseTotal", "CLI")
        update_automation_count("increaseAutomated", "CLI")

        return HttpResponse("get method")

    if request.method == "POST":
        return HttpResponse("POST method")

def update_automation_count(operation, interface):
    monday_present = get_if_monday_present()

    if monday_present == 0:
        create_current_monday_record()
    else:
        oldRecord = get_current_monday_record()
        updatedRecord = get_current_monday_record()

        if interface == "CLI":
            if operation == "increaseTotal":
                oldRecord.TotalCli += 1
            if operation == "increaseAutomated":
                oldRecord.AutomatedCli += 1
        if interface == "GUI":
            if operation == "increaseTotal":
                oldRecord.TotalGui += 1
            if operation == "increaseAutomated":
                oldRecord.AutomatedGui += 1
        oldRecord.save(using = rootRelease)

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from .serializers import AUTOMATION_COUNT_SERIALIZER
from .models import TC_INFO, TC_INFO_GUI, AUTOMATION_COUNT
from .forms import AUTOMATION_COUNT_FORM
from django.db.models import Q

import json, time, os, pytz
import datetime

#rootRelease = "DCX-DMC-Master"
rootRelease = "TestDatabase"

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
    infodata = TC_INFO_GUI.objects.using(rootRelease).filter(Platform__contains = ["DMC"] )
    return len(infodata)

def get_automated_gui():
    infodata = TC_INFO_GUI.objects.using(rootRelease).filter(~Q(TcName = "TC NOT AUTOMATED"))
    return len(infodata)

def get_previous_monday_record():
    #previous_monday = get_previous_monday_date()
    #data = AUTOMATION_COUNT.objects.using(rootRelease).filter(DateRange = previous_monday)
    #if len(data) == 0:
    recordDict = {}
    recordDict["TotalCli"] = get_total_cli()
    recordDict["AutomatedCli"] = get_automated_cli()
    recordDict["TotalGui"] = get_total_gui()
    recordDict["AutomatedGui"] = get_automated_gui()

    return recordDict
    #else:
    #    print(len(data))

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

def get_all_weeks_records():
    data = AUTOMATION_COUNT.objects.using(rootRelease).all().order_by("-DateRange")
    serializer = AUTOMATION_COUNT_SERIALIZER(data, many = True)
    data = serializer.data
    for i in range(len(data)):
        if i < (len(data) - 1):
            data[i]["totalCLIDelta"] = data[i]["TotalCli"] - data[i + 1]["TotalCli"]
            data[i]["automatedCLIDelta"] = data[i]["AutomatedCli"] - data[i + 1]["AutomatedCli"]
            data[i]["totalGUIDelta"] = data[i]["TotalGui"] - data[i + 1]["TotalGui"]
            data[i]["automatedGUIDelta"] = data[i]["AutomatedGui"] - data[i + 1]["AutomatedGui"]
        else:
            data[i]["totalCLIDelta"] = data[i]["TotalCli"]
            data[i]["automatedCLIDelta"] = data[i]["AutomatedCli"]
            data[i]["totalGUIDelta"] = data[i]["TotalGui"]
            data[i]["automatedGUIDelta"] = data[i]["AutomatedGui"]
        data[i]["automation_perc_cli"] = round(data[i]["AutomatedCli"] * 100 / data[i]["TotalCli"], 2)
        data[i]["automation_perc_gui"] = round(data[i]["AutomatedGui"] * 100 / data[i]["TotalGui"], 2)
    return data

def calculate_all_weeks_records(data):
    for i in range(len(data)):
        if i < (len(data) - 1):
            data[i]["totalCLIDelta"] = data[i]["TotalCli"] - data[i + 1]["TotalCli"]
            data[i]["automatedCLIDelta"] = data[i]["AutomatedCli"] - data[i + 1]["AutomatedCli"]
            data[i]["totalGUIDelta"] = data[i]["TotalGui"] - data[i + 1]["TotalGui"]
            data[i]["automatedGUIDelta"] = data[i]["AutomatedGui"] - data[i + 1]["AutomatedGui"]
        else:
            data[i]["totalCLIDelta"] = data[i]["TotalCli"]
            data[i]["automatedCLIDelta"] = data[i]["AutomatedCli"]
            data[i]["totalGUIDelta"] = data[i]["TotalGui"]
            data[i]["automatedGUIDelta"] = data[i]["AutomatedGui"]
        data[i]["automation_perc_cli"] = round(data[i]["AutomatedCli"] * 100 / data[i]["TotalCli"], 2)
        data[i]["automation_perc_gui"] = round(data[i]["AutomatedGui"] * 100 / data[i]["TotalGui"], 2)

    for i in data:
        i["DateRange"] = str((datetime.datetime.strptime(i["DateRange"], '%Y-%m-%dT%H:%M:%SZ')).date())
    return data

def get_start_monday(date):
    start_monday = date - datetime.timedelta(days = date.weekday())
    return start_monday

def get_end_monday(date):
    end_monday = date + (datetime.timedelta(days = 7) - datetime.timedelta(days = date.weekday()))
    return end_monday

@csrf_exempt
def automation_count_get_post_view(request):
    if request.method == "GET":
        if get_if_monday_present() > 0:
            start_date = datetime.datetime.strptime(request.GET.get("startdate"), '%Y-%m-%d')
            start_week = get_start_monday(start_date)

            end_date = datetime.datetime.strptime(request.GET.get("enddate"), '%Y-%m-%d')
            end_week = get_end_monday(end_date)

            data = AUTOMATION_COUNT.objects.using(rootRelease).order_by("-DateRange").filter(DateRange__gte = start_week, DateRange__lt = end_week)
            serializer = AUTOMATION_COUNT_SERIALIZER(data, many = True)

            return HttpResponse(json.dumps(calculate_all_weeks_records(serializer.data)))
            #return HttpResponse(json.dumps(get_all_weeks_records()))
        else:
            create_current_monday_record()
            return HttpResponse(json.dumps(get_all_weeks_records()))

    if request.method == "POST":
        return HttpResponse("POST method")

def custom_automation_count_get_view(request):
    if request.method == "GET":
        request = json.loads(request.body.decode("utf-8"))

        start_date = request.GET.get("startdate", datetime.date.today())
        end_date = request.GET.get("enddate", datetime.date.today())

        print(start_date, end_date)
    return HttpResponse("CUSTOM AUTOMATION COUNT")

def update_automation_count(operation, interface):
    # These are some sample function calls
    # update_automation_count("increaseTotal", "GUI")
    # update_automation_count("increaseAutomated", "GUI")
    # update_automation_count("increaseTotal", "CLI")
    # update_automation_count("increaseAutomated", "CLI")

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
            if operation == "decreaseTotal":
                oldRecord.TotalCli -= 1
            if operation == "decreaseAutomated":
                oldRecord.AutomatedCli -= 1
        if interface == "GUI":
            if operation == "increaseTotal":
                oldRecord.TotalGui += 1
            if operation == "increaseAutomated":
                oldRecord.AutomatedGui += 1
            if operation == "decreaseTotal":
                oldRecord.TotalGui -= 1
            if operation == "decreaseAutomated":
                oldRecord.AutomatedGui -= 1
        oldRecord.save(using = rootRelease)

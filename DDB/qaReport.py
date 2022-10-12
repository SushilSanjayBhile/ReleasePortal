import requests, json
import datetime

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .views import RELEASEINFO
from .serializers import RELEASE_SERIALIZER, LOG_SERIALIZER, GUI_LOGS_SERIALIZER
from .models import RELEASES, LOGS, LOGSGUI, TC_INFO, TC_INFO_GUI
from django.db.models import Count
from django.db.models import Q
@csrf_exempt
def getQAReport(request):
    if request.method == "GET":
        start_date = datetime.datetime.strptime(request.GET.get("startdate"), '%Y-%m-%d').date()
        end_date = datetime.datetime.strptime(request.GET.get("enddate"), '%Y-%m-%d').date()
        data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
        serializer = RELEASE_SERIALIZER(data, many = True)
        releases = serializer.data
        output={}
        outputGui = {}
        output = RESULT_LOGS(releases, start_date, end_date)

        #for key in output:
        #    output[key]["auto"] = len(output[key]["auto"])
        outputGui = RESULT_LOGS_GUI(releases, start_date, end_date)

        #for key in outputGui:
        #    outputGui[key]["auto"] = len(outputGui[key]["auto"])

        for key in output:
            if key in outputGui:
                output[key]["auto"] = output[key]["auto"] + outputGui[key]["auto"]
                output[key]["exec"] = output[key]["exec"] + outputGui[key]["exec"]
        for key in outputGui:
            if key not in output:
                output[key] = outputGui[key]

        return JsonResponse({"qaReport": output}, status = 200)

def RESULT_LOGS(Release, sdate, edate):
    user = {}
    for rel in Release:
        if rel["ReleaseNumber"] != "TestDatabase":
            data = LOGS.objects.using(rel["ReleaseNumber"]).all()
            serializer = LOG_SERIALIZER(data, many = True)
            try:
                for log in serializer.data:
                    date_time_str = log["Timestamp"]
                    date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                    if date_time_obj >= sdate and date_time_obj <= edate:
                        logdata = log["LogData"]
                        if "status added" in log["LogData"].lower():
                                if log["UserName"] not in user:
                                    user[log["UserName"]] = {}
                                    user[log["UserName"]]["auto"] = 0
                                    user[log["UserName"]]["exec"] = 1
                                else:
                                    user[log["UserName"]]["exec"] = user[log["UserName"]]["exec"] + 1

                        try:
                            if rel["ReleaseNumber"] == "DCX-DMC-Master":
                                logdata = json.loads(logdata)
                                if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                                    if log["UserName"] not in user:
                                        user[log["UserName"]] = {}
                                        user[log["UserName"]]["auto"] = 1
                                        user[log["UserName"]]["exec"] = 0
                                    else:
                                        user[log["UserName"]]["auto"] = user[log["UserName"]]["auto"] + 1
                        except:
                            pass
            except:
                pass
    return user
def RESULT_LOGS_GUI(Release, sdate, edate):
    user = {}
    for rel in Release:
        if rel["ReleaseNumber"] != "TestDatabase":
            data = LOGSGUI.objects.using(rel["ReleaseNumber"]).all()
            serializer = GUI_LOGS_SERIALIZER(data, many = True)
            try:
                for log in serializer.data:
                    date_time_str = log["Timestamp"]
                    date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                    if date_time_obj >= sdate and date_time_obj <= edate:
                        logdata = log["LogData"]
                        if "status added" in log["LogData"].lower():
                            if log["UserName"] not in user:
                                user[log["UserName"]] = {}
                                user[log["UserName"]]["auto"] = 0
                                user[log["UserName"]]["exec"] = 1
                            else:
                                user[log["UserName"]]["exec"] = user[log["UserName"]]["exec"] + 1
                        try:
                            if rel["ReleaseNumber"] == "DCX-DMC-Master":
                                logdata = json.loads(logdata)
                                if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                                    if log["UserName"] not in user:
                                        user[log["UserName"]] = {}
                                        user[log["UserName"]]["auto"] = 1
                                        user[log["UserName"]]["exec"] = 0
                                    else:
                                        user[log["UserName"]]["auto"] = user[log["UserName"]]["auto"] + 1
                        except:
                            pass
            except:
                pass
    return user

@csrf_exempt
def getSDETReleaseReport(request):
    output = {}
    outputGui = {}
    automated = {}
    if request.method == "GET":
        releases = request.GET.getlist('releases[]')
        output = getCliExecuted(releases)
        outputGui = getGuiExecuted(releases)
        automated = getAutomatedCount()
        assignedCli = getCliAssigned(releases)
        assignedGui = getGuiAssigned(releases)
    return JsonResponse({"SDETRelReport": {"CLIAssigned": assignedCli, "GuiAssigned": assignedGui, "CLIExec": output, "GuiExec": outputGui, "Automated": automated}}, status = 200)

def getCliExecuted(Release):
    data = {}
    for relNum in Release:
        if relNum != "TestDatabase":
            result = LOGS.objects.values('TcID', 'CardType', 'UserName', 'LogData').filter(LogData__contains = 'Status Added').annotate(Count('logNo')).using(relNum)
            data[relNum] = {}
            data = iterResult(result, data, relNum)
    return data

def getGuiExecuted(Release):
    data = {}
    for relNum in Release:
        if relNum != "TestDatabase":
            result = LOGSGUI.objects.values('tcInfoNum', 'UserName', 'LogData').filter(LogData__contains = 'Status Added').annotate(Count('logNo')).using(relNum)
            data[relNum] = {}
            data = iterResult(result, data, relNum)
    return data

def getCliAssigned(Release):
    data = {}
    for relNum in Release:
        if relNum != "TestDatabase":
            result = TC_INFO.objects.values().filter(Q(applicable__contains = "Applicable") & ~Q(Assignee__contains = "UNKNOWN")).using(relNum)
            data[relNum] = {}
            data = iterForAssignee(result, data, relNum)
    return data

def getGuiAssigned(Release):
    data = {}
    for relNum in Release:
        if relNum != "TestDatabase":
            result = TC_INFO_GUI.objects.values().filter(Q(applicable__contains = "Applicable") & ~Q(Assignee__contains = "UNKNOWN")).using(relNum)
            data[relNum] = {}
            data = iterForAssignee(result, data, relNum)
    return data

def iterForAssignee(result, data, relNum):
    for log in result:
        user = log["Assignee"]
        if user not in data[relNum]:
            data[relNum][user] = {}
            data[relNum][user]["assigned"] = 1
            data[relNum][user]["time"] = log["Time"]
        else:
            data[relNum][user]["assigned"] = data[relNum][user]["assigned"] + 1
            data[relNum][user]["time"] = data[relNum][user]["time"] + log["Time"]
    return data

def iterResult(result, data, relNum):
    for log in result:
        user = log["UserName"]
        if user not in data[relNum]:
            data[relNum][user] = 1
        else:
            data[relNum][user] = data[relNum][user] + 1
    return data

def getAutomatedCount():
    user = {}
    data = LOGS.objects.using('DCX-DMC-Master').filter(LogData__contains = '"old":"TC NOT AUTOMATED"').all()
    serializer = LOG_SERIALIZER(data, many = True)
    user = iterSerializerForAuto(serializer, user)
    data = LOGSGUI.objects.using('DCX-DMC-Master').filter(LogData__contains = '"old":"TC NOT AUTOMATED"').all()
    serializer = GUI_LOGS_SERIALIZER(data, many = True)
    user = iterSerializerForAuto(serializer, user)
    return user

def iterSerializerForAuto(serializer, user):
    for log in serializer.data:
        try:
            logdata = json.loads(log['LogData'])
            if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                if log["UserName"] not in user:
                    user[log["UserName"]] = {}
                    user[log["UserName"]]["auto"] = 1
                else:
                    user[log["UserName"]]["auto"] = user[log["UserName"]]["auto"] + 1
        except:
            pass
    return user

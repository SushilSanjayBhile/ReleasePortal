import requests, json
import datetime

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .views import RELEASEINFO
from .serializers import RELEASE_SERIALIZER, LOG_SERIALIZER, GUI_LOGS_SERIALIZER
from .models import RELEASES, LOGS, LOGSGUI
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

import requests, json
import datetime

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .views import RELEASEINFO
from .serializers import RELEASE_SERIALIZER, LOG_SERIALIZER, GUI_LOGS_SERIALIZER
from .models import RELEASES, LOGS, LOGSGUI
@csrf_exempt
def getTcReport1(request):
    if request.method == "GET":
        start_date = datetime.datetime.strptime(request.GET.get("startdate"), '%Y-%m-%d').date()
        end_date = datetime.datetime.strptime(request.GET.get("enddate"), '%Y-%m-%d').date()
        interface = request.GET.get("interface")
        data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
        serializer = RELEASE_SERIALIZER(data, many = True)
        releases = serializer.data
        sixWeek = datetime.timedelta(days=28)    # 4 week * 7 days
        today = datetime.date.today()
        lastMonday = today - datetime.timedelta(days=today.weekday())
        lastWeek = lastMonday - sixWeek       # last monday - six week old monday
        ## iterating loop for all releases to gather weekly data
        #try:
        if interface == "CLI":
            dictionary = {}
            for release in releases:
                release_name = release["ReleaseNumber"]
                if release_name == "TestDatabase":
                    continue
                #print("Collecting data of: ", release_name)
                #print("CLI data : ", release_name)
                weeklyUserReportURL = "http://release:8000/api/result-logs/" + release_name    # log data release wise
                userReport = requests.get(weeklyUserReportURL)
                userReport = userReport.json()
                #print(userReport)
                flag = 0
                for i in userReport["Weekly User Report"]:
                    d = {}
                    #print("i",i)
                    for j in userReport["Weekly User Report"][i]:
                        #print("j",j)
                        for k in userReport["Weekly User Report"][i][j]:
                            #print("k",k)
                            temp = k.split(" ")[0]
                            temp1 = k.split(" ")[2]
                            date_dt2 = datetime.datetime.strptime(temp, '%Y-%m-%d')
                            date_dt1 = datetime.datetime.strptime(temp1, '%Y-%m-%d')
                            date_dt2 = date_dt2.date()
                            date_dt1 = date_dt1.date()
                            #if current log data newer than last 4 week date, add result in dictionary
                            #if date_dt2 > lastWeek:
                            if date_dt2 > start_date and date_dt1 < end_date:
                                if k not in d:
                                    d[k] = 0
                                d[k] += userReport["Weekly User Report"][i][j][k]
                    #print("d",d)
                dictionary[release_name] = d
            return HttpResponse(json.dumps(dictionary))
        elif interface == "GUI":
            guiData = {}
            for release in releases:
                release_name = release["ReleaseNumber"]
                if release_name == "TestDatabase":
                    continue
                print("Collecting data of: ", release_name)
                print("gui data : ", release_name)
                weeklyUserReportURL = "http://release:8000/api/result-logs-gui/" + release_name    # log data release wise
                userReport = requests.get(weeklyUserReportURL)
                userReport = userReport.json()
                flag = 0
                for i in userReport["Weekly User Report"]:
                    d = {}
                    for j in userReport["Weekly User Report"][i]:
                        for k in userReport["Weekly User Report"][i][j]:
                            temp = k.split(" ")[0]
                            temp1 = k.split(" ")[2]
                            date_dt2 = datetime.datetime.strptime(temp, '%Y-%m-%d')
                            date_dt1 = datetime.datetime.strptime(temp1, '%Y-%m-%d')
                            date_dt2 = date_dt2.date()
                            date_dt1 = date_dt1.date()
                            #if current log data newer than last 4 week date, add result in dictionary
                            if date_dt2 > start_date and date_dt1 < end_date:
                                if k not in d:
                                    d[k] = 0
                                d[k] += userReport["Weekly User Report"][i][j][k]
                guiData[release_name] = d
            return HttpResponse(json.dumps(guiData))
        #except:
            #return HttpResponse(status=500)
@csrf_exempt
def getTcReport(request):
    if request.method == "GET":
        start_date = datetime.datetime.strptime(request.GET.get("startdate"), '%Y-%m-%d').date()
        end_date = datetime.datetime.strptime(request.GET.get("enddate"), '%Y-%m-%d').date()
        interface = request.GET.get("interface")
        data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
        serializer = RELEASE_SERIALIZER(data, many = True)
        releases = serializer.data
        #for cli data
        if interface == "CLI":
            dictionary = {}
            for release in releases:
                release_name = release["ReleaseNumber"]
                if release_name == "TestDatabase":
                    continue
                else :
                    dictionary[release_name] = RESULT_LOGS(release_name, start_date, end_date)
            return HttpResponse(json.dumps(dictionary))
        #for gui data
        elif interface == "GUI":
            guiData = {}
            for release in releases:
                release_name = release["ReleaseNumber"]
                if release_name == "TestDatabase":
                    continue
                else:
                    guiData[release_name] = RESULT_LOGS_GUI(release_name, start_date, end_date)
            return HttpResponse(json.dumps(guiData))

def RESULT_LOGS(Release, sdate, edate):
    data = LOGS.objects.using(Release).all()
    serializer = LOG_SERIALIZER(data, many = True)
    count = 0
    for log in serializer.data:
        if "status" in log["LogData"].lower():
            user = log["UserName"]
            if user == "":
                continue
            date_time_str = log["Timestamp"]
            date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
            
            if date_time_obj >= sdate and date_time_obj < edate:
                count += 1
    return count

def RESULT_LOGS_GUI(Release, sdate, edate):
    data = LOGSGUI.objects.using(Release).all()
    serializer = GUI_LOGS_SERIALIZER(data, many = True)
    count = 0
    for log in serializer.data:
        if "status" in log["LogData"].lower():
            user = log["UserName"]
            if user == "":
                continue
            date_time_str = log["Timestamp"]
            date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
            
            if date_time_obj >= sdate and date_time_obj < edate:
                count += 1
    return count

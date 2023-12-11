import requests, json
import datetime
import csv

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .views import RELEASEINFO
from .serializers import RELEASE_SERIALIZER, LOG_SERIALIZER, GUI_LOGS_SERIALIZER, TC_INFO_GUI_SERIALIZER, TC_INFO_SERIALIZER
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
                output[key]["aexec"] = output[key]["aexec"] + outputGui[key]["aexec"]

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
                        if "status added" in log["LogData"].lower() and "result: blocked" not in log["LogData"].lower() and "result: unblocked" not in log["LogData"].lower():
                                manual = True
                                infoData = TC_INFO.objects.using(rel["ReleaseNumber"]).filter(TcID = log["TcID"]).get(CardType = log["CardType"])
                                infoSerializer = TC_INFO_SERIALIZER(infoData)
                                tcdata = infoSerializer.data

                                if tcdata["TcName"] != "TC NOT AUTOMATED":
                                    manual = False
                                else:
                                    manual = True
                                if log["UserName"] not in user:
                                    user[log["UserName"]] = {"execIn":rel["ReleaseNumber"]}
                                    user[log["UserName"]]["auto"] = 0
                                    user[log["UserName"]]["exec"] = 0
                                    user[log["UserName"]]["aexec"] = 0
                                    user[log["UserName"]]["tc"] = []

                                    infoData = TC_INFO.objects.using(rel["ReleaseNumber"]).filter(TcID = log["TcID"]).get(CardType = log["CardType"])
                                    infoSerializer = TC_INFO_SERIALIZER(infoData)
                                    tcdata = infoSerializer.data

                                    if manual == False:
                                        user[log["UserName"]]["aexec"] = 1
                                    else:
                                        user[log["UserName"]]["exec"] = 1
                                else:
                                    if manual == False:
                                        user[log["UserName"]]["aexec"] = user[log["UserName"]]["aexec"] + 1
                                    else:
                                        user[log["UserName"]]["exec"] = user[log["UserName"]]["exec"] + 1
                                    if rel["ReleaseNumber"] not in user[log["UserName"]]["execIn"]:
                                        user[log["UserName"]]["execIn"] = user[log["UserName"]]["execIn"] + "," + rel["ReleaseNumber"]

                        try:
                            if rel["ReleaseNumber"] == "DCX-DMC-Master":
                                logdata = json.loads(logdata)
                                if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                                    if log["UserName"] not in user:
                                        user[log["UserName"]] = {"execIn": ""}
                                        user[log["UserName"]]["auto"] = 1
                                        user[log["UserName"]]["exec"] = 0
                                        user[log["UserName"]]["aexec"] = 0
                                        user[log["UserName"]]["tc"] = [log["TcID"]]
                                    else:
                                        if log["TcID"] not in user[log["UserName"]]["tc"]:
                                            user[log["UserName"]]["auto"] = user[log["UserName"]]["auto"] + 1
                                            user[log["UserName"]]["tc"].append(log["TcID"])

                        except:
                            pass
            except:
                pass
    return user
def RESULT_LOGS_GUI(Release, sdate, edate):
    user = {}
    manual = True
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
                        if "status added" in log["LogData"].lower() and "result: blocked" not in log["LogData"].lower() and "result: unblocked" not in log["LogData"].lower():
                            manual = True
                            tcid = TC_INFO_GUI.objects.using(rel["ReleaseNumber"]).get(id = log["tcInfoNum"])
                            ser = TC_INFO_GUI_SERIALIZER(tcid)
                            tcid = ser.data["TcID"]

                            if ser.data["TcName"] == "TC NOT AUTOMATED":
                                manual = True
                            else:
                                manual = False
                            if log["UserName"] not in user:
                                user[log["UserName"]] = {"execIn":rel["ReleaseNumber"]}
                                user[log["UserName"]]["auto"] = 0
                                user[log["UserName"]]["exec"] = 0
                                user[log["UserName"]]["aexec"] = 0
                                user[log["UserName"]]["tc"] = []

                                if manual == False:
                                    user[log["UserName"]]["aexec"] = 1
                                else:
                                    user[log["UserName"]]["exec"] = 1 
                            else:
                                if manual == True:
                                    user[log["UserName"]]["exec"] = user[log["UserName"]]["exec"] + 1
                                else:
                                    user[log["UserName"]]["aexec"] = user[log["UserName"]]["aexec"] + 1
                                if rel["ReleaseNumber"] not in user[log["UserName"]]["execIn"]:
                                    user[log["UserName"]]["execIn"] = user[log["UserName"]]["execIn"] + "," + rel["ReleaseNumber"]
                        try:
                            if rel["ReleaseNumber"] == "DCX-DMC-Master":
                                logdata = json.loads(logdata)
                                if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                                    tcid = TC_INFO_GUI.objects.using(rel["ReleaseNumber"]).get(id = log["tcInfoNum"])
                                    ser = TC_INFO_GUI_SERIALIZER(tcid)
                                    tcid = ser.data["TcID"]
                                    if log["UserName"] not in user:
                                        user[log["UserName"]] = {"execIn": ""}
                                        user[log["UserName"]]["auto"] = 1
                                        user[log["UserName"]]["exec"] = 0
                                        user[log["UserName"]]["aexec"] = 0
                                        user[log["UserName"]]["tc"] = [tcid]
                                    else:
                                        if tcid not in user[log["UserName"]]["tc"]:
                                            user[log["UserName"]]["auto"] = user[log["UserName"]]["auto"] + 1
                                            user[log["UserName"]]["tc"].append(tcid)

                        except:
                            pass
            except:
                pass
    return user

@csrf_exempt
def getTcExecutionCount(request):
    if request.method == "GET":
        sdate = datetime.datetime.strptime(request.GET.get("startdate"), '%Y-%m-%d').date()
        edate = datetime.datetime.strptime(request.GET.get("enddate"), '%Y-%m-%d').date()
        data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
        serializer = RELEASE_SERIALIZER(data, many = True)
        Release = serializer.data
    cliTcs = {}
    guiTcs = {}
    for rel in Release:
        if rel["ReleaseNumber"] != "TestDatabase" and rel["ReleaseNumber"] != "DCX-DMC-Master":
            data = LOGS.objects.using(rel["ReleaseNumber"]).all()
            serializer = LOG_SERIALIZER(data, many = True)
            #try:
            cliTcs[rel["ReleaseNumber"]] = {}
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    #logdata = log["LogData"]
                    if "status added" in log["LogData"].lower() and "result: blocked" not in log["LogData"].lower() and "result: unblocked" not in log["LogData"].lower():
                            if log["CardType"] not in cliTcs[rel["ReleaseNumber"]]:
                                cliTcs[rel["ReleaseNumber"]][log["CardType"]] = {log["TcID"]:1}
                            else:
                                if log["TcID"] not in cliTcs[rel["ReleaseNumber"]][log["CardType"]]:
                                    cliTcs[rel["ReleaseNumber"]][log["CardType"]][log["TcID"]] = 1
                                else:
                                    cliTcs[rel["ReleaseNumber"]][log["CardType"]][log["TcID"]] = cliTcs[rel["ReleaseNumber"]][log["CardType"]][log["TcID"]] + 1
        #except:
            #    pass
            data = LOGSGUI.objects.using(rel["ReleaseNumber"]).all()
            serializer = GUI_LOGS_SERIALIZER(data, many = True)
            #try:
            guiTcs[rel["ReleaseNumber"]] = {}
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    try:
                        tcid = TC_INFO_GUI.objects.using(rel["ReleaseNumber"]).get(id = log["tcInfoNum"])
                        ser = TC_INFO_GUI_SERIALIZER(tcid)
                        tcid = ser.data["TcID"]
                        if "status added" in log["LogData"].lower() and "result: blocked" not in log["LogData"].lower():
                                cardType = log["LogData"].split("CardType:")[1]
                                if cardType not in guiTcs[rel["ReleaseNumber"]]:
                                    guiTcs[rel["ReleaseNumber"]][cardType] = {tcid:1}
                                else:
                                    if tcid not in guiTcs[rel["ReleaseNumber"]][cardType]:
                                        guiTcs[rel["ReleaseNumber"]][cardType][tcid] = 1
                                    else:
                                        guiTcs[rel["ReleaseNumber"]][cardType][tcid] = guiTcs[rel["ReleaseNumber"]][cardType][tcid] + 1
                    except:
                        pass
            #    pass

    cliauto, guiauto = getTcAutomationCount(sdate,edate)
    #print("sdate",sdate)
    added = getTcAddedCount(sdate,edate)
    print("added",added)
    response = HttpResponse(
        content_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="TCexecution.csv"'},
    )
    writer = csv.writer(response)
    #print("user", user)
    #with open('TCexecution.csv', mode='w') as csv_file:
    #    fieldnames = ['Release', 'Platform', 'TcID', 'Count']
    #    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    #    writer.writeheader()
    writer.writerow(['Release', 'Platform', 'TcID', 'Count'])
    for rel in cliTcs:
        for platform in cliTcs[rel]:
            for tcid in cliTcs[rel][platform]:
                #if rel == "UE-3.6.2":
                    #print(tcid, user[rel][platform][tcid])
                #writer.writerow(['Release': rel, 'Platform': platform, 'TcID': tcid, 'Count': user[rel][platform][tcid]])
                writer.writerow([rel, platform, tcid, cliTcs[rel][platform][tcid]])

    writer.writerow(['---------GUI TC EXECUTION DATA-------------'])

    for rel in guiTcs:
        for platform in guiTcs[rel]:
            for tcid in guiTcs[rel][platform]:
                #if rel == "UE-3.6.2":
                    #print(tcid, user[rel][platform][tcid])
                #writer.writerow(['Release': rel, 'Platform': platform, 'TcID': tcid, 'Count': user[rel][platform][tcid]])
                writer.writerow([rel, platform, tcid, guiTcs[rel][platform][tcid]])
    writer.writerow(['---------CLI AUTOMATION DATA-------------'])

    for user in cliauto:
        writer.writerow([user, cliauto[user]["auto"]])

    writer.writerow(['---------GUI AUTOMATION DATA-------------'])

    for user in guiauto:
        writer.writerow([user, guiauto[user]["auto"]])

    writer.writerow(['---------Newly Added Test Cases-------------'])


    for user in added:
        for name in added[user]:
            writer.writerow([user, name, added[user][name]["cliAdded"], added[user][name]["guiAdded"]])



    return response

def getTcAutomationCount(sdate, edate):
    data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
    serializer = RELEASE_SERIALIZER(data, many = True)
    Release = serializer.data
    cliauto = {}
    guiauto = {}
    for rel in Release:
        if rel["ReleaseNumber"] == "DCX-DMC-Master":
            data = LOGS.objects.using(rel["ReleaseNumber"]).all()
            serializer = LOG_SERIALIZER(data, many = True)
            #try:
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    logdata = log["LogData"]
                    try:
                        logdata = json.loads(logdata)
                        if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                            if log["UserName"] not in cliauto:
                                cliauto[log["UserName"]] = {"auto":1}
                                cliauto[log["UserName"]]["tc"] = [log["TcID"]]
                            else:
                                #cliauto[log["UserName"]]["auto"] = cliauto[log["UserName"]]["auto"] + 1
                                if log["TcID"] not in cliauto[log["UserName"]]["tc"]:
                                    cliauto[log["UserName"]]["auto"] = cliauto[log["UserName"]]["auto"] + 1
                                    cliauto[log["UserName"]]["tc"].append(log["TcID"])
                    except:
                        pass
            data = LOGSGUI.objects.using(rel["ReleaseNumber"]).all()
            serializer = GUI_LOGS_SERIALIZER(data, many = True)
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    logdata = log["LogData"]
                    try:
                        logdata = json.loads(logdata)
                        tcid = TC_INFO_GUI.objects.using(rel["ReleaseNumber"]).get(id = log["tcInfoNum"])
                        ser = TC_INFO_GUI_SERIALIZER(tcid)
                        tcid = ser.data["TcID"]
                        if logdata["TcName"]["old"] == "TC NOT AUTOMATED" and logdata["TcName"]["new"] != "TC NOT AUTOMATED" :
                            if log["UserName"] not in guiauto:
                                guiauto[log["UserName"]] = {"auto":1}
                                guiauto[log["UserName"]]["tc"] = [tcid]
                            else:
                                if tcid not in guiauto[log["UserName"]]["tc"]:
                                    guiauto[log["UserName"]]["auto"] = guiauto[log["UserName"]]["auto"] + 1
                                    guiauto[log["UserName"]]["tc"].append(tcid)
                                #guiauto[log["UserName"]]["auto"] = cliauto[log["UserName"]]["auto"] + 1
                    except:
                        pass

    return cliauto, guiauto

def getTcAddedCount(sdate, edate):
    data = RELEASES.objects.using("universal").all().order_by("-CreationDate")
    serializer = RELEASE_SERIALIZER(data, many = True)
    Release = serializer.data
    #sdate = datetime.datetime.strptime(sdate, '%Y-%m-%dT%H:%M:%S.%fZ').date()
    #edate = datetime.datetime.strptime(edate, '%Y-%m-%dT%H:%M:%S.%fZ').date()
    added = {}
    for rel in Release:
        if rel["ReleaseNumber"] != "TestDatabase" and rel["ReleaseNumber"] != "DCX-DMC-Master" and rel["ReleaseNumber"] != "master":
            data = LOGS.objects.using(rel["ReleaseNumber"]).all()
            serializer = LOG_SERIALIZER(data, many = True)
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    if "created tc" in log["LogData"].lower():
                        if rel["ReleaseNumber"] not in added:
                            added[rel["ReleaseNumber"]] = {}
                            if log["UserName"] not in added[rel["ReleaseNumber"]]:
                                added[rel["ReleaseNumber"]][log["UserName"]] = {"cliAdded" : 1, "guiAdded": 0}
                            else:
                                added[rel["ReleaseNumber"]][log["UserName"]]["cliAdded"] = 1 

                        else:
                            if log["UserName"] not in added[rel["ReleaseNumber"]]:
                                added[rel["ReleaseNumber"]][log["UserName"]] = {"cliAdded" : 1, "guiAdded": 0}
                            else:
                                added[rel["ReleaseNumber"]][log["UserName"]]["cliAdded"] = added[rel["ReleaseNumber"]][log["UserName"]]["cliAdded"] + 1

            data = LOGSGUI.objects.using(rel["ReleaseNumber"]).all()
            serializer = GUI_LOGS_SERIALIZER(data, many = True)
            for log in serializer.data:
                date_time_str = log["Timestamp"]
                date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if date_time_obj >= sdate and date_time_obj <= edate:
                    if "created tc" in log["LogData"].lower():
                        if rel["ReleaseNumber"] not in added:
                            added[rel["ReleaseNumber"]] = {}
                            if log["UserName"] not in added[rel["ReleaseNumber"]]:
                                added[rel["ReleaseNumber"]][log["UserName"]] = {"cliAdded" : 0, "guiAdded": 1}
                            else:
                                added[rel["ReleaseNumber"]][log["UserName"]]["guiAdded"] = 1

                        else:
                            if log["UserName"] not in added[rel["ReleaseNumber"]]:
                                added[rel["ReleaseNumber"]][log["UserName"]] = {"cliAdded" : 0, "guiAdded": 1}
                            else:
                                added[rel["ReleaseNumber"]][log["UserName"]]["guiAdded"] = added[rel["ReleaseNumber"]][log["UserName"]]["cliAdded"] + 1


                        #if rel["ReleaseNumber"] not in added:
                        #    added[rel["ReleaseNumber"]] = {"cliAdded" : 0, "guiAdded": 1}
                        #else:
                        #    added[rel["ReleaseNumber"]]["guiAdded"] = added[rel["ReleaseNumber"]]["guiAdded"] + 1

    

    return added



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

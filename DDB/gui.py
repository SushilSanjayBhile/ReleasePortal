from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json, time

from .serializers import TC_INFO_GUI_SERIALIZER, LOG_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, GUI_LOGS_SERIALIZER
from .models import TC_INFO_GUI, LOGS, GUI_LATEST_TC_STATUS, LOGSGUI, GUI_TC_STATUS
from django.db.models import Q

from .forms import GuiInfoForm, LogForm, GuiStatusForm, GuiLatestStatusForm, GuiLogsForm
import datetime

def GenerateGUILogData(userName, requestType, url, logData, tcInfoNum, Release):
    Timestamp = datetime.datetime.now()
    data = {'UserName': userName, 'RequestType': requestType, 'LogData': logData, 'Timestamp': Timestamp, 'URL': url, 'tcInfoNum': tcInfoNum}
    fd = GuiLogsForm(data)
    if fd.is_valid():
        print("valid")
        data = fd.save(commit = False)
        data.save(using = Release)
    else:
        print("INVALID", fd.errors)

def updateGuiTcInfo(data, updatedData, Release):
    data.TcID = updatedData["TcID"] 
    data.Domain = updatedData["Domain"]
    data.SubDomain = updatedData["SubDomain"]
    data.Scenario = updatedData["Scenario"]
    data.Description = updatedData["Description"]
    data.Steps = updatedData["Steps"]
    data.ExpectedBehaviour = updatedData["ExpectedBehaviour"]
    data.Notes = updatedData["Notes"]
    data.CardType = updatedData["CardType"]
    data.ServerType = updatedData["ServerType"]
    data.WorkingStatus = updatedData["WorkingStatus"]
    data.Date = updatedData["Date"]
    data.Assignee = updatedData["Assignee"]
    data.Creator = updatedData["Creator"]
    data.Tag = updatedData["Tag"]
    data.Priority = updatedData["Priority"]
    data.AutomatedTcName = updatedData["AutomatedTcName"]
    data.BrowserName = updatedData["BrowserName"]

    print(Release, data.Priority)
    data.save(using = Release)


@csrf_exempt
def GUI_TC_INFO_GET_POST_VIEW(request, Release):
    master = "master"
    dmcMaster = "DMC Master"

    if "dmc" in Release.lower():
        master = dmcMaster

    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        conflictFlag = False

        # post request for current release
        data = TC_INFO_GUI.objects.using(Release).filter(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
        if len(data) != 0:
            conflictFlag = True
            return HttpResponse("Tcid: " + req['TcID'] + " with (browser: " + req["BrowserName"] + " + card: " + req["CardType"] + ") already exists")
        else:
            fd = GuiInfoForm(req)

            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)

                d = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
                dSer = TC_INFO_GUI_SERIALIZER(d)

                if "Activity" in req:
                    AD = req['Activity']
                    GenerateGUILogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], dSer.data["id"], AD['Release'])
            else:
                print(fd.errors)

        # post request for master release
        if Release != master and Release != "TestDatabase":
            Release = master
            conflictFlag = False

            # post request for current release
            data = TC_INFO_GUI.objects.using(Release).filter(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            if len(data) != 0:
                conflictFlag = True
            else:
                fd = GuiInfoForm(req)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = Release)
                    
                    if "Activity" in req:
                        AD = req['Activity']
                        #GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
                else:
                    print(fd.errors)
            
        return HttpResponse("SUCCESSFULLY UPDATED")

    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))

        # post request for current release
        for req in requests:
            data = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            dataSer = TC_INFO_GUI_SERIALIZER(data)

            updatedData = dataSer.data

            for row in req:
                if "CardType" not in row or "TcID" not in row or "BrowserName" not in row and req[row] != "undefined":
                    updatedData[row] = req[row]

            updateGuiTcInfo(data, updatedData, Release)
            AD = req["Activity"]
            GenerateGUILogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], dataSer.data['id'], AD['Release'])
        return HttpResponse("SUCCESSFULLY UPDATED")

# Function to update TC STATUS data
def updateGuiLatestStatusData(updatedData, data, Release):
    data.tcInfoNum = updatedData["tcInfoNum"]
    data.Build = updatedData["Build"]
    data.Result = updatedData["Result"]

    if "Bugs" in updatedData:
        data.Bugs = updatedData["Bugs"]

    if "Date" in updatedData:
        data.Date = updatedData["Date"]

    data.save(using = Release)
    return 1

@csrf_exempt
def GET_TC_INFO_GUI_ID(request, Release, id, browserName):
    if request.method == "GET":
        try:
            infoData = TC_INFO_GUI.objects.using(Release).filter(TcID = id).get(BrowserName = browserName)
        except:
            return JsonResponse({'Not Found': "Record Not Found"}, status = 404)

        infoSerializer = TC_INFO_GUI_SERIALIZER(infoData)
        tcdata = infoSerializer.data
        tcinfonum = tcdata["id"]

        activityData = LOGSGUI.objects.using(Release).filter(tcInfoNum = tcinfonum)
        activitySerializer = GUI_LOGS_SERIALIZER(activityData, many = True)

        try:
            statusData = GUI_TC_STATUS.objects.using(Release).filter(tcInfoNum = tcinfonum).order_by('Date')
            statusSerializer = LATEST_TC_STATUS_GUI_SERIALIZER(statusData, many = True)
    
            tcdata['Activity'] = activitySerializer.data
            tcdata['StatusList'] = []
            for status in statusSerializer.data:
                tcdata['StatusList'].append(status)
        except:
            pass
        return HttpResponse(json.dumps(tcdata))

@csrf_exempt
def GUI_TC_STATUS_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        request = json.loads(request.body.decode("utf-8"))

        # post request for current release
        for req in request:
            data = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            ser = TC_INFO_GUI_SERIALIZER(data)

            status = {}

            status["Result"] = req["Result"]
            status["Build"] = req["Build"]
            if "Bugs" in req:
                status["Bugs"] = req["Bugs"]
            status["tcInfoNum"] = ser.data["id"]

            fd = GuiStatusForm(status)


            if fd.is_valid():
                data = fd.save(commit = False)
                data.save(using = Release)
                
                if "Activity" in req:
                    AD = req['Activity']
                    GenerateGUILogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['tcInfoNum'], AD['Release'])
            else:
                print(fd.errors)

            try:
                latestData = GUI_LATEST_TC_STATUS.objects.using(Release).get(tcInfoNum = ser.data["id"])
                updateGuiLatestStatusData(status, latestData, Release)
            except:
                latestfd = GuiLatestStatusForm(status)

                if latestfd.is_valid():
                    data = latestfd.save(commit = False)
                    data.save(using = Release)
                else:
                    print(fd.errors)


        return HttpResponse("SUCCESSFULLY UPDATED")

@csrf_exempt
def WHOLE_GUI_TC_INFO(request, Release):
    if request.method == "GET":
        startTime = time.time()
        AllInfoData = []
        statusDict = {}

        index = int(request.GET.get('index', 0))
        Domain = str(request.GET.get('Domain', None))
        SubDomain = str(request.GET.get('SubDomain', None))
        Priority = str(request.GET.get('Priority', None))

        infodata = TC_INFO_GUI.objects.using(Release).all()

        if Domain != 'None':
            infodata = infodata.filter(Domain = Domain)
        if SubDomain != 'None':
            infodata = infodata.filter(SubDomain = SubDomain)
        if Priority != 'None':
            infodata = infodata.filter(Priority = Priority)

        count = int(request.GET.get('count', len(infodata)))

        infoserializer = TC_INFO_GUI_SERIALIZER(infodata, many = True)
        infoDict = {}
        for row in infoserializer.data:
            infoDict[row["id"]] = row

        statusdata = GUI_TC_STATUS.objects.using(Release).all().order_by('Date')
        lateststatusdata = GUI_LATEST_TC_STATUS.objects.using(Release).all().order_by('Date')

        latestSer = LATEST_TC_STATUS_GUI_SERIALIZER(lateststatusdata, many = True)

        for status in latestSer.data:
            try:
                status.update(infoDict[status["tcInfoNum"]])
            except:
                pass

        for rec in latestSer.data:
            try:
                tcid = rec['TcID']
                card = rec['CardType'].strip('][').strip('\'')
            except:
                continue

            if card not in statusDict:
                statusDict[card]= {}
            if tcid in statusDict[card]:
                statusDict[card][tcid].append(rec)
            else:
                statusDict[card][tcid] = []
                statusDict[card][tcid].append(rec)

        for info in infoserializer.data:
            info = json.loads(json.dumps(info))
            info["TcName"] =  info["AutomatedTcName"]

            try:
                card = info['CardType'].strip('][').strip('\'')
                tcid = info['TcID']
                info['StatusList'] = json.loads(json.dumps(statusDict[card][tcid]))
                if statusDict[card][tcid][-1]["Result"] == "Unblocked":
                    info["CurrentStatus"] = {}
                else:
                    info['CurrentStatus'] = json.loads(json.dumps(statusDict[card][tcid][-1]))
            except:
                info["StatusList"] = {}
                info["CurrentStatus"] = {}

            AllInfoData.append(info)

        if count > len(AllInfoData):
            count = len(AllInfoData)

        requiredData = AllInfoData[index:count]
        return HttpResponse(json.dumps(requiredData))

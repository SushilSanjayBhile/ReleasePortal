from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json, time

from .serializers import TC_INFO_GUI_SERIALIZER, LOG_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, GUI_LOGS_SERIALIZER, \
        APPLICABILITY_SERIALIZER
from .models import TC_INFO_GUI, LOGS, GUI_LATEST_TC_STATUS, LOGSGUI, GUI_TC_STATUS, APPLICABILITY
from django.db.models import Q

from .forms import GuiInfoForm, LogForm, GuiStatusForm, GuiLatestStatusForm, GuiLogsForm
import datetime
from .new import rootRelease, update_automation_count

@csrf_exempt
def MULTIPLE_TC_INFO_GUI_UPDATION(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRec = {}
        print("printing reques",requests)
        for req in requests:
            card = req['CardType']
            tcid = req['TcID']
            
            # update Data Master
            try:
                if Release != "TestDatabase":
                    if "dmc" in Release.lower():
                        master = "DMC Master"
                    else:
                        master = "master"
                dataMaster = TC_INFO_GUI.objects.using(master).filter(TcID = tcid).get(CardType = card)
                serializerMaster = TC_INFO_GUI_SERIALIZER(dataMaster)
                updatedDataMaster = serializerMaster.data
                print("updatedDataMaster",updatedDataMaster)
                for key in req:
                    if key in updatedDataMaster and (key != "CardType" and key != "TcID" and key != "Priority" and key != "applicable"):
                        updatedDataMaster[key] = req[key]
                updateData(updatedDataMaster, dataMaster, master)

                if "Activity" in requests:
                    AD = requests['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], master)
            
            except:
                pass
            # update data in rootMa
            try:
                if Release != "TestDatabase":
                    master = rootRelease
                dataMaster = TC_INFO_GUI.objects.using(master).filter(TcID = tcid).get(CardType = card)
                serializerMaster = TC_INFO_GUI_SERIALIZER(dataMaster)
                updatedDataMaster = serializerMaster.data
                print("updatedDataMaster",updatedDataMaster)
                for key in req:
                    if key in updatedDataMaster and (key != "CardType" and key != "TcID" and key != "Priority" and key != "applicable"):
                        updatedDataMaster[key] = req[key]
                
                updateData(updatedDataMaster, dataMaster, master)
                
                if "Activity" in requests:
                    AD = requests['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], master)
            
            except:
                pass
            
            try:
                data = TC_INFO_GUI.objects.using(Release).filter(TcID = tcid).get(CardType = card)
                serializer = TC_INFO_SERIALIZER(data)
                updatedData = serializer.data
                print("updatedData",updatedData)
                for key in req:
                    if key in updatedData and (key != "CardType" and key != "TcID"):
                        updatedData[key] = req[key]
                updateData(updatedData, data, Release)
            
                if "Activity" in requests:
                    AD = requests['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            
            except:
                if card not in errRec:
                    errRec[card] = []
                errRec[card].append(tcid)
        if len(errRec) > 0:
            return HttpResponse(json.dumps(errRec), status = 400)
        return HttpResponse("Successfully Updated All Records", status = 200)

def updateData(updatedData, data, Release):
    if data.TcName == "TC NOT AUTOMATED" and data.TcName != updatedData["TcName"] and Release == rootRelease:
        update_automation_count("increaseAutomated", "GUI")
    if data.TcName != "TC NOT AUTOMATED" and updatedData["TcName"] == "TC NOT AUTOMATED" and Release == rootRelease:
        print("2",updatedData['AutomationDate'])
        update_automation_count("decreaseAutomated", "GUI")
    if data.TcName != updatedData["TcName"] and data.TcName == "TC NOT AUTOMATED":
        updatedData['AutomationDate'] = datetime.datetime.now()
        
    data.TcID = updatedData['TcID']
    data.id = updatedData['id']
    data.TcName = updatedData['TcName']
    data.BrowserName = updatedData["BrowserName"]
    data.Domain = updatedData['Domain']
    data.SubDomain = updatedData['SubDomain']
    data.Scenario = updatedData['Scenario']
    data.Description = updatedData['Description']
    data.Steps = updatedData['Steps']
    data.ExpectedBehaviour = updatedData['ExpectedBehaviour']
    data.Notes = updatedData['Notes']
    data.CardType = updatedData['CardType']
    data.ServerType = updatedData['ServerType']
    data.WorkingStatus = updatedData['WorkingStatus']
    data.Date = updatedData['Date']
    data.Assignee = updatedData['Assignee']
    data.Creator = updatedData['Creator']
    data.Priority = updatedData['Priority']
    data.Tag = updatedData['Tag']
    data.stateUserMapping = updatedData['stateUserMapping']
    data.applicable = updatedData['applicable']
    data.OS = updatedData['OS']
    data.UnapproveTCReason = updatedData['UnapproveTCReason']
    data.Platform = updatedData['Platform']
    data.AutomationDate = updatedData['AutomationDate']
    print("data changing",data.AutomationDate)
    data.save(using = Release)
    print("Pirnting data",updatedData)
    return 1

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
    if data.TcName == "TC NOT AUTOMATED" and data.TcName != updatedData["TcName"] and Release == rootRelease:
        updatedData['AutomationDate'] = datetime.datetime.now()
        update_automation_count("increaseAutomated", "GUI")
    if data.TcName != "TC NOT AUTOMATED" and updatedData["TcName"] == "TC NOT AUTOMATED" and Release == rootRelease:
        update_automation_count("decreaseAutomated", "GUI")

    if data.TcName != updatedData["TcName"] and data.TcName == "TC NOT AUTOMATED": 
        updatedData['AutomationDate'] = datetime.datetime.now()

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
    data.TcName = updatedData["TcName"]
    data.BrowserName = updatedData["BrowserName"]
    data.stateUserMapping = updatedData['stateUserMapping']
    data.applicable = updatedData['applicable']
    data.OS = updatedData['OS']
    data.UnapproveTCReason = updatedData['UnapproveTCReason']
    data.Platform = updatedData['Platform']
    data.AutomationDate = updatedData['AutomationDate']
    print(updatedData['Platform'])
    print("printingUPdatedData",updatedData)
    data.save(using = Release)


@csrf_exempt
def GUI_TC_INFO_GET_POST_VIEW(request, Release):
    master = "master"
    dmcMaster = "DMC Master"

    if "dmc" in Release.lower():
        master = dmcMaster

    if request.method == "POST":
        flag = 0
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
                if "master" not in Release:
                    flag = 1
                    data.save(using = Release)

                d = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
                dSer = TC_INFO_GUI_SERIALIZER(d)

                if "Activity" in req:
                    AD = req['Activity']
                    GenerateGUILogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], dSer.data["id"], AD['Release'])
            else:
                print(fd.errors)

        # post request for master release
        if "dmc" in Release.lower():
            master = dmcMaster
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
                    flag = 1
                    data.save(using = Release)

                    if "Activity" in req:
                        AD = req['Activity']
                        #GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
                else:
                    print(fd.errors)


        #post data in dmc-dmc-master release
        master = rootRelease
        if Release != master and Release != "TestDatabase":
            Release = master
            conflictFlag = False

            data = TC_INFO_GUI.objects.using(Release).filter(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            if len(data) != 0:
                conflictFlag = True
            else:
                fd = GuiInfoForm(req)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = Release)
                    flag = 1
                    
                    if "Activity" in req:
                        AD = req['Activity']
                        #GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
                else:
                    print(fd.errors)

        if flag == 1:
            update_automation_count("increaseTotal", "GUI")
            if req["TcName"] != "TC NOT AUTOMATED":
                update_automation_count("increaseAutomated", "GUI")
            
        return HttpResponse("SUCCESSFULLY UPDATED")

    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))

        # put request for current release
        
        #print("Printing REquest",requests,"\n\n")
        for req in requests:
            print("request",req,"\n\n\n\n\n\n")
            data = TC_INFO_GUI.objects.using(Release).filter(TcID = req['TcID'], CardType = req["CardType"])
            dataSer = TC_INFO_GUI_SERIALIZER(data, many = True)
            print("serializer data",dataSer.data) 
            for data in dataSer.data:
                print("data current",data["TcID"],"\n\n")
                updatedData = data
                oldworkingStatus = updatedData["stateUserMapping"]
                oldworkingStatus = oldworkingStatus.replace("\'","\"")
                try:
                    oldworkingStatus = json.loads(oldworkingStatus)
                except:
                    workingStatusReplace = "{\"CREATED\":\"DEFAULT\"}"
                    updatedData["stateUserMapping"] = workingStatusReplace
                    updateGuiTcInfo(updatedData, data, Release)

                    data = TC_INFO_GUI.objects.using(Release).filter(TcID = tcid).get(CardType = card)
                    serializer = TC_INFO_GUI_SERIALIZER(data)
                    updatedData = serializer.data
                    oldworkingStatus = updatedData["stateUserMapping"]
                    oldworkingStatus = oldworkingStatus.replace("\'","\"")
                    oldworkingStatus = json.loads(oldworkingStatus)

                workingState = "{"

                if "Manual WorkingStatus" in req:
                    workingState += "\"Manual WorkingStatus\"" + ":\"" + req["Manual WorkingStatus"] + "\","
                elif "Manual WorkingStatus" in oldworkingStatus:
                    workingState += "\"Manual WorkingStatus\"" + ":\"" + oldworkingStatus["Manual WorkingStatus"] + "\","

                if "Automation Assignee" in req:
                    workingState += "\"Automation Assignee\"" + ":\"" + req["Automation Assignee"] + "\","
                elif "Automation Assignee" in oldworkingStatus:
                    workingState += "\"Automation Assignee\"" + ":\"" + oldworkingStatus["Automation Assignee"] + "\","

                if "Automation WorkingStatus" in req:
                    workingState += "\"Automation WorkingStatus\"" + ":\"" + req["Automation WorkingStatus"] + "\","
                elif "Automation WorkingStatus" in oldworkingStatus:
                    workingState += "\"Automation WorkingStatus\"" + ":\"" + oldworkingStatus["Automation WorkingStatus"] + "\","

                if "Manual Assignee" in req:
                    workingState += "\"Manual Assignee\"" + ":\"" + req["Manual Assignee"] + "\""
                elif "Manual Assignee" in oldworkingStatus:
                    workingState += "\"Manual Assignee\"" + ":\"" + oldworkingStatus["Manual Assignee"] + "\""

                workingState += "}"

                updatedData["stateUserMapping"] = workingState

                for row in req:
                    print("current row",row,"\n\n")
                    if "CardType" not in row and "TcID" not in row and "BrowserName" not in row and req[row] != "undefined":
                        updatedData[row] = req[row]
                d = TC_INFO_GUI.objects.using(Release).get(id = updatedData["id"])
                print("Printing d",d)
                updateGuiTcInfo(d, updatedData, Release)

            # UPDATE GUI TC INFO IN DCX-DMC-Master release
            if Release != "TestDatabase":
                if "dmc" in Release.lower():
                    master = "DMC Master"
                else:
                    master = "master"
            data = TC_INFO_GUI.objects.using(master).filter(TcID = req['TcID'], CardType = req["CardType"])
            dataSer = TC_INFO_GUI_SERIALIZER(data, many = True)

            for data in dataSer.data:
                print("data for master or dmc master",data)
                updatedData = data
                for row in req:
                    print("row for master dmc master",row)
                    if "CardType" not in row and "TcID" not in row and "BrowserName" not in row and req[row] != "undefined":
                        updatedData[row] = req[row]
                d = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], CardType = req["CardType"], BrowserName = data["BrowserName"])
                print("updatedData for master dmc master",updateData)
                updateGuiTcInfo(d, updatedData, master)

            # UPDATE ROOTRELEASE
            Release = rootRelease
            data = TC_INFO_GUI.objects.using(Release).filter(TcID = req['TcID'], CardType = req["CardType"])
            dataSer = TC_INFO_GUI_SERIALIZER(data, many = True)
            for data in dataSer.data:
                print("rootrelease data",data)
                updatedData = data
                for row in req:
                    print("rootrelease row",row)
                    if "CardType" not in row and "TcID" not in row and "BrowserName" not in row and req[row] != "undefined":
                        updatedData[row] = req[row]
                d = TC_INFO_GUI.objects.using(Release).get(id = updatedData["id"])
                updateGuiTcInfo(d, updatedData, Release)
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
        atd = {}

        data = APPLICABILITY.objects.all().using(rootRelease)
        serializer = APPLICABILITY_SERIALIZER(data, many = True)

        for row in serializer.data:
            pf = row["Platform"]
            at = json.loads(row["ApplicableTCs"].replace("'", "\""))
            if "GUI" in at:
                for tc in at["GUI"]:
                    if tc not in atd:
                        atd[tc] = []
                    atd[tc].append(pf)

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

            if tcdata["id"] in atd:
                tcdata["Platform"] = atd[tcdata["id"]]
                print(tcdata["Platform"])
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
        Platform = request.GET.getlist('Platform', [])
        Domain = str(request.GET.get('Domain', None))
        SubDomain = str(request.GET.get('SubDomain', None))
        Priority = str(request.GET.get('Priority', None))
        WorkingStatus = str(request.GET.get('WorkingStatus',None))
        Assignee = str(request.GET.get('Assignee',None))
        Applicable = str(request.GET.get('applicable',None))

        infodata = TC_INFO_GUI.objects.using(Release).all()
        print("length", len(infodata))

        infodataUpdate = TC_INFO_GUI.objects.all().using(Release).filter(~Q(applicable = "Applicable"))
        infoserializerUpdate = TC_INFO_GUI_SERIALIZER(infodataUpdate, many = True)
        for i in infoserializerUpdate.data:
            break
            tcid = i["TcID"]
            card = i["CardType"]
            try:
                data = TC_INFO_GUI.objects.using(Release).filter(TcID = tcid).get(CardType = card)
                serializer = TC_INFO_GUI_SERIALIZER(data)
                updatedData = serializer.data

                if "Applicable" not in updatedData["applicable"]:
                    updatedData["applicable"] = "Applicable"
                    updateGuiTcInfo(updatedData, data, Release)
            except:
                pass

        infodataUpdate1 = TC_INFO_GUI.objects.all().using(Release).filter(stateUserMapping = "{\"CREATED\":\"DEFAULT\"}")
        infoserializerUpdate1 = TC_INFO_GUI_SERIALIZER(infodataUpdate1, many = True)
    
        for i in infoserializerUpdate1.data:
                break
                tcid = i["TcID"]
                card = i["CardType"]
                data = TC_INFO_GUI.objects.using(Release).filter(TcID = tcid).filter(CardType = card)
                serializer = TC_INFO_GUI_SERIALIZER(data, many = True)
                updatedData1 = serializer.data
                for tc in updatedData1:
                    browsername = tc["BrowserName"]
                    card = tc["CardType"]
                    tcid = tc["TcID"]
                    data1 = TC_INFO_GUI.objects.using(Release).get(TcID = tcid, CardType = card, BrowserName = browsername)
                    serializer1 = TC_INFO_GUI_SERIALIZER(data1)
                    updatedData2 = serializer1.data
                    SUM = json.dumps(updatedData2["stateUserMapping"])
                    if "CREATED" in SUM:
                        updatedData2["stateUserMapping"] = "{\"Manual Assignee\": \"Portal\", \"Manual WorkingStatus\": \"Inprogress\",\"Automation Assignee\": \"Portal\", \"Automation WorkingStatus\": \"AUTO_ASSIGNED\"}"
                        updateGuiTcInfo(data1, updatedData2, Release)

        if Applicable != 'None':
            if "," in Applicable:
                appl = Applicable.split(",")

                for a in appl:
                    infod = infodata.filter(applicable = a)
                    try:
                        infodataone = infodataone | infod
                    except:
                        infodataone = infod

                infodata = infodataone
        if Platform != 'None':
            infodata = infodata.filter(Platform = Platform)
        if Domain != 'None':
            infodata = infodata.filter(Domain = Domain)
        if SubDomain != 'None':
            infodata = infodata.filter(SubDomain = SubDomain)
        if Priority != 'None':
            infodata = infodata.filter(Priority = Priority)
        if WorkingStatus != 'None':
            infodata = infodata.filter(stateUserMapping__icontains = WorkingStatus)
        if  Assignee != 'None':
            infodata = infodata.filter(Assignee = Assignee)

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
            info["TcName"] =  info["TcName"]

            #For stateUserMapping Of Test Case
            info['stateUserMapping'] = info['stateUserMapping'].replace("\'","\"")
            try:
                info['stateUserMapping'] = json.loads(info['stateUserMapping'])
            except:
                pass

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

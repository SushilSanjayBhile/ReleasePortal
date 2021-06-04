from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import Trunc
import json, time, os, copy

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, TC_STATUS_GUI_SERIALIZER, \
        LATEST_TC_STATUS_GUI_SERIALIZER, TC_INFO_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, \
        APPLICABILITY_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LATEST_TC_STATUS, APPLICABILITY, RELEASES
from .forms import TcInfoForm, GuiInfoForm
from django.db.models import Q

from dp import settings
import datetime
from .forms import LogForm
from itertools import chain
from .new import rootRelease, update_automation_count

def GenerateLogData(UserName, RequestType, url, logData, tcid, card, Release):
    Timestamp = datetime.datetime.now()
    data = {'UserName': UserName, 'RequestType': RequestType, 'LogData': logData, 'Timestamp': Timestamp, 'URL': url, 'TcID': tcid, 'CardType': card}
    fd = LogForm(data)
    if fd.is_valid():
        data = fd.save(commit = False)
        data.save(using = Release)
    else:
        print("INVALID", fd.errors)

def add_cli_tcs_in_given_release(infoserializer, master, release):
    for tc in infoserializer.data:
        tcid = tc["TcID"]
        cardtype = tc["CardType"]

        singletc = TC_INFO.objects.using(master).filter(TcID = tcid, CardType = cardtype)
        if len(singletc) == 0:
            try:
                tc = TC_INFO.objects.using(release).get(TcID = tcid, CardType = cardtype)
                tc = TC_INFO_SERIALIZER(tc).data
                fd = TcInfoForm(tc)
                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = master)
                else:
                    print("INVALID", fd.errors)
            except:
                pass

def add_gui_tcs_in_given_release(serializer, master, release):
    for gui in serializer.data:
        tcid = gui["TcID"]
        card = gui["CardType"]
        browsername = gui["BrowserName"]

        singledata = TC_INFO_GUI.objects.using(master).filter(TcID = tcid, CardType = card, BrowserName = browsername)
        if len(singledata) == 0:
            try:
                tc = TC_INFO_GUI.objects.using(release).get(TcID = tcid, CardType = card, BrowserName = browsername)
                tc = TC_INFO_GUI_SERIALIZER(tc).data
                fd = GuiInfoForm(tc)
                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = master)
                else:
                    print("INVALID", fd.errors)
            except:
                pass

def duplicate_tcs_by_rel(request):
    release = "DCX-DMC-Master"
    tcdata = TC_INFO.objects.using(release).values().all()
    print("before length", len(tcdata))

    for i in tcdata:
        d = TC_INFO.objects.using(release).get(id= i["id"])
        if i["CardType"] != "COMMON":
            if len(i["Platform"]):
                for p in i["Platform"]:
                    ser = TC_INFO_SERIALIZER(i).data
                    ser["CardType"] = p

                    #try:
                    #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                    #    print("Total",len(check))
                    #    if len(check) > 1:
                    #        for index in range(len(check) - 1):
                    #            TC_INFO.objects.using(release).get(id = check[index].id).delete()
                    #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                    #    print("Total after",len(check))
                    #except:
                    #    pass

                    try:
                        #print(ser["TcID"], ser["CardType"])
                        check = TC_INFO.objects.using(release).get(TcID = ser["TcID"], CardType = ser["CardType"])
                    except:
                        fd = TcInfoForm(ser)
                        if fd.is_valid():
                            print("valid")
                            data = fd.save(commit = False)
                            data.save(using = release)
                        else:
                            print("INVALID", fd.errors)

    tcdata = TC_INFO.objects.using(release).values().all()
    print("after length", len(tcdata))

def duplicate_tcs_by_rel_gui(request):
    release = "DCX-DMC-Master"
    tcdata = TC_INFO_GUI.objects.using(release).values().all()
    print("before length", len(tcdata))

    for i in tcdata:
        d = TC_INFO_GUI.objects.using(release).get(id= i["id"])
        if i["CardType"] == "COMMON":
            if len(i["Platform"]):
                for p in i["Platform"]:
                    ser = TC_INFO_GUI_SERIALIZER(i).data
                    ser["CardType"] = p

                    #try:
                    #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                    #    print("Total",len(check))
                    #    if len(check) > 1:
                    #        for index in range(len(check) - 1):
                    #            TC_INFO.objects.using(release).get(id = check[index].id).delete()
                    #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                    #    print("Total after",len(check))
                    #except:
                    #    pass

                    try:
                        #print(ser["TcID"], ser["CardType"])
                        check = TC_INFO_GUI.objects.using(release).get(TcID = ser["TcID"], CardType = ser["CardType"], BrowserName = ser["BrowserName"])
                    except:
                        fd = GuiInfoForm(ser)
                        if fd.is_valid():
                            print("valid")
                            data = fd.save(commit = False)
                            data.save(using = release)
                        else:
                            print("INVALID", fd.errors)

    tcdata = TC_INFO_GUI.objects.using(release).values().all()
    print("after length", len(tcdata))



def duplicate_tcs(request):
#    return HttpResponse("UNCOMMENT CODE")
    for release in settings.DATABASES:
        print(release)
        #release = "DCX-DMC-Master"
        try:
            tcdata = TC_INFO.objects.using(release).values().all()
            print("before length", len(tcdata))

            for i in tcdata:
                d = TC_INFO.objects.using(release).get(id= i["id"])
                if len(i["Platform"]):
                    for p in i["Platform"]:
                        ser = TC_INFO_SERIALIZER(i).data
                        ser["CardType"] = p

                        #try:
                        #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                        #    print("Total",len(check))
                        #    if len(check) > 1:
                        #        for index in range(len(check) - 1):
                        #            TC_INFO.objects.using(release).get(id = check[index].id).delete()
                        #    check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                        #    print("Total after",len(check))
                        #except:
                        #    pass

                        try:
                            #print(ser["TcID"], ser["CardType"])
                            check = TC_INFO.objects.using(release).get(TcID = ser["TcID"], CardType = ser["CardType"])
                        except:
                            fd = TcInfoForm(ser)
                            if fd.is_valid():
                                print("valid")
                                data = fd.save(commit = False)
                                data.save(using = release)
                            else:
                                print("INVALID", fd.errors)

            tcdata = TC_INFO.objects.using(release).values().all()
            print("after length", len(tcdata))

        except:
            pass
    return HttpResponse("UNCOMMENt CODE")
def del_duplicate_tcs(request):
#    return HttpResponse("UNCOMMENT CODE")
    for release in settings.DATABASES:
        print(release)
        release = "Tanzu-3.2"
        try:
            tcdata = TC_INFO.objects.using(release).values().all()
            print("before length", len(tcdata))

            for i in tcdata:
                d = TC_INFO.objects.using(release).get(id= i["id"])
                if len(i["Platform"]):
                    for p in i["Platform"]:
                        ser = TC_INFO_SERIALIZER(i).data
                        ser["CardType"] = p

                        try:
                            check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                            print("Total",len(check))
                            if len(check) > 1:
                                for index in range(len(check) - 1):
                                    TC_INFO.objects.using(release).get(id = check[index].id).delete()
                            check = TC_INFO.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                            print("Total after",len(check))
                        except:
                            pass

            tcdata = TC_INFO.objects.using(release).values().all()
            print("after length", len(tcdata))

        except:
            pass
    return HttpResponse("UNCOMMENt CODE")


def duplicate_tcs_gui(request):
#    return HttpResponse("UNCOMMENT CODE")
    for release in settings.DATABASES:
        print(release)
        try:
            #release = "TestDatabase"
            tcdata = TC_INFO_GUI.objects.using(release).values().all()
            print("before length", len(tcdata))

            for i in tcdata:
                d = TC_INFO_GUI.objects.using(release).get(id= i["id"])
                if len(i["Platform"]):
                    for p in i["Platform"]:
                        ser = TC_INFO_GUI_SERIALIZER(i).data
                        ser["CardType"] = p

                        #try:
                        #    check = TC_INFO_GUI.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                        #    print("Total",len(check))
                        #    if len(check) > 1:
                        #        for index in range(len(check) - 1):
                        #            TC_INFO_GUI.objects.using(release).get(id = check[index].id).delete()
                        #    check = TC_INFO_GUI.objects.using(release).filter(TcID = ser["TcID"], CardType = ser["CardType"])
                        #    print("Total after",len(check))
                        #except:
                        #    pass

                        try:
                            #print(ser["TcID"], ser["CardType"])
                            check = TC_INFO_GUI.objects.using(release).get(TcID = ser["TcID"], CardType = ser["CardType"])
                        except:
                            fd = GuiInfoForm(ser)
                            if fd.is_valid():
                                print("valid")
                                data = fd.save(commit = False)
                                data.save(using = release)
                            else:
                                print("INVALID", fd.errors)

            tcdata = TC_INFO_GUI.objects.using(release).values().all()
            print("after length", len(tcdata))
        except:
            pass

    return HttpResponse("UNCOMMENt CODE")

def sync_tcs(request):
    return HttpResponse("UNCOMMENT CODE")

    ignore_db = ["TestDatabase", "2.3.0", "Spektra 2.4"]
    for release in settings.DATABASES:
        if release in ignore_db:
            continue
        if "master" in release.lower():
            continue

        if "dmc" in release.lower():
            master = "DMC Master"
        else:
            master = "master"

        infodata = TC_INFO.objects.using(release).all()
        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)

        data_gui = TC_INFO_GUI.objects.using(release).all()
        serializer_gui = TC_INFO_GUI_SERIALIZER(data_gui, many = True)

        print("\nTotal cli and gui tcs", len(infodata), len(data_gui))

        # updating tc info in parent master
        print("Adding GUI TCs from " + release + " release into " + master + " release")
        add_gui_tcs_in_given_release(serializer_gui, master, release)

        # store tc in master/DMC master if not present
        print("Adding CLI TCs from " + release + " release into " + master + " release")
        add_cli_tcs_in_given_release(infoserializer, master, release)

        master = rootRelease

        # store tc in rootRelease if not present
        print("Adding GUI TCs from " + release + " release into " + master + " release")
        add_gui_tcs_in_given_release(serializer_gui, master, release)

        # store tc in rootRelease if not present
        print("Adding CLI TCs from " + release + " release into " + master + " release")
        add_cli_tcs_in_given_release(infoserializer, master, release)

    return HttpResponse("INSIDE SYNC TCS")
    

#attaching tcid to tcinfo row 
def createInfoDict(data, Release):
    infoDict = {}

    for row in data:
        infoDict[row["id"]] = row

    return infoDict

@csrf_exempt
def WHOLE_TC_INFO(request, Release):
    if request.method == "GET":
        AllInfoData = []
        statusDict = {}

        index = int(request.GET.get('index', 0))

        #Platform = request.GET.getlist('Platform',[])
        CardType = str(request.GET.get('CardType', None))
        Domain = str(request.GET.get('Domain', None))
        SubDomain = str(request.GET.get('SubDomain', None))
        Priority = str(request.GET.get('Priority', None))
        WorkingStatus = str(request.GET.get('WorkingStatus',None))
        Assignee = str(request.GET.get('Assignee',None))
        Applicable = str(request.GET.get('applicable',None))

        infodata = TC_INFO.objects.all().using(Release).filter(~Q(Domain = "GUI"))
        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)

        statusdata = TC_STATUS.objects.using(Release).all().order_by('Date')
        infodata = TC_INFO.objects.all().using(Release).filter(~Q(Domain = "GUI"))
        if Applicable != 'None':
            if "," in Applicable:
                appl = Applicable.split(",")

                for a in appl:
                    infod = infodata.filter(applicable__icontains = a)
                    try:
                        infodataone = infodataone | infod
                    except:
                        infodataone = infod

                infodata = infodataone

        for i in infodata:
                serializer = TC_INFO_SERIALIZER(i)
        #if Platform != []:
        #    infodata = infodata.filter(Platform__contains = Platform)
        if CardType != 'None':
            infodata = infodata.filter(CardType = CardType)
        if Domain != 'None':
            infodata = infodata.filter(Domain = Domain)
        if SubDomain != 'None':
            infodata = infodata.filter(SubDomain = SubDomain)
        #if CardType != 'None':
        #    infodata = infodata.filter(CardType = CardType)
        if Priority != 'None':
            infodata = infodata.filter(Priority = Priority)
        if WorkingStatus != 'None':
            infodata = infodata.filter(stateUserMapping__icontains = WorkingStatus)
        if  Assignee != 'None':
            infodata = infodata.filter(Assignee = Assignee)

        count = int(request.GET.get('count', len(infodata)))
        #count = int(request.GET.get('count', 25))
        try:
            infodata = infodata[index : (index + count)]
        except:
            allDataCount = info.count()
            if index < allDataCount and count < allDataCount:
                infodata = infodata[index:count]
            elif index < allDataCount:
                infodata = infodata[index:]
            else:
                infodata = TC_INFO.objects.using(Release).all()

        infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
        statusserializer = TC_STATUS_SERIALIZER(statusdata, many=True)

        data = json.dumps(statusserializer.data)
        data = json.loads(data)

        for rec in data:
            tcid = rec['TcID']
            card = rec['CardType'].strip('][').strip('\'')

            if card not in statusDict:
                statusDict[card]= {}
            if tcid in statusDict[card]: 
                statusDict[card][tcid].append(rec)
            else:
                statusDict[card][tcid] = []
                statusDict[card][tcid].append(rec)

        c= 0 
        for info in infoserializer.data:
            info['StatusList'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Platform":info['Platform'], "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}
            info['CurrentStatus'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Platfom": info['Platform'], "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}

            card = info['CardType']
            tcid = info['TcID']

            #For stateUserMapping Of Test Case
            info['stateUserMapping'] = info['stateUserMapping'].replace("\'","\"")
            try:
                info['stateUserMapping'] = json.loads(info['stateUserMapping'])
            except:
                pass

            try:
                info['StatusList'] = statusDict[card][tcid]
                if statusDict[card][tcid][-1]["Result"] == "Unblocked":
                    info["CurrentStatus"] = {}
                else:
                    info['CurrentStatus'] = statusDict[card][tcid][-1]
            except:
                pass

            AllInfoData.append(info)
        return HttpResponse(json.dumps(AllInfoData))

@csrf_exempt
def TC_INFO_GET_POST_VIEW(request, Release):
    master = "master"
    dmcMaster = "DMC Master"
    errorMsg = {}
    errorMsg[Release] = []
    errorMsg[master] = []

    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        cards = req['CardType']
        req['stateUserMapping'] = json.dumps(req['stateUserMapping'])

        for card in cards:
            flag = 0
            # post request for current release
            data = TC_INFO.objects.using(Release).filter(TcID = req['TcID']).filter(CardType = card)
            if len(data) != 0:
                errorMsg[Release].append('Duplicate: ' + req['TcID'] + ' with ' + card)
                conflictFlag = True
            else:
                serializer = TC_INFO_SERIALIZER(data, many = True)
                newData  = req
                newData = json.dumps(newData)
                newData = json.loads(newData)
                newData['CardType'] = card
                fd = TcInfoForm(newData)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    if "master" not in Release:
                        flag = 1
                        data.save(using = Release)

                    if "Activity" in req:
                        AD = req['Activity']
                        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])

            # post request for master release
            if "dmc" in Release.lower():
                master = dmcMaster
            else:
                master = "master"
            if Release != master and Release != "TestDatabase" and "master" not in Release.lower():
                data = TC_INFO.objects.using(master).filter(TcID = req['TcID']).filter(CardType = card)
                if len(data) != 0:
                    errorMsg[master].append('Duplicate: ' + req['TcID'] + ' with ' + card)
                else:
                    serializer = TC_INFO_SERIALIZER(data, many = True)
                    newData  = req
                    newData = json.dumps(newData)
                    newData = json.loads(newData)
                    newData['CardType'] = card

                    fd = TcInfoForm(newData)

                    if fd.is_valid():
                        data = fd.save(commit = False)
                        data.save(using = master)
                        flag = 1

                        if "Activity" in req:
                            AD = req['Activity']
                            GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, master)

            # post request for dmc-dxc-master release
            master = rootRelease
            data = TC_INFO.objects.using(master).filter(TcID = req['TcID']).filter(CardType = card)
            if len(data) == 0:
                serializer = TC_INFO_SERIALIZER(data, many = True)
                newData  = req
                newData = json.dumps(newData)
                newData = json.loads(newData)
                newData['CardType'] = card

                fd = TcInfoForm(newData)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = master)
                    flag = 1

                    if "Activity" in req:
                        AD = req['Activity']
                        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, master)

            if flag == 1:
                update_automation_count("increaseTotal", "CLI")

                if newData["TcName"] != "TC NOT AUTOMATED":
                    update_automation_count("increaseAutomated", "CLI")

        return HttpResponse("SUCCESSFULLY UPDATED")

    elif request.method == "GET":
        index = int(request.GET.get('index', 0))
        count = int(request.GET.get('count', 100))

        try:
            if count == 0:
                data = TC_INFO.objects.using(Release).all()[index : ]
            else:
                data = TC_INFO.objects.using(Release).all()[index : (index + count)]
        except:
            return JsonResponse({'message': 'Unknown error occured'}, status = 400)

        if len(data) == 0:
            return JsonResponse({'message': 'Records no found at given index'}, status = 400)

        serializer = TC_INFO_SERIALIZER(data, many=True)
        return HttpResponse(json.dumps(serializer.data))
    """
    elif request.method == "DELETE":
        req = json.loads(request.body.decode("utf-8"))
        data = TC_INFO.objects.filter(TcID = req['TcID'])
        serializer = TC_INFO_SERIALIZER(data,many = True)
        d = json.dumps(serializer.data)
        d = json.loads(d)        
        
        if(len(d[0]['Setup']) > 1):
            print(d[0]['Setup'])
            return HttpResponse("PLEASE PROVIDE SETUP ALSO NAME ALSO AS THERE ARE MULTIPLE SETUPS")
        if(len(d[0]['OrchestrationPlatform']) > 1):
            print(d[0]['OrchestrationPlatform'])
            return HttpResponse("PLEASE PROVIDE ORCHESTRATION PLATFORM NAME AS THERE ARE MULTIPLE PLATFORMS")

        return HttpResponse(json.dumps(d))
    """

# Function to update TC INFO data
def updateData(updatedData, data, Release):
    if data.TcName == "TC NOT AUTOMATED" and data.TcName != updatedData["TcName"] and Release == rootRelease:
        update_automation_count("increaseAutomated", "CLI")
    
    if data.TcName != "TC NOT AUTOMATED" and updatedData["TcName"] == "TC NOT AUTOMATED" and Release == rootRelease:
        print("2",updatedData['AutomationDate'])
        update_automation_count("decreaseAutomated", "CLI")

    if data.TcName != updatedData["TcName"] and data.TcName == "TC NOT AUTOMATED":
        updatedData['AutomationDate'] = datetime.datetime.now()

    data.TcID = updatedData['TcID']
    data.id = updatedData['id']
    data.TcName = updatedData['TcName']
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
    return 1

# Function to update TC STATUS data
def updateStatusData(updatedData, data, Release):
     data.TcID = updatedData['TcID']
     data.TcName = updatedData['TcName']
     data.Build = updatedData['Build']
     data.TestedOn = updatedData['TestedOn']
     data.Result = updatedData['Result']
     data.Bugs = updatedData['Bugs']
     data.Date = updatedData['Date']
     data.Domain = updatedData['Domain']
     data.SubDomain = updatedData['SubDomain']
     data.CardType = updatedData['CardType']
     data.save(using = Release)
     return 1

def TcCountByFilter(request, Release):
    ##UNCOMMENT FROM BELOW
    infodata = TC_INFO.objects.using(Release).all()
    ser = TC_INFO_SERIALIZER(infodata, many = True)

    count = 0
    diction = {}

    for i in ser.data:
            break
            sd = TC_INFO.objects.using(Release).filter(TcID = i['TcID'], CardType = i['CardType'])
            ser = TC_INFO_SERIALIZER(sd, many = True)

            if len(ser.data) == 1:
                continue

            records = len(ser.data)
            count+=1

            data = json.dumps(ser.data)
            data = json.loads(data)

            if i["TcID"] not in diction:
                diction[i["TcID"]] = {}
            if "id" not in diction[i["TcID"]]:
                diction[i["TcID"]]["id"] = {}

            diction[i["TcID"]]["id"][i["Priority"]] = i["id"]
    c = 0
    #for i in diction:
    #    if len(diction[i]["id"]) == 1:
    #        for key in diction[i]["id"]:
    #            print(diction[i]["id"][key])

    guidata = TC_INFO_GUI.objects.using(Release).all()
    guiser = TC_INFO_GUI_SERIALIZER(guidata, many = True)

    for tc in guiser.data:
        data = TC_INFO_GUI.objects.using(Release).filter(TcID = tc["TcID"], BrowserName = tc["BrowserName"])

        data = TC_INFO_GUI.objects.using(Release).filter(TcID = tc["TcID"], BrowserName = tc["BrowserName"])
        dataser = TC_INFO_GUI_SERIALIZER(data, many = True)

        if len(dataser.data) > 1:
            records = len(dataser.data)
            for i in dataser.data:
                if records != 1:
                    TC_INFO_GUI.objects.using(Release).get(id = i["id"]).delete()
                    records -= 1
    return HttpResponse("DELETED DUPLICATE TCS")


def TcCountByFilter2(request, Release):
        countDict = {}
        data = TC_INFO.objects.filter(Domain = "RBAC").using(Release)
        serializer = TC_INFO_SERIALIZER(data, many = True)

        for d in serializer.data:
            card = d['CardType']
            tcid = d['TcID']
            dat = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
            d = json.dumps(d)
            d = json.loads(d)
            updatedData = d

            if "-" not in d['TcID']:
                #print(d['TcID'], d['CardType'])
                dat.delete()
        return HttpResponse(json.dumps(countDict))

@csrf_exempt
def MULTIPLE_TC_INFO_UPDATION1(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRec = {}
        print("requests",requests)
        for req in requests:
            print("req",req)
            card = req['CardType']
            tcid = req['TcID']
            
            # update Data Master
            try:
                if Release != "TestDatabase":
                    if "dmc" in Release.lower():
                        master = "DMC Master"
                    else:
                        master = "master"
                dataMaster = TC_INFO.objects.using(master).filter(TcID = tcid).get(CardType = card)
                serializerMaster = TC_INFO_SERIALIZER(dataMaster)
                updatedDataMaster = serializerMaster.data 
                
                for key in req:
                    if key in updatedDataMaster and (key != "CardType" and key != "TcID" and key != "Priority" and key != "applicable"):
                        updatedDataMaster[key] = req[key]
                
                updateData(updatedDataMaster, dataMaster, master)
                
                if "Activity" in requests:
                    AD = requests['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], master)
        
            except:
                pass

            # update data in rootMaster
            try:
                if Release != "TestDatabase":
                    master = rootRelease
                dataMaster = TC_INFO.objects.using(master).filter(TcID = tcid).get(CardType = card)
                serializerMaster = TC_INFO_SERIALIZER(dataMaster)
                updatedDataMaster = serializerMaster.data

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
                data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
                serializer = TC_INFO_SERIALIZER(data)
                updatedData = serializer.data
                
                
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
@csrf_exempt
def MULTIPLE_TC_INFO_UPDATION(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRec = {}
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
                    dataMaster = TC_INFO.objects.using(master).filter(TcID = tcid)
                    serializerMaster = TC_INFO_SERIALIZER(dataMaster, many = True)
                    for d in serializerMaster.data:
                        singleData = TC_INFO.objects.using(master).get(id= d['id'])
                        singleSerializer = TC_INFO_SERIALIZER(singleData)
                        updatedDataMaster = singleSerializer.data
                        for key in req:
                            if key in updatedDataMaster and (key != "CardType" and key != "TcID" and key != "Priority" and key != "applicable"):
                                updatedDataMaster[key] = req[key]
                        updateData(updatedDataMaster, singleData, master)
                        if "Activity" in requests:
                            AD = requests['Activity']
                            GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], master)

            except:
                pass

            # update data in rootMaster
            try:
               if Release != "TestDatabase":
                   master = rootRelease
                   dataMaster = TC_INFO.objects.using(master).filter(TcID = tcid)
                   serializerMaster = TC_INFO_SERIALIZER(dataMaster, many = True)
                   for d in serializerMaster.data:
                       singleData = TC_INFO.objects.using(master).get(id= d['id'])
                       singleSerializer = TC_INFO_SERIALIZER(singleData)
                       updatedDataMaster = singleSerializer.data
                       for key in req:
                           if key in updatedDataMaster and (key != "CardType" and key != "TcID" and key != "Priority" and key != "applicable"):
                               updatedDataMaster[key] = req[key]
                       updateData(updatedDataMaster, singleData, master)
                       if "Activity" in requests:
                           AD = requests['Activity']
                           GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], master)
            except:
                pass

            try:
                #data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
               # data = TC_INFO.objects.using(Release).filter(TcID = tcid, CardType = card).values()
               # serializer = TC_INFO_SERIALIZER(data)
               # updatedData = serializer.data
               # 
               # 
               # for key in req:
               #     if key in updatedData and (key != "CardType" and key != "TcID"):
               #         updatedData[key] = req[key]
               # print("updatedData.[tcname]",updatedData["TcName"],serializer.data["TcName"])
               # print("updatedData.tcname",updatedData.TcName,serializer.data.TcName)
               # updateData(updatedData, serializer.data, Release)
               # print("after updateData")
               # if "Activity" in requests:
               #     AD = requests['Activity']
               #     GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
                data = TC_INFO.objects.using(Release).filter(TcID = tcid)
                serializer = TC_INFO_SERIALIZER(data, many = True)
                for d in serializer.data:
                    singleData = TC_INFO.objects.using(Release).get(id= d['id'])
                    singleSerializer = TC_INFO_SERIALIZER(singleData)
                    updatedData = singleSerializer.data
                    for key in req:
                        if key in updatedData and (key != "CardType" and key != "TcID"):
                            updatedData[key] = req[key]
                    updateData(updatedData, singleData, Release)
                    if "Activity" in requests:
                        AD = requests['Activity']
                        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
            except:
                data = TC_INFO.objects.using(Release).filter(TcID = tcid)
                serializer = TC_INFO_SERIALIZER(data, many = True)
                for d in serializer.data:
                    singleData = TC_INFO.objects.using(Release).get(id= d['id'])
                    singleSerializer = TC_INFO_SERIALIZER(singleData)
                    updatedData = singleSerializer.data
                    for key in req:
                        if key in updatedData and (key != "CardType" and key != "TcID"):
                            updatedData[key] = req[key]
                    updateData(updatedData, singleData, Release)

                if card not in errRec:
                    errRec[card] = []
                errRec[card].append(tcid)


        if len(errRec) > 0:
            return HttpResponse(json.dumps(errRec), status = 400)
        return HttpResponse("Successfully Updated All Records", status = 200)


@csrf_exempt
def MULTIPLE_TC_UPDATION(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRecords = []

        for req in requests:
            card = req['CardType']
            tcid = req['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid)
            #print("len of data",len(data))
            serializer = TC_INFO_SERIALIZER(data, many = True)
            for d in serializer.data:
                singleData = TC_INFO.objects.using(Release).get(id= d['id'])
                singleSerializer = TC_INFO_SERIALIZER(singleData)
                updatedData = singleSerializer.data
                oldworkingStatus = updatedData["stateUserMapping"]
                oldworkingStatus = oldworkingStatus.replace("\'","\"")
                try:
                    oldworkingStatus = json.loads(oldworkingStatus)
                except:
                    workingStatusReplace = "{\"CREATED\":\"DEFAULT\"}"
                    updatedData["stateUserMapping"] = workingStatusReplace
                    updateData(updatedData, singleData, Release)

                    data = TC_INFO.objects.using(Release).get(id= d['id'])
                    serializer = TC_INFO_SERIALIZER(data)
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

                #print("after update working status",workingState)
                updatedData["stateUserMapping"] = workingState

                for key in req:
                    if key in updatedData and (key != "CardType" and key != "TcID"):
                        updatedData[key] = req[key]

                res = updateData(updatedData, singleData, Release)
                if res == 0:
                    errRecords.append(req)
                elif "Activity" in requests:
                    AD = requests['Activity']
                    GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
        
            if len(errRecords) > 0:
                return HttpResponse(json.dumps(errRecords))

            return HttpResponse({"SUCCESS": "Record Successfully updated"})

    #elif request.method == "DELETE":
    #    requests = json.loads(request.body.decode("utf-8"))
    #    errRecords = []

    #    for req in requests:
    #        card = req['CardType']
    #        tcid = req['TcID']

    #        data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
    #        serializer = TC_INFO_SERIALIZER(data)
    #        updatedData = serializer.data
    #        updatedData['WorkingStatus'] = "SKIP"

    #        res = updateData(updatedData, data, Release)
    #        if res == 0:
    #            errRecords.append(req)
    #        elif "Activity" in req:
    #            AD = requests['Activity']
    #            GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
    #    
    #    if len(errRecords) > 0:
    #        return HttpResponse(json.dumps(errRecords))
    #    return HttpResponse({"SUCCESS": "SOFT DELETED ALL RECORDS"})

@csrf_exempt
def MULTIPLE_TC_UPDATION_OLD(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRecords = []

        print("request for approved",requests)
        for req in requests:
            print("tc for updation",req,"\n\n")
            card = req['CardType']
            tcid = req['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
            #print("len of data",len(data))
            print("data",data)
            serializer = TC_INFO_SERIALIZER(data)
            updatedData = serializer.data
            oldworkingStatus = updatedData["stateUserMapping"]
            oldworkingStatus = oldworkingStatus.replace("\'","\"")
            try:
                oldworkingStatus = json.loads(oldworkingStatus)
            except:
                workingStatusReplace = "{\"CREATED\":\"DEFAULT\"}"
                updatedData["stateUserMapping"] = workingStatusReplace
                updateData(updatedData, data, Release)

                data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
                serializer = TC_INFO_SERIALIZER(data)
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

            #print("after update working status",workingState)
            print(oldworkingStatus, workingState)
            updatedData["stateUserMapping"] = workingState

            for key in req:
                updatedData[key] = req[key]

            res = updateData(updatedData, data, Release)
            if res == 0:
                errRecords.append(req)
            elif "Activity" in requests:
                AD = requests['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        
        if len(errRecords) > 0:
            return HttpResponse(json.dumps(errRecords))

        return HttpResponse({"SUCCESS": "Record Successfully updated"})

    elif request.method == "DELETE":
        requests = json.loads(request.body.decode("utf-8"))
        errRecords = []

        for req in requests:
            card = req['CardType']
            tcid = req['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
            serializer = TC_INFO_SERIALIZER(data)
            updatedData = serializer.data
            updatedData['WorkingStatus'] = "SKIP"

            res = updateData(updatedData, data, Release)
            if res == 0:
                errRecords.append(req)
            elif "Activity" in req:
                AD = requests['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        
        if len(errRecords) > 0:
            return HttpResponse(json.dumps(errRecords))
        return HttpResponse({"SUCCESS": "SOFT DELETED ALL RECORDS"})


@csrf_exempt
def GET_TC_INFO_BY_ID(request, Release, id, card):
    if request.method == "GET":
        atd = {}

        data = APPLICABILITY.objects.all().using(rootRelease)
        serializer = APPLICABILITY_SERIALIZER(data, many = True)

        for row in serializer.data:
            pf = row["Platform"]
            at = json.loads(row["ApplicableTCs"].replace("'", "\""))
            if "CLI" in at:
                for tc in at["CLI"]:
                    if tc not in atd:
                        atd[tc] = []
                    atd[tc].append(pf)
        #print(json.dumps(atd, indent = 2))
        infoData = TC_INFO.objects.using(Release).filter(TcID = id).get(CardType = card)
        activityData = LOGS.objects.using(Release).filter(TcID = id).filter(CardType = card)

        activitySerializer = LOG_SERIALIZER(activityData, many = True)
        infoSerializer = TC_INFO_SERIALIZER(infoData)

        try:
            statusData = TC_STATUS.objects.using(Release).filter(TcID = id).filter(CardType = card).order_by('Date')
            statusSerializer = TC_STATUS_SERIALIZER(statusData, many=True)
    
            tcdata = infoSerializer.data
            tcdata['Activity'] = activitySerializer.data
            tcdata['StatusList'] = []
            for status in statusSerializer.data:
                tcdata['StatusList'].append(status)
        except:
            return JsonResponse({'Not Found': "Record Not Found"}, status = 404)
        #print(tcdata["id"], "\n", atd)
        if tcdata["id"] in atd:
            tcdata["Platform"] = atd[tcdata["id"]]
        return HttpResponse(json.dumps(tcdata))

@csrf_exempt
def UPDATE_TC_INFO_BY_ID(request, Release, id, card):
    if request.method == "PUT":
        errRecords = []
        req = json.loads(request.body.decode("utf-8")) # original

        data = TC_INFO.objects.using(Release).filter(TcID = id)
        serializer = TC_INFO_SERIALIZER(data, many = True)

        for d in serializer.data:
            singleData = TC_INFO.objects.using(Release).filter(TcID = id).get(CardType = d['CardType'])
            singleSerializer = TC_INFO_SERIALIZER(singleData)
            updatedData = singleSerializer.data

            for key in req:
                if key == "NewTcID":
                    verifyData = TC_INFO.objects.using(Release).filter(TcID = req['NewTcID']).filter(CardType = d['CardType'])
                    if len(verifyData) > 0:
                        errRecords.append(req)
                        continue
                    updatedData['TcID'] = req['NewTcID']
                elif key == "CardType":
                    pass
                elif key != "Activity":
                    updatedData[key] = req[key]

            res = updateData(updatedData, singleData, Release)
            if res == 0:
                errRecords.append(req)
            elif "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])
        
        if "5.0.0" in Release:
            if len(errRecords) > 0:
                return JsonResponse({'Conflict': errRecords}, status = 409)
            return JsonResponse({'message': 'Success'}, status = 200)

        if "dmc" in Release.lower():
            Release = "DMC Master"
        else:
            Release = "master"
        data = TC_INFO.objects.using(Release).filter(TcID = id)
        serializer = TC_INFO_SERIALIZER(data, many = True)

        for d in serializer.data:
            singleData = TC_INFO.objects.using(Release).get(id= d['id'])
            singleSerializer = TC_INFO_SERIALIZER(singleData)

            updatedData = singleSerializer.data

            for key in req:
                if key == "NewTcID":
                    verifyData = TC_INFO.objects.using(Release).filter(TcID = req['NewTcID']).filter(CardType = d['CardType'])
                    if len(verifyData) > 0:
                        errRecords.append(req)
                        continue
                    updatedData['TcID'] = req['NewTcID']
                elif key != "Activity":
                    updatedData[key] = req[key]

            res = updateData(updatedData, singleData, Release)
            if res == 0:
                errRecords.append(req)
            elif "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])

        if len(errRecords) > 0:
            return JsonResponse({'Conflict': errRecords}, status = 409)

        # code to update tc in dmc-dcx-master release
        Release = rootRelease
        data = TC_INFO.objects.using(Release).filter(TcID = id)
        serializer = TC_INFO_SERIALIZER(data, many = True)

        for d in serializer.data:
            singleData = TC_INFO.objects.using(Release).get(id= d['id'])
            singleSerializer = TC_INFO_SERIALIZER(singleData)

            updatedData = singleSerializer.data

            for key in req:
                if key == "NewTcID":
                    verifyData = TC_INFO.objects.using(Release).filter(TcID = req['NewTcID']).filter(CardType = d['CardType'])
                    if len(verifyData) > 0:
                        errRecords.append(req)
                        continue
                    updatedData['TcID'] = req['NewTcID']
                elif key != "Activity":
                    updatedData[key] = req[key]

            res = updateData(updatedData, singleData, Release)
            if res == 0:
                errRecords.append(req)
            elif "Activity" in req:
                AD = req['Activity']
                GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], AD['CardType'], AD['Release'])

        if len(errRecords) > 0:
            return JsonResponse({'Conflict': errRecords}, status = 409)
        return JsonResponse({'message': 'Success'}, status = 200)

def sync_platform(request):
    #return HttpResponse("UNCOMMENT CODE")

    ignore_db = ["TestDatabase", "2.3.0", "Spektra 2.4"]
    for release in settings.DATABASES:
        print(release)
        #if release in ignore_db:
        #    continue
        #if "DCX-DMC-Master" not in release:
        #   continue

        #if "dmc" in release.lower():
        #    master = "DMC Master"
        #else:
        #    master = "master"
        
        #print("updating platforms in release" + release)
        cinfodata = TC_INFO.objects.using(release).all()
        platformsCli = cinfodata.values('Platform').distinct()
        #print("distinct cli platform in release",release,platformsCli)
        try:
            data = RELEASES.objects.using('universal').get(ReleaseNumber = release)
            """
            data.PlatformsCli = []
            data.PlatformsGui = []
            data.save()
            #print("distinct Cli platform in release",release,data.PlatformsCli)
            #print("distinct Gui platform in release",release,data.PlatformsGui)
            """
            #"""
            for platform in platformsCli:
                for p in platform["Platform"]:
                    if p not in data.PlatformsCli:
                        data.PlatformsCli.append(p)
                        data.save()
            ginfodata = TC_INFO_GUI.objects.using(release).all()

            platformsGui = ginfodata.values('Platform').distinct()
            print("distinct Cli platform in release",release, platformsCli)
            for platform in platformsGui:
                for p in platform["Platform"]:
                    if p not in data.PlatformsGui:
                        data.PlatformsGui.append(p)
                        data.save()
            print("distinct Gui platform in release",release,platformsGui)
            #"""
        except:
            print("in except")

    return HttpResponse("INSIDE SYNC PLATFORM")

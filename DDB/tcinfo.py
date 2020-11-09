from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.db.models.functions import Trunc
import json, time

from .serializers import TC_INFO_SERIALIZER, TC_STATUS_SERIALIZER, LOG_SERIALIZER, TC_STATUS_GUI_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER, TC_INFO_GUI_SERIALIZER, LATEST_TC_STATUS_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER
from .models import TC_INFO, TC_STATUS, LOGS, TC_INFO_GUI, GUI_LATEST_TC_STATUS, GUI_TC_STATUS, LATEST_TC_STATUS
from .forms import TcInfoForm
from django.db.models import Q

import datetime
from .forms import LogForm
from itertools import chain

def GenerateLogData(UserName, RequestType, url, logData, tcid, card, Release):
    Timestamp = datetime.datetime.now()
    data = {'UserName': UserName, 'RequestType': RequestType, 'LogData': logData, 'Timestamp': Timestamp, 'URL': url, 'TcID': tcid, 'CardType': card}
    fd = LogForm(data)
    if fd.is_valid():
        data = fd.save(commit = False)
        data.save(using = Release)
    else:
        print("INVALID", fd.errors)

#attaching tcid to tcinfo row 
def createInfoDict(data, Release):
    infoDict = {}

    for row in data:
        #d = TC_INFO_GUI.objects.using(Release).get(id = row["id"])
        #sd = TC_INFO_GUI_SERIALIZER(d)
        #updatedData = json.dumps(sd.data)
        #updatedData = json.loads(updatedData)

        #if updatedData["AutomatedTcName"] == "":
        #    updatedData["AutomatedTcName"] = "TC NOT AUTOMATED"

        #updateGuiData(updatedData, d, Release)
                
        infoDict[row["id"]] = row

    return infoDict

def updateGuiData(updatedData, data, Release):
     data.TcID = updatedData['TcID']
     data.id = updatedData['id']
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
     data.AutomatedTcName = updatedData['AutomatedTcName']
     data.BrowserName = updatedData['BrowserName']

     data.save(using = Release)
     return 1

@csrf_exempt
def WHOLE_TC_INFO(request, Release):
    if request.method == "GET":
        AllInfoData = []
        statusDict = {}

        index = int(request.GET.get('index', 0))

        Domain = str(request.GET.get('Domain', None))
        SubDomain = str(request.GET.get('SubDomain', None))
        CardType = str(request.GET.get('CardType', None))
        Priority = str(request.GET.get('Priority', None))
        WorkingStatus = str(request.GET.get('WorkingStatus',None))
        Applicable = str(request.GET.get('applicable',None))

        statusdata = TC_STATUS.objects.using(Release).all().order_by('Date')
        infodata = TC_INFO.objects.all().using(Release).filter(~Q(Domain = "GUI"))
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
        if Domain != 'None':
            infodata = infodata.filter(Domain = Domain)
        if SubDomain != 'None':
            infodata = infodata.filter(SubDomain = SubDomain)
        if CardType != 'None':
            infodata = infodata.filter(CardType = CardType)
        if Priority != 'None':
            infodata = infodata.filter(Priority = Priority)
        if WorkingStatus != 'None':
            infodata = infodata.filter(stateUserMapping__icontains = WorkingStatus)

        count = int(request.GET.get('count', len(infodata)))
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

        for info in infoserializer.data:
            info['StatusList'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}
            info['CurrentStatus'] = {"id": "", "TcID": info['TcID'], "TcName": info['TcName'], "Build": "", "Result": "", "Bugs": "", "Date": "", "Domain": info['Domain'], "SubDomain": info['SubDomain'], "CardType": info['CardType']}

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
            	    data.save(using = Release)
            	    
            	    if "Activity" in req:
            	        AD = req['Activity']
            	        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])

            # post request for master release
            if "dmc" in Release.lower():
                master = dmcMaster
            if Release != master and Release != "5.0.0":
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
                	    
                	    if "Activity" in req:
                	        AD = req['Activity']
                	        GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
                
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
 
     data.save(using = Release)
     return 1

# Function to update TC STATUS data
def updateStatusData(updatedData, data, Release):
     data.TcID = updatedData['TcID']
     data.TcName = updatedData['TcName']
     data.Build = updatedData['Build']
     data.Result = updatedData['Result']
     data.Bugs = updatedData['Bugs']
     data.Date = updatedData['Date']
     data.Domain = updatedData['Domain']
     data.SubDomain = updatedData['SubDomain']
     data.CardType = updatedData['CardType']

     data.save(using = Release)
     return 1

def TcCountByFilter(request, Release):
    #try:
    #    countDict = {}
    #    replaceDict = {'Storage-DrivesetTCs':'Storage-Driveset','StoragePVC':'Storage-PVC','VagrantCluster':'Vagrant Cluster','SoftwareSolution':'Software Solution','ManagementTestcases': "Management", "MultizoneCluster":"Multizone Cluster",  "NetworkTestCases":"Network", "Rbac":"RBAC","StorageMirrored-Tests":"Storage-Mirrored","Additionaltests":"Additional", "HelmTestCases":"Helm","Interfacetestcases":"Interface","Kubernetes-tests": "Kubernetes", "ManagementTestcases":"Management", "MultizoneCluster":"Multizone Cluster", "NetworkTestCases":"Network","QOSTestcases":"QOS","StorageMirrored-Tests":"Storage-Mirrored","StorageRemote-Tests":"Storage-Remote","StorageSnapshot-Tests":"Storage-Snapshot","Upgradetests":"Upgrade", "Storage-Tests":"Storage"}
    #    for i in replaceDict:
    #        data = TC_INFO.objects.filter(Domain = i).using(Release)
    #        serializer = TC_INFO_SERIALIZER(data, many = True)

    #        for d in serializer.data:
    #            card = d['CardType']
    #            tcid = d['TcID']
    #            dat = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
    #            d = json.dumps(d)
    #            d = json.loads(d)
    #            updatedData = d

    #            updatedData['Domain'] = replaceDict[i]
    #            print(dat.Domain)
    #            #print(updatedData, "\n",dat)
    #            updateData(updatedData, dat, Release)

    #    statusData = TC_STATUS.objects.using(Release).all()
    #    statusSerializer = TC_STATUS_SERIALIZER(statusData, many = True)

    #    for status in statusSerializer.data:
    #        stat = TC_STATUS.objects.using(Release).get(id = status['id'])
    #        serializer = TC_STATUS_SERIALIZER(stat)
    #        newData = status

    #        for rc in replaceDict:
    #            if rc in status['Domain']:
    #                for key in serializer.data:
    #                    if key == 'Domain':
    #                        newData[key] = replaceDict[rc]
    #                    else:
    #                        newData[key] = status[key]
    #                #print(newData['TcID'], newData['Domain'])
    #                updateStatusData(newData, stat, Release)
    #except:
    #    pass

    ##return HttpResponse(json.dumps(countDict))
    ##statusData = TC_STATUS.objects.using(Release).all()
    ##statusSerializer = TC_STATUS_SERIALIZER(statusData, many = True)

    ##for status in statusSerializer.data:
    ##    stat = TC_INFO.objects.using(Release).filter(TcID = status['TcID']).get(CardType = status['CardType'])
    ##    s = TC_STATUS.objects.using(Release).get(id = status['id'])

    ##    serializer = TC_INFO_SERIALIZER(stat)
    ##    newData = status

    ##    for key in status:
    ##        if key == 'Domain' or key == 'SubDomain' or key == 'TcName':
    ##            newData[key] = serializer.data[key]
    ##        else:
    ##            newData[key] = status[key]
    ##    updateStatusData(newData, s, Release)



    ##UNCOMMENT FROM BELOW
    print("FETCHING ALL TC INFO")
    infodata = TC_INFO.objects.using(Release).all()
    ser = TC_INFO_SERIALIZER(infodata, many = True)

    #for i in ser.data:
    #    try:
    #        sd = TC_INFO.objects.using(Release).get(TcID = i['TcID'], CardType = i['CardType'])
    #    except:
    #        print("COMING INSIDE EXCEPT")
    #        sd = TC_INFO.objects.using(Release).filter(TcID = i['TcID'], CardType = i['CardType'])
    #        ss = TC_INFO_SERIALIZER(sd, many = True)
    #        c = 0

    #        for i in ss.data:
    #            c += 1
    #            if c > 1:
    #                singledata = TC_INFO.objects.using(Release).get(id = i['id'])
    #                singleserializer = TC_INFO_SERIALIZER(singledata)
    #                updatedData = singleserializer.data
    #                if i['CardType'] == "BOS":
    #                    updatedData['CardType'] = "NYNJ"
    #                elif i['CardType'] == "NYNJ":
    #                    updatedData['CardType'] = "BOS"

    #                #print(i['id'], i['TcID'], i['CardType'], updatedData['CardType'])
    #                #updateData(updatedData, singledata, Release)

    #        #print("\n")

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
    for i in diction:
        if len(diction[i]["id"]) == 1:
            for key in diction[i]["id"]:
                print(diction[i]["id"][key])
                #TC_INFO.objects.using(Release).get(id = diction[i]["id"][key]).delete()

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


            # LOGIC TO DELETE DUPLICATE TCS

            #c = 0
            #for i in ss.data:
            #    c += 1

            #    if c > 1:
            #        continue
            #        print(i['id'], i['TcID'], i['CardType'], i["Domain"], i["SubDomain"])
            #        #data = TC_INFO.objects.using(Release).get(id = i['id']).delete()
            #        #print(data, c)
            #        #print(i['TcID'], i['CardType'], len(ss.data), i['id'], c)
            ##print()

    #infodata = TC_INFO.objects.using(Release).all()
    #ser = TC_INFO_SERIALIZER(infodata, many = True)

    #for i in ser.data:
    #    if i["CardType"] == "BOS" or i["CardType"] == "NYNJ":
    #        tcinfo = TC_INFO.objects.using(Release).filter(TcID = i["TcID"])
    #        tcinfoser = TC_INFO_SERIALIZER(tcinfo, many = True)

    #        if len(tcinfoser.data) != 2:
    #            if len(tcinfoser.data) == 1:
    #                data = TC_INFO.objects.using(Release).get(id = tcinfoser.data[0]['id'])
    #                s = TC_INFO_SERIALIZER(data)
    #                newData = s.data

    #                newData['CardType'] = "BOS"
    #                if s.data['CardType'] == "BOS":
    #                    newData['CardType'] = "NYNJ"

    #                del newData['id']
    #                #print(newData['CardType'], s.data['CardType'], newData)
    #                fd = TcInfoForm(newData)

    #                if fd.is_valid():
    #                    data = fd.save(commit = False)
    #                    data.save(using = Release)

    return HttpResponse("HELLO")


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
                print(d['TcID'], d['CardType'])
                dat.delete()
        return HttpResponse(json.dumps(countDict))




@csrf_exempt
def MULTIPLE_TC_INFO_UPDATION(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRec = {}

        for req in requests:
            card = req['CardType']
            tcid = req['TcID']
            
            try:
                # for master release
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
def MULTIPLE_TC_UPDATION(request, Release):
    if request.method == "PUT":
        requests = json.loads(request.body.decode("utf-8"))
        errRecords = []

        for req in requests:
            print("tc for updation",req,"\n\n")
            card = req['CardType']
            tcid = req['TcID']

            data = TC_INFO.objects.using(Release).filter(TcID = tcid).get(CardType = card)
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
        return JsonResponse({'message': 'Success'}, status = 200)

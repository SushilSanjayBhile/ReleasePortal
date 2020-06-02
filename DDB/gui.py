from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json, time

from .serializers import TC_INFO_GUI_SERIALIZER, LOG_SERIALIZER, LATEST_TC_STATUS_GUI_SERIALIZER
from .models import TC_INFO_GUI, LOGS, GUI_LATEST_TC_STATUS
from django.db.models import Q

from .forms import GuiInfoForm, LogForm, GuiStatusForm, GuiLatestStatusForm
import datetime

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

    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
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
            print(req)
            data = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            dataSer = TC_INFO_GUI_SERIALIZER(data)

            updatedData = dataSer.data

            for row in req:
                if "CardType" not in row or "TcID" not in row or "BrowserName" not in row:
                    updatedData[row] = req[row]

            updateGuiTcInfo(data, updatedData, Release)
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
def GUI_TC_STATUS_GET_POST_VIEW(request, Release):
    if request.method == "POST":
        request = json.loads(request.body.decode("utf-8"))
        print(request)

        # post request for current release
        #try:
        for req in request:
            print("INSIDE TRY", req['TcID'],req["BrowserName"],req["CardType"])
            data = TC_INFO_GUI.objects.using(Release).get(TcID = req['TcID'], BrowserName = req["BrowserName"], CardType = req["CardType"])
            ser = TC_INFO_GUI_SERIALIZER(data)
            print("INSIDE TRY")

            status = {}

            status["Result"] = req["Result"]
            status["Build"] = req["Build"]
            if "Bugs" in req:
                status["Bugs"] = req["Bugs"]
            status["tcInfoNum"] = ser.data["id"]

            fd = GuiStatusForm(status)
            print("GOIG INTIO VALID")


            if fd.is_valid():
                print("INSIDE VALIDD")
                data = fd.save(commit = False)
                data.save(using = Release)
                
                if "Activity" in req:
                    AD = req['Activity']
                    #GenerateLogData(AD['UserName'], AD['RequestType'], AD['URL'], AD['LogData'], AD['TcID'], card, AD['Release'])
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
        #except:
        #    return HttpResponse("RECORD WITH GIVEN (TCID + Browser + CardType) NOT FOUND")


        return HttpResponse("SUCCESSFULLY UPDATED")

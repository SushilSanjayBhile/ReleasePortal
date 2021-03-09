import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .forms import APPLICABILITY_FORM
from .models import TC_INFO, TC_INFO_GUI, APPLICABILITY
from .serializers import APPLICABILITY_SERIALIZER, TC_INFO_SERIALIZER

from .new import rootRelease

@csrf_exempt
def GetPlatformList(request):
    platformList = []
    data = APPLICABILITY.objects.all()
    serializer = APPLICABILITY_SERIALIZER(data, many = True)

    for data in serializer.data:
        platformList.append(data["Platform"])
    return JsonResponse({"PlatformList": platformList}, status = 200)

@csrf_exempt
def GetPlatformWiseTCList(request, platform):
    data = APPLICABILITY.objects.get(Platform = platform)
    serializer = APPLICABILITY_SERIALIZER(data)
    cliData = json.loads(serializer.data["ApplicableTCs"].replace("\'","\""))
    cliTCIDs = []
    if "CLI" in cliData:
        cliTCIDs = cliData["CLI"]

    infodata = TC_INFO.objects.all().using("master")
    infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
    finalData = []

    atd = {}

    data = APPLICABILITY.objects.all()
    serializer = APPLICABILITY_SERIALIZER(data, many = True)

    for row in serializer.data:
        pf = row["Platform"]
        at = json.loads(row["ApplicableTCs"].replace("'", "\""))
        if "CLI" in at:
            for tc in at["CLI"]:
                if tc not in atd:
                    atd[tc] = []
                atd[tc].append(pf)

    for tc in infoserializer.data:
        for tcid in cliTCIDs:
            if tc["id"] == tcid:
                tc["Platform"] = atd[tc["id"]]
                finalData.append(tc)

    #print(json.dumps(finalData, indent = 2))
    return JsonResponse({'Data': finalData}, status = 200)

@csrf_exempt
def AddPlatform(request, Platform):
    data = APPLICABILITY.objects.filter(Platform = Platform)
    if len(data) == 0:
        finalData = {}
        finalData["Platform"] = Platform
        finalData["ApplicableTCs"] = "{}"

        fd = APPLICABILITY_FORM(finalData)
        if fd.is_valid():
            fd.save()
            return JsonResponse({'Success': "Platform " + Platform + " Successfully added"}, status = 200)
        else:
            print('error', fd.errors)
            return JsonResponse({'Error': fd.errors}, status = 400)
    else:
        return JsonResponse({'Error': "Platform " + Platform + " already exists"}, status = 400)

@csrf_exempt
def Applicable(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))

        for data in req:
            flag = 0
            tcs = data["Tcs"]
            platformWiseDict = {}
            platform = data["Platform"]
            interface = data["Interface"]

            if interface not in platformWiseDict:
                platformWiseDict[interface] = []

            for tc in tcs:
                platformWiseDict[interface].append(tc)
            try:
                flag = 1
                oldData = {}
                od = APPLICABILITY.objects.get(Platform = platform)
                serializer = APPLICABILITY_SERIALIZER(od)

                for i in serializer.data:
                    oldData[i] = serializer.data[i]
                oldData["ApplicableTCs"] = json.loads(oldData["ApplicableTCs"].replace("\'","\""))

                for interface in oldData["ApplicableTCs"]:
                    for tc in oldData["ApplicableTCs"][interface]:
                        if interface not in platformWiseDict:
                            platformWiseDict[interface] = []
                        if tc not in platformWiseDict[interface]:
                            platformWiseDict[interface].append(tc)
            except:
                pass

            finalData = {}
            finalData["Platform"] = platform
            finalData["ApplicableTCs"] = json.dumps(platformWiseDict)

            if flag == 0:
                fd = APPLICABILITY_FORM(finalData)
                if fd.is_valid():
                    print("VALID FORM DATA", platformWiseDict)
                    fd.save()
                else:
                    print('error', fd.errors)
            elif flag == 1:
                updatedData = serializer.data
                updatedData["ApplicableTCs"] = platformWiseDict
                updateApplicableeTCs(updatedData, od)
                
        return HttpResponse("TCs Added successfully")

    if request.method == "GET":
        req = json.loads(request.body.decode("utf-8"))
        #req = request
        platform = req["Platform"]

        data = APPLICABILITY.objetcs.filter(Platform = platform)
        serializer = APPLICABILITY_SERIALIZER(data, many = True)

        return JsonResponse({'Data': serializer.data}, status = 200)

def updateApplicableeTCs(updatedData, data):
    data.ApplicableTCs = updatedData["ApplicableTCs"]

    data.save(using = rootRelease)
    return 1

@csrf_exempt
def Applicable1(request):
    if request.method == "POST":
        req = json.loads(request.body.decode("utf-8"))
        platformWiseDict = {}

        for platform in req:
            print(platform)
            if platform not in platformWiseDict:
                platformWiseDict[platform] = {}

            for interface in req[platform]:
                for tc in req[platform][interface]:
                    if inteface not in platformWiseDict[platform]:
                        platformWiseDict[platform][interface] = []
                    platformWiseDict[platform][interface].append(tc)

            data = APPLICABILITY.objetcs.filter(Platform = platform)
            serializer = APPLICABILITY_SERIALIZER(data, many = True)
            if len(serializer.data) != 0:
                applicabletcs = json.loads(serializer.data)
                print(applicabletcs)
                for interface in applicabletcs["ApplicableTCs"]:
                    for tc in applicabletcs["ApplicableTCs"][interface]:
                        if inteface not in platformWiseDict[platform]:
                            platformWiseDict[platform][interface] = []
                        platformWiseDict[platform][interface].append(tc)

            finalData = {}
            finalData["Platform"] = platform
            finalData["ApplicableTCs"] = json.dumps(platformWiseDict)

            fd = APPLICABILITY_FORM(finalData)
            if fd.is_valid():
                fd.save()
            else:
                print('error', fd.errors)
                
        return HttpResponse("DONE")

    if request.method == "GET":
        req = json.loads(request.body.decode("utf-8"))
        #req = request
        platform = req["Platform"]

        data = APPLICABILITY.objetcs.filter(Platform = platform)
        serializer = APPLICABILITY_SERIALIZER(data, many = True)

        return JsonResponse({'Data': serializer.data}, status = 200)

import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .forms import APPLICABILITY_FORM, TcInfoForm, GuiInfoForm
from .models import TC_INFO, TC_INFO_GUI, APPLICABILITY, RELEASES
from .serializers import APPLICABILITY_SERIALIZER, TC_INFO_SERIALIZER, TC_INFO_GUI_SERIALIZER

from .new import rootRelease
from .tcinfo import duplicate_tcs

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
def AddPlatform1(request, Platform, Release, Interface):
    data = APPLICABILITY.objects.filter(Platform = Platform)
    rel = RELEASES.objects.using('universal').get(ReleaseNumber = Release)
    if Interface == "CLI" and Platform not in rel.PlatformsCli:
        rel.PlatformsCli.append(Platform)
        rel.save()
    if Interface == "GUI" and Platform not in rel.PlatformsGui:
        rel.PlatformsGui.append(Platform)
        rel.save()

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

def update_rootRelease(request):
    data = APPLICABILITY.objects.all()
    serializer = APPLICABILITY_SERIALIZER(data, many = True)

    for i in serializer.data:
        fd = APPLICABILITY_FORM(i)
        if fd.is_valid():
            data = fd.save(commit = False)
            #data.save(using = rootRelease)
    return HttpResponse("DONE")

@csrf_exempt
def Applicable(request, Release):
    if request.method == "POST":
        if Release != rootRelease:
            return HttpResponse("YOU CANNOT ADD PLATFORM IN RELEASE OTHER THAN DCX_DMC_MASTER")

        req = json.loads(request.body.decode("utf-8"))

        tcwiseinterfacecli = {}
        tcwiseinterfacegui = {}

        rel = RELEASES.objects.using('universal').get(ReleaseNumber = Release)
        for data in req:
            tcs = data["Tcs"]
            platform = data["Platform"]
            interface = data["Interface"]

            if interface == "GUI" and platform not in rel.PlatformsGui:
                rel.PlatformsGui.append(platform)
                rel.save()

            if interface == "CLI" and platform not in rel.PlatformsCli:
                rel.PlatformsCli.append(platform)
                rel.save()

            if interface == "GUI":
                for tc in tcs:
                    if tc not in tcwiseinterfacegui:
                        tcwiseinterfacegui[tc] = []
                    tcwiseinterfacegui[tc].append(platform)


            if interface == "CLI":
                for tc in tcs:
                    if tc not in tcwiseinterfacecli:
                        tcwiseinterfacecli[tc] = []
                    tcwiseinterfacecli[tc].append(platform)

        # save list of applicable platforms in tc_info itself code
        for tc in tcwiseinterfacegui:
            singletc = TC_INFO_GUI.objects.using(rootRelease).get(id = tc)
            singletc.Platform = tcwiseinterfacegui[tc]
            singletc.save(using = rootRelease)
            
            d = TC_INFO_GUI.objects.using(rootRelease).values().get(id = tc)
            #print("printing d",d)
            for p in tcwiseinterfacegui[tc]:
                print("d and p", d["TcID"], p)
                try:
                    #check = TC_INFO.objects.using(rootRelease).get(TcID = d["TcID"], CardType = p)
                    check = TC_INFO_GUI.objects.using(rootRelease).get(TcID = d["TcID"],CardType = p)
                    print("Print check after",check)
                except:
                    #check = TC_INFO_GUI.objects.using(rootRelease).get(TcID = d["TcID"],CardType = p)
                    #print("check",check)
                    ser = TC_INFO_GUI_SERIALIZER(d).data
                    ser["CardType"] = p
                    fd = GuiInfoForm(ser)
                    if fd.is_valid():
                        print("valid")
                        data = fd.save(commit = False)
                        data.save(using = rootRelease)
                        if p not in rel.PlatformsGui:
                            rel.PlatformsGui.append(p)
                            rel.save()

                    else:
                        print("INVALID", fd.errors)

        # save list of applicable platforms in tc_info itself code
        for tc in tcwiseinterfacecli:
            singletc = TC_INFO.objects.using(rootRelease).get(id = tc)
            singletc.Platform = tcwiseinterfacecli[tc]
            singletc.save(using = rootRelease)
            #print("printingtcw",tcwiseinterfacecli)
            d = TC_INFO.objects.using(rootRelease).values().get(id = tc)
            #print("printing d",d)
            for p in tcwiseinterfacecli[tc]:
                print("printing dpp", d["TcID"],p)
                try:
                    #check = TC_INFO.objects.using(rootRelease).get(TcID = d["TcID"], CardType = p)
                    check = TC_INFO.objects.using(rootRelease).get(TcID = d["TcID"],CardType = p)
                    #print("Print check after",check)
                except:
                    #check = TC_INFO.objects.using(rootRelease).get(TcID = d["TcID"]).filter(CardType = p)
                    ser = TC_INFO_SERIALIZER(d).data
                    ser["CardType"] = p
                    fd = TcInfoForm(ser)
                    if fd.is_valid():
                        print("valid")
                        data = fd.save(commit = False)
                        data.save(using = rootRelease)
                        if p not in rel.PlatformsCli:
                            rel.PlatformsCli.append(p)
                            rel.save()
                    else:
                        print("INVALID", fd.errors)


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
                    data = fd.save(commit = False)
                    data.save(using = rootRelease)
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

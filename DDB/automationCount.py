
import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt

from .models import TC_INFO, TC_INFO_GUI,APPLICABILITY,DEFAULT_DOMAIN_SUBDOMAIN
from .serializers import  TC_INFO_SERIALIZER,APPLICABILITY_SERIALIZER,TC_INFO_GUI_SERIALIZER,DOMAIN_SUBDOMAIN_SERIALIZER
from .tcinfo import updateData
from .new import rootRelease

@csrf_exempt
def checkTCCount(request, Release):
    print("hello")



@csrf_exempt
def AutomationCount(request, Release):
    
    platformList = []
    release = Release

    infodata = TC_INFO.objects.all().using(rootRelease)
    priority =  infodata.values('Priority').distinct()
    dict1 = {}

    infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
    for tc in infoserializer.data:
        if len(tc["Platform"]) >= 1:
            for platform in tc["Platform"]:
                if platform not in dict1:
                    dict1[platform] = {}

                if "Total_TCs" not in dict1[platform]:
                    dict1[platform]["Total_TCs"] = 1
                else:
                    dict1[platform]["Total_TCs"] += 1

                if "Automated_TCs" not in dict1[platform]:
                    dict1[platform]["Automated_TCs"] = 0
                if tc["TcName"] != "TC NOT AUTOMATED":
                    dict1[platform]["Automated_TCs"] += 1

                prior = tc["Priority"]
                if prior == "P0" or prior == "P1":
                    key_total = prior + "_Total"
                    if key_total not in dict1[platform]:
                        dict1[platform][key_total] = 1
                    else:
                        dict1[platform][key_total] += 1

                    key_automated = prior + "_Automated"
                    if key_automated not in dict1[platform]:
                        dict1[platform][key_automated] = 0
                    if tc["TcName"] != "TC NOT AUTOMATED":
                        dict1[platform][key_automated] += 1

    print(json.dumps(dict1, indent=2))
    return JsonResponse({'Data': 'Success'}, status = 200)


@csrf_exempt
def AutomationCountByDomain(request,Release,Platform):
    
    release = "DCX-DMC-Master"

    if Platform == "DCX" or Platform == "DSS" or Platform == "OCP":
        release = "master"
    elif Platform  == "DMC":
        release = "DMC Master"
    
    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(release).all()
    
    infodata = TC_INFO.objects.all().using(release).filter(~Q(Domain = "GUI"))
    infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
    
    domains = infodata.values('Domain').distinct()
    priority = infodata.values('Priority').distinct()

    dict1 = {}
    for d in domains:
        dom = d["Domain"]
        if dom not in dict1:
            dict1[dom] = {}

    for i in dict1:
        if "Total_TCs" not in dict1[i]:
            dict1[i]["Total_TCs"] = 0
        if "Automated_TCs"  not in dict1[i]:
            dict1[i]["Automated_TCs"] = 0
        if "Automation_Perc" not in dict1[i]:
            dict1[i]["Automation_Perc"] = 0

        for j in priority:
            prior = j["Priority"]
            if prior == "P0" or prior == "P1":
                if prior not in dict1:
                    dict1[i][prior] = {"Total":0,"Automated":0}

    for d in domains:
        dom = d["Domain"]
        print(dom)
        Total_TCs =  TC_INFO.objects.using(release).filter(Domain = dom)
        Total_TCs =  TC_INFO_SERIALIZER(Total_TCs, many = True)

        dict1[dom]["Total_TCs"] = len(Total_TCs.data)
        
        Automated_TCs =  TC_INFO.objects.using(release).filter(Domain = dom).filter(~Q(TcName = 'TC NOT AUTOMATED'))
        Automated_TCs =  TC_INFO_SERIALIZER(Automated_TCs, many = True)
        dict1[dom]["Automated_TCs"] = len(Automated_TCs.data) 
        
        P0_TCs =  TC_INFO.objects.using(release).filter(Domain = dom).filter(Priority = "P0")
        P0_TCs =  TC_INFO_SERIALIZER(P0_TCs, many = True)
        dict1[dom]['P0']["Total"] = len(P0_TCs.data)
        
        P0_TCs_Automated =  TC_INFO.objects.using(release).filter(Domain = dom).filter(Priority = "P0").filter(~Q(TcName = "TC NOT AUTOMATED"))
        P0_TCs_Automated =  TC_INFO_SERIALIZER(P0_TCs_Automated, many = True)
        dict1[dom]['P0']["Automated"] = len(P0_TCs_Automated.data)
        
        P1_TCs =  TC_INFO.objects.using(release).filter(Domain = dom).filter(Priority = "P1")
        P1_TCs =  TC_INFO_SERIALIZER(P1_TCs, many = True)
        dict1[dom]["P1"]["Total"] = len(P1_TCs.data)
        
        P1_TCs_Automated =  TC_INFO.objects.using(release).filter(Domain = dom).filter(Priority = "P1").filter(~Q(TcName = "TC NOT AUTOMATED"))
        P1_TCs_Automated =  TC_INFO_SERIALIZER(P1_TCs_Automated, many = True)
        dict1[dom]["P1"]["Automated"] = len(P1_TCs_Automated.data)

        #print(dict1.keys())



        print("\n")

    print(dict1)



    #for info in infoserializer.data:
    #    print(info)
    return JsonResponse({'Data': dict1}, status = 200)


@csrf_exempt
def ApplicabilityData(request,Release):

    if request.method == "GET":
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
    print(atd)
    infodata = TC_INFO.objects.all().using(Release).filter(~Q(Domain = "GUI"))
    infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
    c = 0
    for info in infoserializer.data:
        c+=1
        print(c)
        updatedData = info
        if info["id"] in atd:
            info['Platform'] = atd[info["id"]]
            data = TC_INFO.objects.using(Release).get(id = info["id"])
            
            updateData(updatedData, data, Release)
            #info["Platform"] = atd[info["id"]]
    return JsonResponse({'Data': 'Success'}, status = 200)





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
                    dict1[platform]["Total_TCs"] = 0
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

    
    dict2 = {}
    tempList = []

    for platform in dict1:
            for data in dict1[platform]:
                print(platform,data,dict1[platform][data])
                dict2["Platform"] = platform
                dict2[data] =  dict1[platform][data]
            tempList.append(dict2)
            dict2 = {}
    print("\n\n",tempList)
    #dict2.push(tempList)

    print(dict2)

    return JsonResponse({'Data': tempList}, status = 200)


@csrf_exempt
def AutomationCountByDomain(request,Release,Platform):
    
    release = "DCX-DMC-Master"

   # if Platform == "DCX" or Platform == "DSS" or Platform == "OCP":
   #     release = "master"
   # elif Platform  == "DMC":
   #     release = "DMC Master"
    
    domains = DEFAULT_DOMAIN_SUBDOMAIN.objects.using(release).all()
    
    infodata = TC_INFO.objects.all().using(release).filter(~Q(Domain = "GUI"))
    infoserializer = TC_INFO_SERIALIZER(infodata, many = True)
    
    domains = infodata.values('Domain').distinct()
    priority = infodata.values('Priority').distinct()

    dict1 = {}

    for tc in infoserializer.data:
        if len(tc["Platform"]) >= 1:
            for platform in tc["Platform"]:
                if platform not in dict1:
                    dict1[platform] = {}
                dom = tc["Domain"]
                if dom not in dict1[platform]:
                    dict1[platform][dom] = {}
                if "Total_TCs" not in dict1[platform][dom]:
                    dict1[platform][dom]["Total_TCs"] = 1
                else:
                    dict1[platform][dom]["Total_TCs"] += 1
                if "Automated_TCs" not in dict1[platform][dom]:
                    dict1[platform][dom]["Automated_TCs"] = 0
                if tc["TcName"] != "TC NOT AUTOMATED":
                    dict1[platform][dom]["Automated_TCs"] += 1
                #print(dict1,"\n\n")

                prior = tc["Priority"]
                if "P0_Total" not in dict1[platform][dom]:
                    dict1[platform][dom]["P0_Total"] = 0
                if "P1_Total" not in dict1[platform][dom]:
                    dict1[platform][dom]["P1_Total"] = 0
                if "P0_Automated" not in dict1[platform][dom]:
                    dict1[platform][dom]["P0_Automated"] = 0
                if "P1_Automated" not in dict1[platform][dom]:
                    dict1[platform][dom]["P1_Automated"] = 0

                if prior == "P0" or prior == "P1":
                    key_total = prior + "_Total"
                     
                    if key_total not in dict1[platform][dom]:
                        dict1[platform][dom][key_total] = 1
                    else:
                        dict1[platform][dom][key_total] += 1

                    key_automated = prior + "_Automated"
                    if key_automated not in dict1[platform][dom]:
                        dict1[platform][dom][key_automated] = 0
                    if tc["TcName"] != "TC NOT AUTOMATED":
                        dict1[platform][dom][key_automated] += 1
    dict2 = {}
    tempList = []

    for platform in dict1:
        for dom in dict1[platform]:
            for data in dict1[platform][dom]:
                dict2["Platform"] = platform
                dict2["Domain"] = dom
                dict2[data] =  dict1[platform][dom][data]
            tempList.append(dict2)
            dict2 = {}
    return JsonResponse({'Data': tempList}, status = 200)


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



@csrf_exempt
def AutomationCountForGUI(request, Release):
    
    platformList = []
    release = Release

    infodata = TC_INFO_GUI.objects.all().using(rootRelease)
    priority =  infodata.values('Priority').distinct()
    dict1 = {}

    infoserializer = TC_INFO_GUI_SERIALIZER(infodata, many = True)
    for tc in infoserializer.data:
        if len(tc["Platform"]) >= 1:
            for platform in tc["Platform"]:
                if platform not in dict1:
                    dict1[platform] = {}

                if "Total_TCs" not in dict1[platform]:
                    dict1[platform]["Total_TCs"] = 0
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

    
    dict2 = {}
    tempList = []

    for platform in dict1:
            for data in dict1[platform]:
                print(platform,data,dict1[platform][data])
                dict2["Platform"] = platform
                dict2[data] =  dict1[platform][data]
            tempList.append(dict2)
            dict2 = {}

    print(dict2)

    return JsonResponse({'Data': tempList}, status = 200)


@csrf_exempt
def AutomationCountByDomainForGUI(request,Release,Platform):
    
    release = "DCX-DMC-Master"

   # if Platform == "DCX" or Platform == "DSS" or Platform == "OCP":
   #     release = "master"
   # elif Platform  == "DMC":
   #     release = "DMC Master"
    
    
    infodata = TC_INFO_GUI.objects.all().using(release).filter(~Q(Domain = "GUI"))
    infoserializer = TC_INFO_GUI_SERIALIZER(infodata, many = True)
    
    priority = infodata.values('Priority').distinct()

    dict1 = {}

    for tc in infoserializer.data:
        print(tc,"GUI")
        if len(tc["Platform"]) >= 1:
            for platform in tc["Platform"]:
                if platform not in dict1:
                    dict1[platform] = {}
                dom = tc["Domain"]
                if dom not in dict1[platform]:
                    dict1[platform][dom] = {}
                if "Total_TCs" not in dict1[platform][dom]:
                    dict1[platform][dom]["Total_TCs"] = 1
                else:
                    dict1[platform][dom]["Total_TCs"] += 1
                if "Automated_TCs" not in dict1[platform][dom]:
                    dict1[platform][dom]["Automated_TCs"] = 0
                if tc["TcName"] != "TC NOT AUTOMATED":
                    dict1[platform][dom]["Automated_TCs"] += 1
                #print(dict1,"\n\n")

                prior = tc["Priority"]
                dict1[platform][dom]["P0_Total"] = 0
                dict1[platform][dom]["P1_Total"] = 0
                dict1[platform][dom]["P0_Automated"] = 0
                dict1[platform][dom]["P1_Automated"] = 0
                if prior == "P0" or prior == "P1":
                    key_total = prior + "_Total"
                     
                    if key_total not in dict1[platform][dom]:
                        dict1[platform][dom][key_total] = 1
                    else:
                        dict1[platform][dom][key_total] += 1

                    key_automated = prior + "_Automated"
                    if key_automated not in dict1[platform][dom]:
                        dict1[platform][dom][key_automated] = 0
                    if tc["TcName"] != "TC NOT AUTOMATED":
                        dict1[platform][dom][key_automated] += 1

                #print(tc)

    print(dict1)
    dict2 = {}
    tempList = []

    for platform in dict1:
        for dom in dict1[platform]:
            for data in dict1[platform][dom]:
                print(platform,dom,data,dict1[platform][dom][data])
                dict2["Platform"] = platform
                dict2["Domain"] = dom
                dict2[data] =  dict1[platform][dom][data]
            tempList.append(dict2)
            dict2 = {}
    print("\n\n",tempList)
    print(dict2)

    #for info in infoserializer.data:
    #    print(info)
    return JsonResponse({'Data': tempList}, status = 200)




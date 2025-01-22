
import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt

from .models import TC_INFO, TC_INFO_GUI
from .serializers import  TC_INFO_SERIALIZER, TC_INFO_GUI_SERIALIZER

rootRelease = "DCX-DMC-Master"
@csrf_exempt
def MergingCardTypes(request):
    
    bos_cli_data = TC_INFO.objects.all().using(rootRelease).filter(CardType = 'BOS')
    bos_cli_serializer = TC_INFO_SERIALIZER(bos_cli_data,many = True)
    print("Before BOS Count",len(bos_cli_serializer.data))

    nynj_cli_data = TC_INFO.objects.all().using(rootRelease).filter(CardType = 'NYNJ')
    nynj_cli_serializer = TC_INFO_SERIALIZER(nynj_cli_data,many = True)
    #save_data(nynj_cli_serializer)
    print("NYNJ Count",len(nynj_cli_serializer.data))
    
    comm_cli_data = TC_INFO.objects.all().using(rootRelease).filter(CardType = 'COMMON')
    comm_cli_serializer = TC_INFO_SERIALIZER(comm_cli_data,many = True)
    save_data(comm_cli_serializer)
    print("COMMON Count",len(comm_cli_serializer.data))
    
    soft_cli_data = TC_INFO.objects.all().using(rootRelease).filter(CardType = 'SOFTWARE')
    soft_cli_serializer = TC_INFO_SERIALIZER(soft_cli_data,many = True)
    save_data(soft_cli_serializer)
    print("COMMON Count",len(soft_cli_serializer.data))


    return JsonResponse({'Data': "Success"}, status = 200)


def save_data(cli_serializer):
    for tc in cli_serializer.data:
        data =  TC_INFO.objects.all().using(rootRelease).filter(TcID = tc['TcID'])
        cli_serializer1 = TC_INFO_SERIALIZER(data,many = True)
        for tc1 in cli_serializer1.data:
            try:
                data =  TC_INFO.objects.all().using(rootRelease).get(TcID = tc['TcID'], CardType = "BOS")
            except:
                data =  TC_INFO.objects.all().using(rootRelease).get(TcID = tc['TcID'], CardType = tc['CardType'])
                data.CardType = "BOS"
                data.save(using = rootRelease)
                #print("Saving Data",data)


    bos_cli_data = TC_INFO.objects.all().using(rootRelease).filter(CardType = 'BOS')
    bos_cli_serializer = TC_INFO_SERIALIZER(bos_cli_data,many = True)
    print("after BOS Count",len(bos_cli_serializer.data))

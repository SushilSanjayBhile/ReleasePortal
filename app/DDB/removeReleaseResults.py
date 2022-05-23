# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse

# imports from django app
from .models import TC_STATUS, GUI_TC_STATUS

def removeOldReleaseData(request,Release):
    print(Release)

    cli_data = TC_STATUS.objects.using(Release).all()
    print(len(cli_data))
    gui_data = GUI_TC_STATUS.objects.using(Release).all()
    print(len(gui_data))

    #TC_STATUS.objects.using(Release).all().delete()
    #GUI_TC_STATUS.objects.using(Release).all().delete()
    
    cli_data = TC_STATUS.objects.using(Release).all()
    print(len(cli_data))
    gui_data = GUI_TC_STATUS.objects.using(Release).all()
    print(len(gui_data))

    return HttpResponse("Removed all records from CLI and GUI")


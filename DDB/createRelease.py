# Django packages
from django.db.models import Q
from django.shortcuts import render
# # from django.http import HttpResponse, JsonResponse
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# imports from django app
from constraints import *
from .models import TC_INFO,TC_INFO_GUI,


from DDB.serializers import TC_INFO_SERIALIZER,TC_INFO_GUI_SERIALIZER


def mergeDB(request,Release):

    

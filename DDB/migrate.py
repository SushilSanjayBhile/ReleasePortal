from .models import RELEASES
from .serializers import RELEASE_SERIALIZER
import os

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def Migrate(request):
    releases = RELEASES.objects.all()
    releaseSerializer = RELEASE_SERIALIZER(releases, many = True)

    for rel in releaseSerializer.data:
        print(rel["ReleaseNumber"])
    return HttpResponse("Uncomment the migration code")

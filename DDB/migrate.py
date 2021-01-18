from .models import RELEASES
from .serializers import RELEASE_SERIALIZER
import os
import time
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from dp import settings

@csrf_exempt
def Migrate(request, typ):
    print(typ)
    if typ == "":
        return HttpResponse("Please enter type of migration fake/real")
    cmd = "python3 manage.py makemigrations"
    print("This is migration type:- ", typ)
    os.system(cmd)
    time.sleep(10)
    flag = 0

    for db in settings.DATABASES:
       # if typ == "fake":
       #     cmd = "python3 manage.py migrate --database='"+ db +"' --fake" 
       #     print("\n",cmd)
       #     os.system(cmd)
       #     flag = 1
        if typ == "real":
            cmd = "python3 manage.py migrate --database='"+ db +"'" 
            print("\n",cmd)
            os.system(cmd)
            flag = 1

        time.sleep(2)
    if flag == 1:
        os.system("git add /app/DDB/migrations/; git status; git commit -m \"Added Migrations Files\"; git push;")
    return HttpResponse("Uncomment the migration code")

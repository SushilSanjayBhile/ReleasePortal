import psycopg2, json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from constraints import *
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT # <-- ADD THIS LINE
from psycopg2 import sql
import os, requests
from .new import rootRelease
from .models import TC_INFO, TC_INFO_GUI
from .serializers import TC_INFO_SERIALIZER, TC_INFO_GUI_SERIALIZER
from .forms import TcInfoForm, GuiInfoForm

def createReleaseDB(platforms, release):
    parentRelease = rootRelease
    con = psycopg2.connect(dbname='postgres',
        user=userName, host=hostName,
        password=passwd, port=portNumber)

    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cur = con.cursor()

    # verifying for database does not exist
    cur.execute(sql.SQL("select datname from pg_database;"))
    rows = cur.fetchall()
    for row in rows:
        if release in row:
            return 0

    # creating and granting privileges to database
    cur.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(release))
        )

    cur.execute(sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} to {}").format(
            sql.Identifier(release), sql.Identifier(userName))
        )

    dump_command = "sudo -u postgres pg_dump -h localhost -U " + userName + " -Fc \"" + parentRelease + "\" > /data/testing1.sql"
    restore_command = "sudo -u postgres pg_restore -h localhost -d " + release + " -U " + userName + " /data/testing1.sql"

    fp = open('createdb.sh', 'w')
    fp.write(dump_command)
    fp.write("\n")
    fp.write(restore_command)
    fp.write("\n")
    fp.close()

    with open('createdb.sh', 'rb') as f:
        r = requests.post("http://" + hostName + ":5000/createdb", files={'createdb.sh': f})


    databaseExistsString = "\'NAME\': \'" + release + "\',"
    with open('dp/settings.py', 'r') as fp:
        f = fp.readlines()
        for line in f:
            if databaseExistsString in line:
                return 1

    lineNo = 0
    with open('dp/settings.py', 'r') as fp:
        f = fp.readlines()
        for line in f:
            lineNo += 1
            if "DATABASES = {" in line:
                
                string = """    '{release}': {{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '{release}',
        'USER': userName,
        'PASSWORD': passwd,
        'HOST': hostName,
        'PORT': portNumber,
        }},
"""
                finalString = string.format(release=release, userName=userName, passwd=passwd, hostName=hostName, portNumber=portNumber)
                f.insert(lineNo, finalString)
                contents = "".join(f)
    fp.close()

    newfp = open("dp/newsettings.py", "w+")
    newfp.write(contents)
    newfp.close()

    os.system("cp dp/settings.py dp/oldsettings.py")
    os.system("mv dp/newsettings.py dp/settings.py")

    return 1

@csrf_exempt
def cleanupdb1(request):
    req = json.loads(request.body.decode("utf-8"))

    platformsCli = req["PlatformsCli"]
    platformsGui = req["PlatformsGui"]
    release = req["ReleaseNumber"]
    print(req)

    # This statement cleans new created database's CLI info table, comment when not needed
    TC_INFO.objects.using(release).all().delete()

    # This statement cleans new created database's GUI info table, comment when not needed
    TC_INFO_GUI.objects.using(release).all().delete()

    # Below code-patch fetches CLI TC, which are only applicable for given platforms
    cliList = []
    cliTcInfo = TC_INFO.objects.using(rootRelease).all()
    for platform in platformsCli:
        platform = [platform]
        clitcs = cliTcInfo.filter(Platform__contains = platform)
        ser = TC_INFO_SERIALIZER(clitcs, many = True).data
        for tc in ser:
            if tc["id"] not in cliList:
                cliList.append(tc["id"])
                fd = TcInfoForm(tc)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = release)

    # Below code-patch fetches GUI TC, which are only applicable for given platforms
    guiList = []
    guiTcInfo = TC_INFO_GUI.objects.using(rootRelease).all()
    for platform in platformsGui:
        platform = [platform]
        guitcs = guiTcInfo.filter(Platform__contains = platform)
        ser = TC_INFO_GUI_SERIALIZER(guitcs, many = True).data
        for tc in ser:
            if tc["id"] not in guiList:
                guiList.append(tc["id"])
                fd = GuiInfoForm(tc)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = release)
    return HttpResponse("Updated Data", 200)
@csrf_exempt
def cleanupdb(request):
    req = json.loads(request.body.decode("utf-8"))

    platformsCli = req["PlatformsCli"]
    platformsGui = req["PlatformsGui"]
    release = req["ReleaseNumber"]
    print(req)

    # This statement cleans new created database's CLI info table, comment when not needed
    TC_INFO.objects.using(release).all().delete()

    # This statement cleans new created database's GUI info table, comment when not needed
    TC_INFO_GUI.objects.using(release).all().delete()

    # Below code-patch fetches CLI TC, which are only applicable for given platforms
    cliList = []
    cliTcInfo = TC_INFO.objects.using(rootRelease).all()
    for platform in platformsCli:
        clitcs = cliTcInfo.filter(CardType = platform)
        ser = TC_INFO_SERIALIZER(clitcs, many = True).data
        for tc in ser:
            if tc["id"] not in cliList:
                cliList.append(tc["id"])
                fd = TcInfoForm(tc)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = release)

    # Below code-patch fetches GUI TC, which are only applicable for given platforms
    guiList = []
    guiTcInfo = TC_INFO_GUI.objects.using(rootRelease).all()
    for platform in platformsGui:
        guitcs = guiTcInfo.filter(CardType = platform)
        ser = TC_INFO_GUI_SERIALIZER(guitcs, many = True).data
        for tc in ser:
            if tc["id"] not in guiList:
                guiList.append(tc["id"])
                fd = GuiInfoForm(tc)

                if fd.is_valid():
                    data = fd.save(commit = False)
                    data.save(using = release)
    return HttpResponse("Updated Data", 200)

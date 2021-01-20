import psycopg2
from constraints import *
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT # <-- ADD THIS LINE
from psycopg2 import sql
import os, requests

def createReleaseDB(release, parentRelease):
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

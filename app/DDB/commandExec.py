import json, os, datetime,subprocess
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import tempfile
import shutil
from threading import Thread
FILE_UPLOAD_DIR = '/home/'
@csrf_exempt
def update_data(request, release, platform, fileName, email):
    if request.method == "POST":
        try:
            filepath = ''
            f = request.FILES['file']
            filepath = handle_uploaded_file(f)

            unzip = subprocess.Popen(["unzip", "-d", FILE_UPLOAD_DIR, filepath],stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            out, err = unzip.communicate()
            unzip.wait()
            com = subprocess.Popen(["/release-portal/app/finalapp/non_jenkins_user_update_sheets.sh", "-f", FILE_UPLOAD_DIR + fileName, "-d", release, "-s", platform, "-e", email],stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            output, errors = com.communicate()
            com.wait()
            return JsonResponse({"output":json.dumps(output.decode("utf-8")),"console":json.dumps(errors.decode("utf-8")),"returncode":com.returncode}, status = 200)
        except:
            return JsonResponse({"output":"Something bad happened"}, status = 200)
        finally:
            Thread(target=clean_files, args=(filepath,)).start()
            Thread(target=clean_files, args=(FILE_UPLOAD_DIR + fileName,)).start()

def clean_files(filepath):
    os.remove(filepath) if os.path.exists(filepath) else False

def handle_uploaded_file(source):
    fd, filepath = tempfile.mkstemp(prefix=source.name, dir=FILE_UPLOAD_DIR)
    with open(filepath, 'wb') as dest:
        shutil.copyfileobj(source, dest)
    return filepath

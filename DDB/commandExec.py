import json, os, datetime,subprocess
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import tempfile
import shutil
FILE_UPLOAD_DIR = '/home/'
@csrf_exempt
def update_data(request, release, platform):
    if request.method == "POST":
        try:
            f = request.FILES['file']
            filepath = handle_uploaded_file(f)

            com = subprocess.Popen(["/portal/app/finalapp/non_jenkins_user_update_sheets.sh", "-f", filepath, "-d", release, "-s", platform],stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            output, errors = com.communicate()
            com.wait()
            print(filepath)
            os.remove(filepath)
            
            return JsonResponse({"output":json.dumps(output.decode("utf-8")),"console":json.dumps(errors.decode("utf-8")),"returncode":com.returncode}, status = 200)
        except:
            return JsonResponse({"output":"Something bad happened"}, status = 200)

def handle_uploaded_file(source):
    fd, filepath = tempfile.mkstemp(prefix=source.name, dir=FILE_UPLOAD_DIR)
    with open(filepath, 'wb') as dest:
        shutil.copyfileobj(source, dest)
    return filepath

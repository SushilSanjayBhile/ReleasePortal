from authentication.authenticate import get_credentials
from apiclient.discovery import build
from googleapiclient.discovery import build
from httplib2 import Http
import gspread


creds = get_credentials()

# Return drive service object
def get_drive_service_object():
    return build('drive', 'v3', http=creds.authorize(Http()))


# Return gspread service object
def get_gspread_service_object():
    return gspread.authorize(creds)

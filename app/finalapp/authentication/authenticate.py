from oauth2client import file, client, tools
from httplib2 import Http
from utils.conversions import utc_to_local_datetime, get_aware_current_datetime
from utils.constants import SCOPES, storage_file_path, secrets_file_path


#Avoid 'in process' failure exception : "token invalid" / "token expired"
def is_complete_updation_feasible(utc_time) :
    expiry_datetime  = utc_to_local_datetime(utc_time)
    current_datetime = get_aware_current_datetime()
    
    if expiry_datetime > current_datetime :
        diff = expiry_datetime - current_datetime
        mins, secs = divmod(diff.days * 86400 + diff.seconds, 60)
        if mins > 10 :      
            return True
        
    return False        #Token expires in less than 10 mins


#Get credentials from config file
def get_credentials():
    store = file.Storage(storage_file_path)
    creds = store.get()
    flag = False

    if not creds or creds.invalid : # or not flag :
        flow  = client.flow_from_clientsecrets( secrets_file_path, SCOPES)
        creds = client.OAuth2Credentials
        creds = tools.run_flow(flow, store)

    
    else :
        flag = is_complete_updation_feasible(creds.token_expiry)
        if not flag :
            creds.refresh(Http())


    return creds
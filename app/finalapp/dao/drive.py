from .config import get_drive_service_object

SERVICE = get_drive_service_object()

#Return list of directory metadata in drive
def get_drive_directory_metadata(directory_id):
    payload = SERVICE.files().list ( 
                    q = " mimeType = 'application/vnd.google-apps.folder' and \
                          trashed = false and \
                          %r in parents " % directory_id,  # can add sharedWithMe = true
                    fields = 'files(id, name)').execute()
    
    return payload.get('files', [])


#Return list of spreadsheets in directory
def get_spreadsheets_by_directory_id( directory_id) :
    payload = SERVICE.files().list ( 
                    q = " mimeType = 'application/vnd.google-apps.spreadsheet' and \
                          trashed  = false and \
                          %r in parents " % directory_id,
                    fields = 'files( id, name)').execute()

    return payload.get('files', [])

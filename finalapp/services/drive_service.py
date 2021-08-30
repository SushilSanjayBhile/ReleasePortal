from dao.drive import get_drive_directory_metadata, get_spreadsheets_by_directory_id
from logging import getLogger
from utils import constants


logger = getLogger(__name__)
logger.setLevel(constants.logging.DEBUG)
logger.addHandler(constants.file_handler)
logger.addHandler(constants.console_handler)


'''
# Display Directory List to user & retrun directory_id by user choice
def get_directory_choice_by_user_input(directories):
    i = 1

    print "\nDirectories in Drive.:"
    for directory in directories :
        print i, directory.get('name')
        i += 1

    user_input = input("\nEnter Input.:\t")
    directory_id = str(directories[user_input - 1]['id'])
    return directory_id
'''

# Return directory_id from directories matching drive_sub_dir_name
def get_directory_id_by_name(directories, drive_sub_dir_name) :
    for directory in directories :
        if directory.get('name') == drive_sub_dir_name :
            directory_id = str(directory.get('id'))
            return directory_id

    return None


# Return List of Spreadsheets in a directory choosen by user
def get_spreadsheets(drive_sub_dir_name) :
    directories = get_drive_directory_metadata(constants.releases_dir_id)
    directory_id = get_directory_id_by_name(directories, drive_sub_dir_name)    
    if not directory_id :
        logger.error("\nDirectory {} NOT FOUND\n".format(drive_sub_dir_name))
        return []

    if constants.drive_sub_directory != "#!" :
        sub_directories = get_drive_directory_metadata(directory_id)
        directory_id = get_directory_id_by_name(sub_directories, constants.drive_sub_directory)

    spreadsheet_list = get_spreadsheets_by_directory_id( directory_id )

    return spreadsheet_list

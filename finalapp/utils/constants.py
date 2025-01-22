from os import path
from json import load
import logging
from time import strftime


# Config_files path
constants_file_path = path.abspath(path.dirname(__file__))
logging_file_path = path.join( constants_file_path,
                            '../../../log/')
config_file_path = path.join( constants_file_path,
                            '../authentication/config_files/config.json')
storage_file_path = path.join( constants_file_path,
                            '../authentication/config_files/storage.json')
secrets_file_path = path.join( constants_file_path,
                            '../authentication/config_files/client_secrets.json')

storage_file_path = path.abspath(path.realpath(storage_file_path))
secrets_file_path = path.abspath(path.realpath(secrets_file_path))

# touch storage.json
if not path.exists(storage_file_path) :
    open(storage_file_path, 'w').close()


# Fetch filename, drive_dir_name, command from config file
with open(config_file_path, 'r') as file_obj :
    data = load(file_obj)
    filename = data['log_file_path']
    drive_directory = data['drive_dir_name']
    drive_sub_directory = data['drive_sub_dir_name']
    show_flag = data['show_flag']
    email = data['email']

# Logging Configuration
logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.ERROR)
logging.getLogger('googleapiclient.discovery').setLevel(logging.ERROR)

base_file_name = path.basename(filename)
base_file_name = strftime("%b_%d_%Y_%H:%M:%S_") + base_file_name
logging_file_path += base_file_name

# Set different formats for logging output
console_logging_format = '%(levelname)s %(name)s : %(message)s'
file_logging_format = '%(asctime)s %(levelname)s %(name)s : %(message)s'

# Create a file handler for logging to a file
file_handler = logging.FileHandler(logging_file_path)
file_handler.setLevel(logging.DEBUG)            # Set the logging level for log file
file_formatter = logging.Formatter(                  # Create a logging format
                        file_logging_format,
                        datefmt='%I:%M:%S %p')  #%a, %d %b %Y %I:%M:%S %p
file_handler.setFormatter(file_formatter)


# Create a console handler for logging to the console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter(console_logging_format)
console_handler.setFormatter(console_formatter)


# Directory ID of Releases dir
releases_dir_id = '0B-31_xdQ4lnzY1B5eWRhVElOdHc'

# google api scopes
SCOPES = [  'https://www.googleapis.com/auth/drive.metadata.readonly', 
            'https://www.googleapis.com/auth/spreadsheets' ]


# map spreadsheet_name alias used in TC IDs to actual spreadsheet_names
sheet_alias = {'A': 'Additional tests.xlsx',
               'AT': 'Additional tests.xlsx',
               'I': 'Interface testcases.xlsx',
               'M': 'Management Testcases.xlsx',
               'DM': 'Management Testcases.xlsx',
               'QM': 'Management Testcases.xlsx',
               'MZ': 'Multizone Cluster.xlsx',
               'N': 'Network TestCases.xlsx',
               'QOS': 'QOS Testcases.xlsx',
               'Rbac': 'Rbac.xlsx',
               'SM': 'Storage Mirrored - Tests.xlsx',
               'SMP': 'Storage Mirrored - Tests.xlsx',
	       'PVC': 'Storage PVC.xlsx',
               'RS': 'Storage Remote - Tests.xlsx',
               'RSP': 'Storage Remote - Tests.xlsx',
               'SS': 'Storage Snapshot - Tests.xlsx',
               'S': 'Storage - Tests.xlsx',
               'SP': 'Storage - Tests.xlsx',
               'RQ': 'Storage - Tests.xlsx',
               'Eight': 'Storage tests with 8TB drives',
               'U': 'Upgrade tests.xlsx',
               'UI': 'GUI.xlsx',
               'NO TC ID': 'KVM.xlsx',
               'NO TC ID': 'Helm TestCases.xlsx',
               'NO TC ID': 'Storage - Driveset TCs.xlsx',
               'NO TC ID': 'Rbac Role check table.xlsx',
               'NO TC ID': 'NVME Compliance.xlsx'
              }

# grep words prefixed and suffixed with whitespace
grep_words = [' Sanity ', ' Daily ', ' Weekly ', 'SKIPPING']


# TC id status
default_status = ''
pass_status = 'Pass'
fail_status = 'Fail'


# row_count
row_count = 500         # Actual count 1000

# To avoid RESOURCE_EXHAUSTED exception
read_request_counter = 0
loop_start_time = 0


# Return spreadsheet api update cell format
def get_update_cell_format() :
    return {
        'updateCells': {
            'rows': [
                {
                    'values': [
                        {
                            'userEnteredValue': {
                                'stringValue': ''
                            }
                        }
                    ]
                }
            ],

            'fields': 'userEnteredValue',
            'range': {
                "sheetId": 0,
                "startRowIndex": 0,
                "endRowIndex": 0,
                "startColumnIndex": 0,
                "endColumnIndex": 0
            }
        }
    }

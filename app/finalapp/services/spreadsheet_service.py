from time import time
from logging import getLogger
from dao.spreadsheet import ( get_spreadsheet_by_id,
                            get_all_tc_ids_from_worksheet,
                            batch_update_worksheet )

from utils.spreadsheet_utils import ( get_intersecting_tc_ids, 
                                      create_tc_id_dict_from_cell_list,
                                      avoid_resource_exhaustion )

from utils import constants


logger = getLogger(__name__)
logger.setLevel(constants.logging.DEBUG)
logger.addHandler(constants.file_handler)
logger.addHandler(constants.console_handler)



# Return spreadsheet id from name
def get_spreadsheet_id_by_name( spreadsheet_name, spreadsheet_list) :
    for sheet in spreadsheet_list :
        if sheet['name'] == spreadsheet_name :
            return sheet['id']

# data_dict = { 'SP': [
#                      { 'Basic': ['SP_Basic-1.0']}
#                     ]
#             }

# spreadsheet_list = [ {
#                        u'id': u'1Kl0x3n4kQeTfsiiNpatMrMWLKkp-hjNJKdPjq36b1F8',
#                        u'name': u'GUI.xlsx'
#                      }
#                    ]

# Update the IDs in spreadsheets with given status
def update_spreadsheets(data_dict, spreadsheet_list, status, build_name) :
    for name in data_dict :
        updated_tc_ids = []
        try :
            spreadsheet_name = constants.sheet_alias[name]

        except :
            logger.error("\nKey Error {}\n".format(name))
            logger.debug("{}".format(data_dict[name]))
            continue

        # Spreadsheet not in spreadsheet list
        if spreadsheet_name not in map(lambda  x: x['name'], spreadsheet_list):
            logger.error("\nSpreadsheet - {} NOT FOUND\n".format(spreadsheet_name))
            continue

        # Connection to spreadsheet
        spreadsheet_id = get_spreadsheet_id_by_name( spreadsheet_name, spreadsheet_list)
        spreadsheet = get_spreadsheet_by_id( spreadsheet_id )
        logger.debug("Updating Spreadsheet - {}".format(spreadsheet_name))
        
        update_list = data_dict[name]                

        # List of Sheets in worksheet
        worksheet_list = spreadsheet.worksheets()

        for worksheet in worksheet_list:
            logger.debug("\t__Worksheet : {}".format(worksheet.title))

            # Get Fields (First Row)
            field_list = worksheet.row_values(1)

            # Summary Worksheet
            if not "TC ID" in field_list:
                continue

            # Fetch column containing TC IDs
            TC_ID_cell_list = get_all_tc_ids_from_worksheet( worksheet, field_list )
            TC_ID_dict = create_tc_id_dict_from_cell_list( TC_ID_cell_list )
            found_tc_id_cells_list = get_intersecting_tc_ids(update_list, TC_ID_dict)

            # No tc id found to be updated
            if not found_tc_id_cells_list :
                continue

            display_list = map(lambda x: str(x.value), found_tc_id_cells_list)
            logger.debug("\t\tUpdating\t{}".format(display_list))
            logger.debug("\t\tStatus\t:\t{}".format(status))
            logger.debug("\t\tBuild\t:\t{}".format(build_name))

            try :
                result_col = (field_list.index("Results"))
                build_col = (field_list.index("Build No"))
            # Fields doesn't match in worksheet
            except :
                logger.error("\nColumns 'Results' and/or 'Build No' NOT found in Worksheet {}\n".format(worksheet.title))
                continue

            updated_tc_ids += map(lambda  x: x.value, found_tc_id_cells_list)
            worksheet_id = worksheet.id
            batch_update_worksheet( spreadsheet, worksheet_id,
                                    found_tc_id_cells_list,
                                    result_col, status,
                                    build_col, build_name)
        
	# IDs not updated
        temp = list(set(update_list) - set(updated_tc_ids))
        if temp:
            logger.error("\nID NOT FOUND : {}\n".format(temp))


        constants.read_request_counter += (len(worksheet_list) * 2) + 1
        if constants.read_request_counter > 80 :
             avoid_resource_exhaustion()


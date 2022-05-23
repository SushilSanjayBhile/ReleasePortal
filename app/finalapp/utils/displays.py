from utils.constants import pass_status, fail_status


#Display Status List
def display_id_list(id_list, status):
    if status == pass_status:
        print '\nPASS IDs.:'
        print id_list

    elif status == fail_status:
        print '\nFAIL IDs.:'
        print id_list


#Display Spreadsheet Names
def display_spreadsheet_names(spreadsheet_list) :
    print "\n\nSpreadsheets.:"
    for sheet in spreadsheet_list :
        print sheet['name']
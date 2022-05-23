""" update_coverage_sheet.py : Updates the coverage sheet post updation of test case results in drive."""
__author__ = "Mahesh Babu V."

import time

# Return spreadsheet id from name
def get_spreadsheet_id_by_name( spreadsheet_name, spreadsheet_list) :
    for sheet in spreadsheet_list :
        if sheet['name'] == spreadsheet_name :
            return sheet['id']

def update(client_gspread, spreadsheet_list):
    spreadsheet_id = get_spreadsheet_id_by_name("Coverage.xlsx", spreadsheet_list)
    summary_sheet = client_gspread.open_by_key(spreadsheet_id).sheet1
    

    for i in spreadsheet_list:

            spreadsheet_name = i['id']
            # print(spreadsheet_name)
            sh = client_gspread.open_by_key(spreadsheet_name)
            try:
                sum_sheet = sh.worksheet('Summary')
                total_val = sum_sheet.find("Total")
                try :
                    coverage_val = summary_sheet.find(i['name'])
                    summary_sheet.insert_row(sum_sheet.row_values(total_val.row, value_render_option='UNFORMATTED_VALUE'),
                                                  value_input_option='RAW', index=coverage_val.row)
                    summary_sheet.update_cell(coverage_val.row, 1, i['name'])
                    summary_sheet.delete_row(coverage_val.row + 1)
                except:
                    summary_sheet.insert_row(sum_sheet.row_values(total_val.row, value_render_option='UNFORMATTED_VALUE'),
                                              value_input_option='RAW', index=3)
                    summary_sheet.update_cell(3, 1, i['name'])
            except:
                continue

    # Removing duplicates in final coverage sheet.
    time.sleep(10)
    for i in spreadsheet_list:
        cell_val = summary_sheet.findall(i['name'])
        if len(cell_val) > 1:
            summary_sheet.delete_row(cell_val[1].row)

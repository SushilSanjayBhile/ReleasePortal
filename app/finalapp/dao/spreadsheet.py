from .config import get_gspread_service_object
from utils.constants import get_update_cell_format, row_count

client = get_gspread_service_object()


# Get spreadsheet using gspread service object
def get_spreadsheet_by_id( spreadsheet_id ):
    spreadsheet = client.open_by_key(spreadsheet_id )
    
    return spreadsheet


# Fetch column from sheeet containing TC IDs
def get_all_tc_ids_from_worksheet( sheet, field_list):
    f_row = 2
    f_col = l_col = (field_list.index("TC ID")) + 1
    #row_count = len(sh.col_values(f_col))           #Read Overhead
    l_row = row_count
    
    return sheet.range(f_row, f_col, l_row, l_col)


# Return Batch Update request format
def create_format(worksheet_id, row, col, value):
    format = get_update_cell_format()    
    rows_list = format['updateCells']['rows']
    value_list = rows_list[0]['values']
    user_entered_value = value_list[0]['userEnteredValue']
    user_entered_value['stringValue'] = value

    range = format['updateCells']['range']
    range['sheetId'] = worksheet_id
    range['startRowIndex'] = row
    range['endRowIndex'] =  row + 1
    range['startColumnIndex'] = col
    range['endColumnIndex'] = col + 1

    return format


# Batch Update Cells in a worksheet
def batch_update_worksheet( spreadsheet,
                            worksheet_id,
                            cell_list,
                            result_col,
                            status,
                            build_col,
                            build_name) :
    request_list = []
    for cell in cell_list :
        row = cell.row - 1

        result_format = create_format(worksheet_id, row, result_col, status)
        build_format = create_format(worksheet_id, row, build_col, build_name)

        request_list.append(result_format)
        request_list.append(build_format)

    body = {
        'requests' : request_list,
        'responseIncludeGridData': True
    }

    data = spreadsheet.batch_update(body)

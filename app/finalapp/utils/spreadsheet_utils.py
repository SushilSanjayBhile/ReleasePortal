from time import time, sleep
from utils import constants
from logging import getLogger, DEBUG



logger = getLogger(__name__)
logger.setLevel(DEBUG)
logger.addHandler(constants.console_handler)
logger.addHandler(constants.file_handler)


# Return dict with tc_id as key and position as value from tc_id_cell_list
def create_tc_id_dict_from_cell_list( TC_ID_cell_list) :
    TC_ID_dict = {}
    for id_cell in TC_ID_cell_list :
        id = id_cell.value
        
        if not id :         #Empty Cell
            continue
            
        TC_ID_dict[id] = {"position" : id_cell}
        # meta_data[string] = { "position" : id_cell,
        #                       "worksheet" : sheet }
    
    return TC_ID_dict
    

# Return cells which are in update list and worsheet column (TC_ID_dict)
def get_intersecting_tc_ids(update_list, TC_ID_dict) :
    cell_list = []
    for id in update_list :
        if id in TC_ID_dict :
            cell = TC_ID_dict[id]["position"]
            cell_list.append(cell)

    return cell_list


# sys.sleep() if read_request_counter > 80
def avoid_resource_exhaustion() :
    time_taken = (time() - constants.loop_start_time)
    sleep_time = 100 - time_taken
    if sleep_time > 0 :
        logger.debug(" \tTime Taken.:\t{}\tSleep Time.:\t{}".format(time_taken, sleep_time))
        sleep(sleep_time)
    constants.read_request_counter = 0
    constants.loop_start_time = time()

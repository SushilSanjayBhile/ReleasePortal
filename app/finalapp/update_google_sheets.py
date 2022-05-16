#!/usr/bin/env python3

__author__ = "Nikhil"


# from argparse import ArgumentParser
from time import time
from logging import getLogger
from services.parser_service import parse_log_file
from services.drive_service import get_spreadsheets
from services.spreadsheet_service import update_spreadsheets
from utils import constants
from dao.spreadsheet import client
from certifi import where
from urllib3 import PoolManager
import urllib3.contrib.pyopenssl
import update_coverage_sheet


# Handle url warnings
urllib3.contrib.pyopenssl.inject_into_urllib3()
http = PoolManager(
	cert_reqs='CERT_REQUIRED',
        ca_certs=where())


# Set Log variable
logger = getLogger(__name__)
logger.setLevel(constants.logging.DEBUG)
logger.addHandler(constants.file_handler)
logger.addHandler(constants.console_handler)

'''
# Get filename from command line argument
# Does NOT work as google api client uses command line args to authenticate
def get_filename_from_cli() :
    parent = ArgumentParser(add_help=True)
    group = parent.add_argument_group('standard')
    parent.add_argument('file', help="Enter log file name to run the script")

    return parent.parse_args().file

'''

if __name__ == "__main__" :
    start_time = time()
    # filename = get_filename_from_cli()
    # Does NOT work coz. google api uses argparse
    
    filename = constants.filename
    pass_dict, fail_dict, drive_dir_name, build_name = parse_log_file(filename)

    #if not build_name or not drive_dir_name :
    #    logger.error("\nrpm NOT FOUND in log file\n")

    #else :
    #    spreadsheet_list = get_spreadsheets(drive_dir_name)
    #    if spreadsheet_list :
    #	    display_spreadsheet_list = map(lambda  x: str(x['name']), spreadsheet_list)
    #	    logger.debug("Spreadsheets :\n{}\n".format(display_spreadsheet_list))

    #	    constants.loop_start_time = time()
    #	    constants.read_request_counter = 0
    #

    #        logger.info("Updating individual sheets on the drive. Please wait ...")
    #	    # Update Pass IDs
    #	    update_spreadsheets( pass_dict,
    #                            spreadsheet_list,
    #                            constants.pass_status,
    #                            build_name )

    #        # Update Fail IDs
    #	    update_spreadsheets( fail_dict,
    #                            spreadsheet_list,
    #                            constants.fail_status,
    #                            build_name )

    #        logger.debug("Updating Coverage Sheet")
    #        update_coverage_sheet.update(client, spreadsheet_list)
    #
    #logger.info("Completed updating individual sheets on the drive.")
    #logger.info("Total time taken :\t{}s".format(time() - start_time))
    #logger.info("Log available at :\t{}".format(constants.logging_file_path))


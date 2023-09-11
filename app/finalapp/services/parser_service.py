import requests, json, re
from logging import getLogger
from dao.parse import get_greped_lines_and_directory_build_name
from utils.constants import (
			grep_words, pass_status, fail_status, logging, file_handler,
			show_flag, console_handler, drive_directory, drive_sub_directory, email
			)

from utils.parse_utils import (
                        convert_formatted_strings_to_raw_strings,
                        remove_duplicates_from_status_lists,
                        group_list_elements
                        )

from re import findall, IGNORECASE


logger = getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

e2eResultUpdateAPI = 'http://release:8000/api/updatee2eresult'
#e2eResultUpdateAPI = 'http://172.16.187.83:8000/api/updatee2eresult'
#Add TC IDs from a line to pass_list and TC name to passed_tc list
def add_id_to_pass_list(line, grep_words, pass_list, passed_tc_name) :
    for word in grep_words :
        if word in line :
            tc_name_string, tc_ids_string = line.split(word)
            passed_tc_name.append(tc_name_string)
            pass_list += tc_ids_string.split()
            break


# Add TC IDs from a line to given list
def add_id_to_given_list (line, grep_words, arg_list, tc_name_list) :
    tc_name_string = ''
    tc_ids_string = ''
    for word in grep_words :
        if word in line :
            tc_name_string, tc_ids_string = line.split(word)
        break

    tc_name_list.append(tc_name_string)
    id_list = findall('[A-Z0-9._]+\-[0-9]+.[0-9]+', tc_ids_string, flags=IGNORECASE)
    arg_list += id_list
    return


# Compare 2 consecutive lines and add the TC IDs to pass,fail list
def segregate_tc_ids_old( line_list) :
    pass_list, fail_list = [], []
    skipped_list = []
    passed_tc_name, failed_tc_name, skipped_tc_name = [], [], []
    i = 0
    while i < len(line_list) :
        j = i+1
        if i < len(line_list) - 1 :
            if line_list[j] in line_list[i] :       # 2nd line in 1st line
                add_id_to_pass_list(line_list[j], grep_words, pass_list, passed_tc_name)
                i += 2
                j += 2      # NOT needed

            else :				    # 2nd line NOT in 1st line
                if 'SKIPPING' in line_list[j] :
                    add_id_to_given_list (line_list[i], grep_words, skipped_list, skipped_tc_name)
                    i += 3

                else :
                    add_id_to_given_list (line_list[i], grep_words, fail_list, failed_tc_name)
                    i += 1
                    j += 1      # NOT needed

        if i == len(line_list) - 1 :      # Last Line
            add_id_to_given_list (line_list[i], grep_words, fail_list, failed_tc_name)
            i += 1
    return ( pass_list, fail_list, skipped_list,
	     passed_tc_name, failed_tc_name, skipped_tc_name )

def get_tc_name_id_list(line):
    tc_name_string = ''
    tc_ids_string = ''
    tc_id_list = []
    for word in grep_words :
        if word in line :
            tc_name_string, tc_ids_string = line.split(word)
            break
    id_list = findall('[A-Z0-9._]+[\_|\-][0-9]+.[0-9]+', tc_ids_string, flags=IGNORECASE)
    tc_id_list += id_list
    return (tc_name_string, tc_id_list)

def check_for_pass_skip_fail(start_test_lines, end_test_lines, pass_list, skipped_list, fail_list, tcName, tcidList):
    #check for fail in start_test_lines
    found = False
    tcName = tcName.split()[0]
    for i in range(0,len(start_test_lines)-1):
        if tcName in start_test_lines[i] and re.search(r'ERROR\s+TestFailed', start_test_lines[i+1]):
            found = True
            fail_list += tcidList
            return
    #check for pass in end_test_lines
    if not found:
        for line in end_test_lines:
            if tcName in line:
                found = True
                pass_list += tcidList
                return
    #finally if not found in pass and fail add it in skipped list
    if not found:
        skipped_list += tcidList

def filter_tc_ids(pass_list, fail_list, skipped_list):
    #remove tc from pass_list and fail_list if tc also in skipped list
    for tc in skipped_list:
        if tc in pass_list:
            pass_list.remove(tc)
        if tc in fail_list:
            fail_list.remove(tc)

def segregate_tc_ids( line_list, end_test_lines, start_test_lines) :
    pass_list, fail_list = [], []
    skipped_list = []
    passed_tc_name, failed_tc_name, skipped_tc_name = [], [], []
    preTcName = ''
    i = 0
    while i < len(line_list) :
        j = i+1
        if i < len(line_list) - 1 :
            tcName,tcidString = get_tc_name_id_list(line_list[i])
            tcNameToCompare, _= get_tc_name_id_list(line_list[j])
            if tcName == preTcName:
                i+=1
                preTcName = tcName
                continue
            if tcName in tcNameToCompare:
                if "TEST_PASSED" in line_list[j]:
                    pass_list += tcidString
                elif "TEST_FAILED" in line_list[j]:
                    fail_list += tcidString
                elif "TEST_SKIPPED" in line_list[j]:
                    skipped_list += tcidString
                i += 2
            else:
                check_for_pass_skip_fail(start_test_lines, end_test_lines, pass_list, skipped_list, fail_list, tcName, tcidString)
                i += 1
        if i == len(line_list) - 1 :      # Last Line
            tcName,tcidString = get_tc_name_id_list(line_list[i])
            check_for_pass_skip_fail(start_test_lines, end_test_lines, pass_list, skipped_list, fail_list, tcName, tcidString)
            break
        preTcName = tcName
    filter_tc_ids(pass_list, fail_list, skipped_list)
    return ( pass_list, fail_list, skipped_list,
             passed_tc_name, failed_tc_name, skipped_tc_name )


# Parse Log File and return Status_Dicts grouped by TC IDs
def parse_log_file(filename) :
    resultDict = {}
    result = get_greped_lines_and_directory_build_name(filename)

    greped_lines = result[0]
    end_test_lines = result[3]
    start_test_lines = result[4]
    drive_dir_name = result[1]
    build_name = result[2]

    if build_name == "" :
        build_name = input('Enter Build Manually:')

    # Drive dir to be updated, passed as an argument
    if drive_directory != "#!" :
        drive_dir_name = drive_directory

    raw_strings  = convert_formatted_strings_to_raw_strings( greped_lines)

    result = segregate_tc_ids( raw_strings, end_test_lines, start_test_lines)
    pass_id_list = result[0]
    fail_id_list = result[1]
    skipped_list = result[2]
    passed_tc_name = result[3]
    failed_tc_name = result[4]
    skipped_tc_name = result[5]

    pass_id_list, fail_id_list = remove_duplicates_from_status_lists (
                                    pass_id_list, fail_id_list )
    skipped_list = sorted(list(set(skipped_list)))


    passed_tc_name, failed_tc_name = remove_duplicates_from_status_lists (
                                        passed_tc_name, failed_tc_name )
    skipped_tc_name = sorted(list(set(skipped_tc_name)))

    logger.info("Drive Directory : {}".format(drive_dir_name))
    logger.info("Build Number : {}\n".format(build_name))

    resultDict['drive_dir_name'] = drive_dir_name
    resultDict['build_name'] = build_name
    resultDict['drive_sub_directory'] = drive_sub_directory
    resultDict['email'] = email

    if show_flag == 'true' :
        logger.info("Passed TCs :{1}{0}\n".format('\n\t'.join(passed_tc_name), '\n\t'))
        logger.info("Failed TCs :{1}{0}\n".format('\n\t'.join(failed_tc_name), '\n\t'))
        logger.info("Skipped TCs :{1}{0}\n".format('\n\t'.join(skipped_tc_name), '\n\t'))

        resultDict['pass_name_list'] = passed_tc_name
        resultDict['fail_name_list'] = failed_tc_name
        resultDict['skipped_name_list'] = skipped_tc_name

        res = requests.post(url = e2eResultUpdateAPI, data = json.dumps(resultDict))
        #print(res, "if response is 200: data entered successfully")
        #res = res.json()
        resultDict['msg'] = res
        print(resultDict)
        exit(0)

    else:
        logger.info("PASS IDs :\n{}\n".format(pass_id_list))
        logger.info("FAIL IDs :\n{}\n".format(fail_id_list))
        logger.info("SKIPPED IDs :\n{}\n".format(skipped_list))

        resultDict['pass_id_list'] = pass_id_list
        resultDict['fail_id_list'] = fail_id_list
        resultDict['skipped_id_list'] = skipped_list

        res = requests.post(url = e2eResultUpdateAPI, data = json.dumps(resultDict))
        #print(res, "if response is 200: data entered successfully")
        #res = res.json()
        resultDict['msg'] = res
        print(resultDict)
    pass_id_dict = group_list_elements( pass_id_list)
    fail_id_dict = group_list_elements( fail_id_list)

    return ( pass_id_dict, fail_id_dict,
             drive_dir_name, build_name )

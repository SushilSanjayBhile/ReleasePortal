from itertools import groupby


# Format the list of lines obtained from log file 
# Remove escape characters and indentation / color stuff
def convert_formatted_strings_to_raw_strings(string_list) :
    raw_strings = []

    # Escapes.: '\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10'
    #           '\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f'
    escapes = ''.join([chr(char) for char in range(1, 32)])
    formats = ['[0m', '[90m']       #Color formats

    for string in string_list :
        translator = str.maketrans('', '', escapes)
        string = string.translate(translator)
        for format in formats :
            string = string.replace( format, '')
        raw_strings.append(string)
    
    return raw_strings


#Remove Duplicates (from the same list) & Intersection of two from pass_list
def remove_duplicates_from_status_lists( pass_list, fail_list) :
    fail_set = set(fail_list)
    pass_list = sorted(set([ x for x in pass_list if x not in fail_set]))
    fail_list = sorted(list(fail_set))
    return pass_list, fail_list 


#Group TC IDs by Spreadsheet Name in dictonary
def group_list_elements(id_list) :
    data = {}
    
    for spreadsheet_name, group_list in groupby(
                                        id_list, 
                                        lambda x: x.partition('_')[0]
                                        ) :
        if spreadsheet_name in data :
            data[spreadsheet_name].append(
                list(group_list))

        else :
            data[spreadsheet_name] = list(group_list)

    return data

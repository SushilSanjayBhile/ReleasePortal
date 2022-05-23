from re import findall
from utils.constants import grep_words

# Return greped lines, dir name, build name
def get_greped_lines_and_directory_build_name(filename) :
    greped_lines = []
    drive_dir_name = ''
    build_name = ''
    rpm_flag = True

    with open( filename, 'r', encoding="utf-8") as file_obj :
        for line in file_obj :
            if rpm_flag and 'rpm=' in line :      
                build_name = findall('-[0-9.-]+\.', line)[0].strip('-.')
                version = findall('[0-9]+.[0-9]+.[0-9]+', build_name)
                if version :
                    drive_dir_name = 'GA-' + version[0]
                rpm_flag = False

            elif any( word in line for word in grep_words ) :
                greped_lines.append(line)


    return greped_lines, drive_dir_name, build_name

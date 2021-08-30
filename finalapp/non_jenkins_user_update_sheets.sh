#!/bin/bash
#
# non_jenkins_user_update_sheets.sh
#
# This script is used to manually invoke python script to update google spreadsheets with test results using log file as parameter.
#
# Version : 1.0


# Check if jq utility is installed

command -v jq >/dev/null 2>&1 || { echo >&2 "jq utility not installed; Exiting"; exit 1; }

show_flag=false
log_file_path=""
google_drive_dir=""
google_sub_dir=""

set -x

usage(){
	echo "This script is used to manually invoke python script to update google spreadsheets with test results using log file as parameter."
	echo "non_jenkins_user_update_sheets.sh"
	echo "-f <log file path>"
	echo "[ show ]"
	echo "[ -d <google drive directory name> ]"
	echo "[ -s <google drive sub-directory name> ]"
}


if [ "$1" == "" ]; then
	usage
	exit 1
fi


while [ "$1" != "" ]; do
    case $1 in
	show	)
		show_flag=true
		;;

	-f	)	shift
		log_file_path=$1
		;;

	-d	)	shift
		google_drive_dir=$1
		;;

	-s	)	shift
		google_sub_dir=$1
		;;

	-help	)	usage
	    	exit 1
	    	;;

	*	)	usage
	    	exit 1
    esac
    shift
done


# Check Variables
[[ "$log_file_path" == "" ]] && echo "[ERROR] -f option along with log file path is required." && exit 1

[[ "$google_drive_dir" == "" ]] && google_drive_dir=#!
[[ "$google_sub_dir" == "" ]] && google_sub_dir=#!

script_path=$(dirname $(realpath $0))
config_file_path=$script_path/authentication/config_files/config.json

# Update config file with given path
jq '.log_file_path = $path' --arg path $log_file_path $config_file_path > tmp_config.json && mv tmp_config.json $config_file_path 
jq '.drive_dir_name = $name' --arg name $google_drive_dir $config_file_path > tmp_config.json && mv tmp_config.json $config_file_path
jq '.drive_sub_dir_name = $name' --arg name $google_sub_dir $config_file_path > tmp_config.json && mv tmp_config.json $config_file_path
jq '.show_flag = $flag' --arg flag $show_flag $config_file_path > tmp_config.json && mv tmp_config.json $config_file_path


# Invoking the python script
entrypoint=$script_path/update_google_sheets.py
$entrypoint  --noauth_local_webserver


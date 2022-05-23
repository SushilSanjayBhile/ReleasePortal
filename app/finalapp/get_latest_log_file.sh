#!/bin/bash

# Deleting the previous log file
rm log

# Project Name has to be the name of project in Jenkins. eg : P12-2.0.0-e2e
project_name=$1

next_build_number=`ssh -T root@builds cat /var/lib/jenkins/jobs/$project_name/nextBuildNumber`
current_build_number="$(($next_build_number - 1))"

# Getting the console log prints of the e2e run to log file
wget -q http://builds:8080/job/$project_name/$current_build_number/consoleText -O log


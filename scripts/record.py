#!/usr/bin/python
import os, requests, json, collections, psycopg2
import time
from datetime import datetime
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

#os.system("python p.py")
userName = 'sushil'
passwd = '!lovert3'
hostName = 'localhost'
portNumber = '5432'

#####################
#logic to read file and post request to db

filePaths = ["Json/", "Json1/"]

ip = "http://localhost:8000/api"

# specific to release
TCINFOURL = [ip + "/tcinfo/master", ip + "/tcinfo/2.3.0"]
TCSTATUSURL = [ip + "/tcstatus/master", ip + "/tcstatus/2.3.0"]
GUITCSTATUSURL = [ip + "/guitcstatus/master", ip + "/guitcstatus/2.3.0"]

#universal data
USERINFOURL = ip + "/userinfo/"
RELEASEURL = ip + "/release"
URELEASEURL = ip + "/urelease/"



def createDB(release):
    con = psycopg2.connect(dbname='postgres',
        user=userName, host='',
        password=passwd)

    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cur = con.cursor()
    cur.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(release))
        )

    cur.execute(sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} to {}").format(
            sql.Identifier(release), sql.Identifier(userName))
        )
    string = "echo " + hostName + ":" + portNumber + ":" + release + ":" + userName + ":" + passwd

    os.system(string + ">> ~/.pgpass")
    # os.system("pg_dump -h localhost -U " + userName + " -Fc 2.3.0 -f backup.sql")
    # os.system("pg_restore -h localhost -d " + release + " -U " + userName + " backup.sql")

    lineNo = 0
    with open('temp/dp/dp/settings.py', 'r') as fp:
        f = fp.readlines()
        for line in f:
            lineNo += 1
            if "DATABASES = {" in line:
                
                string = """    '{release}': {{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '{release}',
        'USER': userName,
        'PASSWORD': passwd,
        'HOST': hostName,
        'PORT': portNumber,
        }},
"""
                finalString = string.format(release=release, userName=userName, passwd=passwd, hostName=hostName, portNumber=portNumber)
                f.insert(lineNo, finalString)
                contents = "".join(f)
    fp.close()

    newfp = open("temp/dp/dp/newsettings.py", "w+")
    newfp.write(contents)
    newfp.close()

    os.system("cp temp/dp/dp/settings.py temp/dp/dp/oldsettings.py")
    os.system("mv temp/dp/dp/newsettings.py temp/dp/dp/settings.py")

    os.system("python3 temp/dp/manage.py makemigrations")
    os.system("python3 temp/dp/manage.py migrate --database=" + release)

    time.sleep(2)

#to add default database in django settings
def addDefault():
    lineNo = 0
    with open('temp/dp/dp/settings.py', 'r') as fp:
        f = fp.readlines()
        for line in f:
            lineNo += 1
            if "DATABASES = {" in line:
                
                string = """    'default': {{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'universal',
        'USER': userName,
        'PASSWORD': passwd,
        'HOST': hostName,
        'PORT': portNumber,
        }},
"""
                finalString = string.format(userName=userName, passwd=passwd, hostName=hostName, portNumber=portNumber)
                f.insert(lineNo, finalString)
                contents = "".join(f)
    fp.close()

    newfp = open("temp/dp/dp/newsettings.py", "w+")
    newfp.write(contents)
    newfp.close()

    os.system("cp temp/dp/dp/settings.py temp/dp/dp/oldsettings.py")
    os.system("mv temp/dp/dp/newsettings.py temp/dp/dp/settings.py")


addDefault()
createDB("universal")
createDB("master")
createDB("2.3.0")


#USER INFO
dictionary = {}
nameList = ['Yatish Devadiga', 'Bharati Bhole', 'Kiran Kothule', 'Vishal Anarase', 'Sunil Barhate', 'Mukesh Shinde', \
	'Gunjan Vyas', 'Alka Chaudhary', 'Priyanka Birajdar', 'Tanya Singh', 'Kiran Zarekar', 'Rajat Gupta', \
		'Prasad Limaye', 'Saurabh Shukla', 'Samiksha Bagmar', 'Yogesh Thosare', 'Sushil Bhile', 'Vinod Lohar', \
			'Nikhil Temgire', 'Shubham Khatri', 'Neha Dhiman', 'Abhijeet Chavan','Varsha Suryavanshi']

emailList = ['yatish', 'bharati', 'kk', 'vishal', 'sunil', 'mukesh', \
	'gunjan', 'alka', 'priyanka', 'tanya', 'kiran2', 'rajat', \
		'prasad', 'saurabh', 'samiksha', 'yogesh', 'sushil', 'vinod', \
			'nikhil', 'skhatri', 'neha', 'achavan','vsuryavanshi']

roles = ['ADMIN', 'MANAGER', 'EXECUTIVE', 'DEVELOPER', 'QA']

roleList = [roles[0], roles[0], roles[4], roles[4], roles[3], roles[4], \
	roles[3], roles[3], roles[4], roles[4], roles[4], roles[4], \
		roles[3], roles[4], roles[3], roles[4], roles[3], roles[3], \
			roles[3], roles[4], roles[3], roles[3], roles[4]]

email = "@diamanti.com"

for i in range(len(nameList)):

	dictionary['UserId'] = -1
	dictionary['Name'] = ''
	dictionary['UserName'] = ''
	dictionary['Role'] = ''

	dictionary['UserId'] = i + 1
	dictionary['Name'] = nameList[i]
	dictionary['UserName'] = emailList[i] + email
	dictionary['Role'] = roleList[i]

	r1 = requests.post(url = USERINFOURL, data = json.dumps(dictionary))

a = 0
###############################################################################################################################################
###############################################################################################################################################

def recordFunc(i):
	global a, TCINFOURL, TCSTATUSURL, filePath, GUITCSTATUSURL

	filePath = filePaths[i]
	for directory, subdirectory, files in os.walk(filePath):
		# print("\nREADING DIRECTORY: ",directory)
		
		for f in files:
			fname = (directory.split("/"))[-1] + "_" + f
			f1 = (fname.split(".json"))[0]

			subdomain = f.split('.json')[0]
			domain = directory.split("/")[-1]

			with open(directory + "/" + f) as f:
				data = json.load(f)
				scen = ''
				
				for row in data:
					
					#TC GENERIC INFORMATION>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
					dict = {}
					dict['Status'] = 'NA'
					dict['Setup'] = ''
					dict['Description'] = 'NO DESCRIPTION PROVIDED'
					dict['Domain'] = domain
					dict['SubDomain'] = subdomain

					dict['OrchestrationPlatform'] = 'dcx-k8s'
					if('/Master/' in directory):
						dict['OrchestrationPlatform'] = 'dcx-k8s'
					elif('/Master-Openshift/' in directory):
						dict['OrchestrationPlatform'] = 'oc-k8s'

					#TC SPECIFIC INFO>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
					if(('TC ID' in row) and ('Results' in row) and (row['TC ID'] != '')):
						if 'Release' not in row:
							dict['Release'] = "NO RELEASE PROVIDED"

						elif row['Release'] == "NA" or row['Release'] == '':
							pass

						elif "." not in row['Release']:
							# continue
							pass

						#TCID BASIC CHECK>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if ' ' not in row['TC ID']:
							dict['TcID'] = row['TC ID']
						else:
							continue #IF TC ID NOT VALID SKIP THIS ROW
						#===================================================

						#SCENARIO>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						try:
							if row['Scenario / Category'] != '':
								scen = row['Scenario / Category']
							else:
								row['Scenario / Category'] = scen
						except:
							row['Scenario / Category'] = ''

						dict['Scenario'] = row['Scenario / Category']
						#=================================================


						#SETUP NAME>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						if('/BOS/' in directory):
							dict['CardType'] = 'BOS'
						elif('/NYNJ/' in directory):
							dict['CardType'] = 'NYNJ'
						elif('/Common' in directory):
							dict['CardType'] = 'COMMON'
						elif('Master-Openshift' in directory):
							dict['CardType'] = 'OS'
						#================================================

						dict['ServerType'] = 'UNKNOWN'

						#AUTOMATION TC NAME>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						try:
							if len(row['Automation TC Name']) < 2:
								dict['TcName'] = 'TC NOT AUTOMATED'
							else:
								dict['TcName'] = row['Automation TC Name']
								dict['Status'] = 'COMPLETED'
						except:
							dict['TcName'] = 'TC NOT AUTOMATED'
						#==============================================================

						#EXPECTED BEHAVIOUR CHECK AS COLUMN NAME IN GOOGLE SHEET IS DIFFERENT>>>>>>>>>>>>>>>>>>>>>>>>>>
						dict['ExpectedBehaviour'] = ''

						try:
							dict['ExpectedBehaviour'] = row['Expected Behaviour']
						except:
							pass

						try:
							dict['ExpectedBehaviour'] = row['Expected Behaviour (Expectation)']
						except:
							pass
						
						if dict['ExpectedBehaviour'] == '':
							dict['ExpectedBehaviour']  = "NO EXPECTED BEHAVIOUR PROVIDED"
						#===============================================================================================

						#NOTES>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						dict['Notes'] = ''

						try:
							dict['Notes'] = row['Notes / Detailed Description (Actual performance)']
						except:
							pass
						try:
							dict['Notes'] = row['Notes / Detailed Description']
						except:
							pass

						if dict['Notes'] == '':
							dict['Notes']  = "NOTES NOT PROVIDED"
						#=============================================================================================
		
						#TEST DESCRIPTION>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
						try:
							if(len(row['Test Description'].strip()) == 0):
								dict['Description'] = "NO DESCRIPTION AVAILABLE"
							else:
								dict['Description'] = row['Test Description']
						except:
							dict['Description'] = "NO DESCRIPTION AVAILABLE"
						#=============================================================================================
					
						#status of TC (UNDERWORK, ASSIGNED, COMPLETED) need this check as tc info request if before status
						if (row['Results'] != '' and row['Results'] != ' ' and row['Results'] != 'NA'):
							dict['Status'] = 'DONE'
						else:
							dict['Status'] = 'UNDERWORK'
						#================================================================================================
						a += 1
						requests.post(url = TCINFOURL[i], data = json.dumps(dict))

						rf = 0
						dict1 = {}

						if (row['Results'] != '' and row['Results'] != ' ' and row['Results'] != 'NA'):
							#RESULT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
							if ("pass" in (row['Results']).lower()):
								dict1['Result'] = "Pass"
							if ("fail" in (row['Results']).lower()):
								dict1['Result'] = "Fail"

							rf = 1

							#if(row['Results'] != dict1['Result']):
							#	print(row['Results'], dict1['Result'])
							#============================================

						elif (row['Results'] == 'NA'):
							dict1['Result'] = "NA"
							rf = 1

						else:
							dict1['Result'] = "Not Tested"
							rf = 1

						if (rf == 1):

							dict1['TcID'] = dict['TcID']

							#logic for release>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
							try:
								dict1['Release'] = row['Release']
							except:
								dict1['Release'] = "NO RELEASE PROVIDED"

							if dict1['Release'] == '':
								dict1['Release'] = "NO RELEASE PROVIDED"
							#========================================================================

							#logic for build>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
							try:
								dict1['Build'] = row['Build No']
							except:
								dict1['Build'] = "NO BUILD PROVIDED"
							#=======================================================================

							#BUG>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
							try:
								if row['Bug no '] == '':
									dict1['Bugs'] = -1
								else:
									dict1['Bugs'] = row['Bug no ']
							except:

								try:
									if row['Bug No'] == '':
										dict1['Bugs'] = -1
									else:
										dict1['Bugs'] = row['Bug No']
								except:
									pass
							
								pass
							#============================================

							dict1['Domain'] = dict['Domain']
							dict1['SubDomain'] = dict['SubDomain']
							dict1['CardType'] = dict['CardType']
							r1 = requests.post(url = TCSTATUSURL[i], data = json.dumps(dict1))
					elif(('TC ID' in row) and ('Result/Browser (Ubuntu) Chrome' in row) and (row['TC ID'] != '')):
						guidict = {}
						resultdict = {}

						guidict['TcID'] = row['TC ID']
						guidict['TcName'] = 'NO NAME'	
						guidict['Domain'] = domain
						guidict['SubDomain'] = subdomain

						try:
							if row['Scenario / Category'] != '':
								guiscen = row['Scenario / Category']
							else:
								row['Scenario / Category'] = guiscen
						except:
							row['Scenario / Category'] = 'NO SCENARIO PROVIDED'

						guidict['Scenario'] = row['Scenario / Category'] 
						guidict['Description'] = row['Test Description']
						guidict['ExpectedBehaviour'] = row['Expected Behaviour']
						guidict['Notes'] = row['Expected Behaviour']
						guidict['CardType'] = "COMMON"
						guidict['ServerType'] = "UNKNOWN"
						guidict['OrchestrationPlatform'] = "UNKNOWN"
						requests.post(url = TCINFOURL[i], data = json.dumps(guidict))

						resultdict['TcID'] = guidict['TcID']
	
						resultkeyvalue = {"Result/Browser (Ubuntu) Chrome": 'ResultUbuntuChrome', "Result/Browser (Ubuntu) Firefox": 'ResultUbuntuFirefox', "Result/Browser (Windows) IE11": 'ResultWindowsIE', "Result/Browser (Windows) Chrome": 'ResultWindowsChrome', "Result/Browser (Windows) Firefox": 'ResultWindowsFirefox', "Mac Safari": 'ResultMacSafari'}

						for j in resultkeyvalue:
							if row[j].lower() != "":
								resultdict[resultkeyvalue[j]] = row[j].lower().capitalize()
							elif row[j].lower() == "":
								resultdict[resultkeyvalue[j]] = "NOT TESTED"

						resultdict['BuildUbuntuChrome'] = "NO BUILD PROVIDED"
						resultdict['BuildUbuntuFirefox'] = "NO BUILD PROVIDED" 
						resultdict['BuildWindowsChrome'] = "NO BUILD PROVIDED" 
						resultdict['BuildWindowsFirefox'] = "NO BUILD PROVIDED" 
						resultdict['BuildWindowsIE'] = "NO BUILD PROVIDED" 
						resultdict['BuildMacSafari'] = "NO BUILD PROVIDED" 

						builds = row['Build No'].split(",")

						for build in builds:
							buildno = build.split("(")[0]

							if 'linux' in build.lower():
								resultdict['BuildUbuntuChrome'] = buildno
								resultdict['BuildUbuntuFirefox'] = buildno
							if 'window' in build.lower():
								resultdict['BuildWindowsChrome'] = buildno
								resultdict['BuildWindowsFirefox'] = buildno
								resultdict['BuildWindowsIE'] = buildno
							if 'chrome' in build.lower() or 'gc' in build.lower():
								resultdict['BuildWindowsChrome'] = buildno
								resultdict['BuildUbuntuChrome'] = buildno
							if 'wie' in build.lower() or 'ie' in build.lower():
								resultdict['BuildWindowsIE'] = buildno
							if 'wff' in build.lower():
								resultdict['BuildUbuntuFirefox'] = buildno
							if 'lgc' in build.lower():
								resultdict['BuildUbuntuChrome'] = buildno
							if 'safari' in build.lower():
								resultdict['BuildMacSafari'] = buildno
		
						if row['Bug no '] != '' and 'dws' in row['Bug no '].lower():
							resultdict['Bug'] = row['Bug no ']

						resultdict['Date'] = str(datetime(2010, 1, 1, 1, 1, 1, 111111))

						resultdict['Domain'] = domain
						resultdict['SubDomain'] = subdomain
						resultdict['CardType'] = "COMMON"
						requests.post(url = GUITCSTATUSURL[i], data = json.dumps(resultdict))

	###############################################################################################################################################
	###############################################################################################################################################


release1 = {}
release1['ReleaseNumber'] = '2.3.0'
release1['BuildNumberList'] =  [x+1 for x in range(100)]
release1['SetupsUsed'] = ['autotb1','autotb2','autotb3','autotb4','autotb5','autotb6','autotb7','autotb8','autotb9','autotb10','scaletb']
release1['CardType'] = ['BOS', 'NYNJ', 'NOCARD']
release1['ServerType'] = ['DELL', 'LENOVO']
release1['QAStartDate'] = str(datetime(2015, 1, 1, 23, 55, 59, 342380))
release1['TargetedReleaseDate'] = str(datetime(2015, 6, 1, 23, 55, 59, 342380))
release1['ActualReleaseDate'] = str(datetime(2015, 6, 5, 23, 55, 59, 342380))
release1['TargetedCodeFreezeDate'] = str(datetime(2015, 5, 30, 23, 55, 59, 342380))
release1['UpgradeTestingStartDate'] = str(datetime(2015, 5, 1, 23, 55, 59, 342380))
release1['UpgradeMetrics'] = ['2.1.0','2.2.0']
release1['Customers'] = ['Duke']
release1['FinalBuild'] = '97'
release1['FinalOS'] = 'Centos 7.6 (1810)'
release1['FinalDockerCore'] = '96'
release1['EngineerCount'] = 6
release1['UbootVersion'] = 'U-Boot 1.1.4-g1c8343c8-dirty (Feb 28 2014 - 13:56:54)'
release1['RedFlagsRisks'] = 'Backup controller not working'
release1['AutomationSyncUp'] = 'Backup controller automation skipped as backup controller is not working properly. CSI drive plugin not getting changed after execution of script. Pods attached to volumes with xfs filesystem are crashing again and again. volume subpath not supported from 2.2.0 because of change in Centos kernel version, which used to support volume subpath.'



release2 = {}
release2['ReleaseNumber'] = 'master'
release2['BuildNumberList'] =  ['1','2','3','4','5','6','7','8','9','10']
release2['SetupsUsed'] = ['octb1', 'scaletb']
release2['CardType'] = ['BOS', 'NYNJ', 'NOCARD']
release2['ServerType'] = ['DELL', 'LENOVO']
release2['QAStartDate'] = str(datetime(2015, 1, 1, 23, 55, 59, 342380))
release2['TargetedReleaseDate'] = str(datetime(2015, 6, 1, 23, 55, 59, 342380))
release2['ActualReleaseDate'] = str(datetime(2015, 6, 5, 23, 55, 59, 342380))
release2['TargetedCodeFreezeDate'] = str(datetime(2015, 5, 30, 23, 55, 59, 342380))
release2['UpgradeTestingStartDate'] = str(datetime(2015, 5, 1, 23, 55, 59, 342380))
release2['UpgradeMetrics'] = []
release2['Customers'] = ['IBM']
release1['EngineerCount'] = 3
release2['FinalBuild'] = '10'
release2['FinalOS'] = 'Redhat14.0'
release2['FinalDockerCore'] = '10'
release2['UbootVersion'] = 'U-Boot 1.1.4-g1c8343c8-dirty (Feb 28 2014 - 13:56:54)'
release2['RedFlagsRisks'] = 'Networking not supported.'
release2['AutomationSyncUp'] = 'Networking management is done by OS itself, in openshift. So networking will not be supported by diamanti. Networking automation dropped. QoS related to networking dropped.'

r2 = requests.post(url = RELEASEURL, data = json.dumps(release2))
time.sleep(5)
r1 = requests.post(url = RELEASEURL, data = json.dumps(release1))
time.sleep(5)

for onefile in range(len(filePaths)):
	recordFunc(onefile)
	a = 0
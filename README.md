
# _Relese Portal_

Release portal is used to track:
 relase-wise applicable test cases, build-wise results of each test cases

#### Release portal is used to:
- Relase-wise applicable CLI & GUI test cases
- Build-wise results of each test cases
- QA status
- Detailed as well as aggregated test case result view
- Domain, subdomain, platform wise test case and their QA status
- Results of e2e, stress, sanity, longevity
- Automation progress
- Reports (customer wise, priority wise)

#### Directory Hierarchy:

    |
    |- README.md    # Readme file
    |- app          # This Directory have all backend code
    |- frontend     # This Directory have all frontend code
    |- DockerfileController   # This Directory have backend pod's Dockerfile

Technologies/Tools Used:

- Django REST Framework
- postgreSQL
- React

Dependancy Issues:

- Controller code needs postgreSQL server running.

Requirements:

- Backend: app/requirementsController.txt

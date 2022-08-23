
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

#### Building images:
- Backend:

Clone the release-portal project and run the script `createControllerImage.sh <image-tag>` at `/release-portal/script/`.
Script will generate and push image to diamanti's docker hub.

- Frontend:
Clone the release-portal project locally on personal machine and use the commnad `npm run build` at `/release-portal/frontend/front-end/`.
Use `npm run update` when error occurs. Copy the `build` directory to `/release-portal/frontend/server/`. Use docker command to build image `docker build -t <Image-name >:<image-tag>`. Push it to diamanti docker hub.

Update the image in spec file `/release-portal/k8sconfigfiles/finalreleasepod-withcreatedb.yaml` for production and `/release-portal/k8sconfigfiles/finalReleasePod-testing.json` for testing.

Use `Kubectl apply -f <spec-file>` to update the pod of production or testing environment.

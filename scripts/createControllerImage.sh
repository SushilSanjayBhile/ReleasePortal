if [ $# -eq 0 ]; then
    echo "No arguments provided"
    exit 1
fi

rm -rf controllerCreate
mkdir controllerCreate 2> /dev/null
mkdir ./controllerCreate/release-portal 2> /dev/null

cd ../
git pull
cp ./dockerfiles/DockerfileController ./scripts/controllerCreate/Dockerfile
cp ./app/requirementsController.txt ./scripts/controllerCreate/
cp -r ./app ./scripts/controllerCreate/release-portal/
cp -r ./frontend ./scripts/controllerCreate/release-portal/
cp -r ./.git ./scripts/controllerCreate/release-portal/
cp -r ./.gitignore ./scripts/controllerCreate/release-portal/

cd ./scripts/controllerCreate/

docker build -t sushilmax93/stable-controller:$1 --no-cache .
#docker build -t sushilmax93/stable-controller:$1 .
docker push sushilmax93/stable-controller:$1

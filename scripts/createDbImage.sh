if [ $# -eq 0 ]; then
    echo "No arguments provided"
    exit 1
fi

rm -rf dbCreate
mkdir dbCreate 2> /dev/null

cd dockerfiles

cp DockerfilePostgres ../dbCreate/Dockerfile
cp requirementspostgres.txt ../dbCreate/
cp app.py ../dbCreate/
cp pgpass ../dbCreate/
cp postgresql.conf ../dbCreate

cd ..
cd dbCreate

docker build -t sushilmax93/db-stable:$1 .
docker push sushilmax93/db-stable:$1

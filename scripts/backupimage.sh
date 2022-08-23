docker login -u sushilmax93

cont=`docker ps | grep controller | awk '{print $1}'`
echo $cont

docker pause $cont
docker commit $cont
docker unpause $cont


img=`docker images | head -n 2 | tail -n 1 | awk '{print $3}'`
echo $img 

docker tag $img sushilmax93/releasefinal:$1
docker push sushilmax93/releasefinal:$1

img=$1


#sudo docker login -u sushilmax93

#cont=`sudo docker ps | grep releasepostgres | awk '{print $1}'`
#cont=`docker ps -a | grep releasepostgres | awk '{print $1}'`
#echo $cont
#
#docker pause $cont
#docker commit $cont
#docker unpause $cont
#
#img=`docker images | head -n 2 | tail -n 1 | awk '{print $3}'`
echo $img

docker tag $img sushilmax93/releasepostgres:$2
docker push sushilmax93/releasepostgres:$2

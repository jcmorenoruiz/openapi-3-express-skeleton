#
#!/bin/sh
#
echo "# DOCKER UP AND ATTACH"
echo "#"

docker-compose up -d
docker attach plusid-be

# openapi-3-express-skeleton
Express NodeJS backend with OpenApi 3.0 API docs

## Docker container

To build: docker-compose build

To run: docker-compose up

To run as daemon: docker-compose up -d
Then attach into terminal: docker attach openapi-backend

### First initialization

1) Start mongo container, if not running already..
$ docker-compose up -d mongo

2) execute script to create application db user (matched with default secrets)
$ docker exec mongo-openapi bash -c "sh ./docker-entrypoint-initdb.d/mongo-init.sh"

3) execute script to create application db user (matched with default secrets)

For empty database, you may also need to create your default backoffice administrator user. To do this, please login into container:

$ docker exec -it openapi-backend /bin/sh

And execute the script:

$ DEBUG=* BO_USERNAME=... BO_PASSWORD=... EMAIL=... node tools/users/create_new_user.js

4) execute data migrations

Please, login into container:

$ docker exec -it openapi-backend /bin/sh

And execute the migrate up script:
	
$ npm run migrate:up


## Useful commands

Run npm install: docker exec openapi-backend sh -c "cd /app/openapi-backend && npm install"

Shell into container: docker exec -it openapi-backend /bin/sh

Re-build container without cache: docker-compose build --no-cache

Re-build and restart composer service: docker-compose up --build

Restart the running composer service: docker-compose restart openapi-backend
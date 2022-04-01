// will use MONGO_INITDB_DATABASE (env variable defined in docker-compose.yml) for database name.

db.log.insertOne({ "message": "Database created." });

db.createUser(
  {
    user: __getEnv("MONGO_INITDB_USERNAME"),
    pwd: __getEnv("MONGO_INITDB_PASSWORD"),
    roles: ["readWrite"]
  }
);

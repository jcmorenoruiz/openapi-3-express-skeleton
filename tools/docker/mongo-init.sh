echo '################ MONGO ENTRYPOINT START ################';

mongosh --port 27022 "$DB_NAME" <<EOF

db = db.getSiblingDB('$DB_NAME');
db.log.insertOne({ "message": "Database created." });

db.createUser(
  {
    user: '$DB_USER',
    pwd: '$DB_PASSWORD',
    roles: [{ role: "readWrite", db: '$DB_NAME' }]
  }
);

EOF

echo '################ MONGO ENTRYPOINT END ################';
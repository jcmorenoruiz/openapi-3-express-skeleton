#
#!/bin/sh
#
echo "# DOCKER INIT"
echo "#"

# check if npm install is needed?
FOLDER_TO_CHECK="./node_modules/mongoose/"
if [ -d "$FOLDER_TO_CHECK" ]
then
  echo "# Node modules installed; no need to run npm install"
  echo "#"
else
  echo "# Dependencies not installed; executing npm install"
  echo "#"
  npm install
fi
sleep 1

# check if we have secrets existing?
SECRETS_FILE="./config/env/secrets.js"
if [ -f "$SECRETS_FILE" ]
then
  echo "# Configuration exists"
  echo "#"
else
  echo "# No default configuration; copy default secrets"
  echo "#"
  cp "$SECRETS_FILE".tmpl "$SECRETS_FILE"
fi
sleep 1

echo "# Wait a bit to let MongoDB to start.."
echo "#"
for i in 1 2 3 4 5; do
  echo "# waiting.. ($i)"
  sleep 1
done

echo "#"
echo "# DONE (DOCKER INIT)"

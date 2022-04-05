#
# for local development only
#

# openapi-be
FROM node:16.14.2-alpine
EXPOSE 10034

VOLUME ["/app/openapi-be"]
WORKDIR /app/openapi-be

COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
FROM node:14.17.0

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/musician.js"]

FROM node:14.17.0

COPY src /opt/app/

RUN npm install uuid --save
ENTRYPOINT ["node", "/opt/app/musician.js"]

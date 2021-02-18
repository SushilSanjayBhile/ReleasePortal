FROM node:10
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 80
ENTRYPOINT npm run startProd && /bin/bash

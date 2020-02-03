FROM alpine
RUN apk add nodejs npm
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5051
ENTRYPOINT npm run start

FROM node:8-slim

WORKDIR /app
ADD . /app

RUN npm i
RUN npm rebuild

ENV PORT 8080
ENV DOCKER TRUE
ENV REDIS_HOST redis-cloud
EXPOSE 8080

CMD ["node", "dist/index.js"]

FROM node:16-alpine

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY . /app/

RUN npm install --production && \
    npm cache clean --force

EXPOSE 7776

USER node

CMD ["node", "web.js"]

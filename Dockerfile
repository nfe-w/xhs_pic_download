FROM node:22-alpine

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY . /app/

RUN npm ci --omit=dev && \
    npm cache clean --force

EXPOSE 7776

USER node

CMD ["node", "web.js"]

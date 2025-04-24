# 前端构建阶段
FROM node:20 AS frontend-builder
WORKDIR /app
COPY client/package*.json ./ 
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci --frozen-lockfile
COPY client/ .  
RUN npm run build  

# 后端构建阶段
FROM node:20 AS backend-builder
WORKDIR /app
COPY server/package*.json ./ 
RUN npm config set registry https://registry.npmmirror.com && \
    npm install
COPY server/ .  
EXPOSE 3001
CMD ["npm", "start"]  

# 生产阶段
FROM nginx:alpine
COPY --from=frontend-builder /app/build /usr/share/nginx/html  
COPY --from=backend-builder /app/ /app/  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]  
# # stage1 - build react app first 
# FROM node:16.13.1-alpine3.15 as build
# ARG COMMAND
# # Set working directory
# WORKDIR /app
# # Copy all files from current directory to working dir in image
# COPY . .
# # install node modules and build assets
# RUN yarn --silent && yarn ${COMMAND}

# # stage 2 - build the final image and copy the react build files
FROM nginx:1.21.6-alpine
COPY  /build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY config/nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FROM node:6.2.2-slim
RUN apt-get update -y
RUN apt-get install -y git build-essential python
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 8000

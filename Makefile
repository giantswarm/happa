.PHONY: dist

# Default task that Builder will run
# Builds production assets. Builder takes care of building the production container
default: dist

# Build and run the production environment
# becomes available at localhost
production: dist docker-build-prod
	docker-compose -f docker-compose-prod.yml up

# Build production assets and save them in the 'dist' folder
install-node-modules:
	rm -rf dist
	mkdir dist
	docker run --rm -ti \
		-v ${PWD}/src:/usr/src/app/src:z \
		-v ${PWD}/dist:/usr/src/app/dist:z \
		-v ${PWD}/node_modules_linux:/usr/src/app/node_modules:z \
		-v ${PWD}/package.json:/usr/src/app/package.json:z \
		-v ${PWD}/yarn.lock:/usr/src/app/yarn.lock:z \
		quay.io/giantswarm/happa-build:latest yarn install --no-progress

run-prettier:
	docker run --rm -ti \
    -v ${PWD}/src:/usr/src/app/src:z \
    -v ${PWD}/dist:/usr/src/app/dist:z \
    -v ${PWD}/node_modules_linux:/usr/src/app/node_modules:z \
    -v ${PWD}/package.json:/usr/src/app/package.json:z \
    -v ${PWD}/yarn.lock:/usr/src/app/yarn.lock:z \
    quay.io/giantswarm/happa-build:latest yarn run prettier

validate-prettier:
	docker run --rm -t \
		-v ${PWD}/src:/usr/src/app/src:z \
		-v ${PWD}/dist:/usr/src/app/dist:z \
		-v ${PWD}/node_modules_linux:/usr/src/app/node_modules:z \
		-v ${PWD}/package.json:/usr/src/app/package.json:z \
		-v ${PWD}/yarn.lock:/usr/src/app/yarn.lock:z \
		quay.io/giantswarm/happa-build:latest yarn run validate-prettier

dist:
	docker run --rm -ti \
		-v ${PWD}/src:/usr/src/app/src:z \
		-v ${PWD}/dist:/usr/src/app/dist:z \
		-v ${PWD}/node_modules_linux:/usr/src/app/node_modules:z \
		-v ${PWD}/package.json:/usr/src/app/package.json:z \
		-v ${PWD}/Gruntfile.js:/usr/src/app/Gruntfile.js:z \
		-v ${PWD}/webpack.config.js:/usr/src/app/webpack.config.js:z \
		-v ${PWD}/webpack.dist.config.js:/usr/src/app/webpack.dist.config.js:z \
		-v ${PWD}/.eslintrc:/usr/src/app/.eslintrc:z \
		quay.io/giantswarm/happa-build:latest grunt build


check-updates:
	# check for dependency updates
	docker run -p 8000:8000 -v ${PWD}/src:/usr/src/app/src:z -v ${PWD}/dist:/usr/src/app/dist:z \
		happa-dev npm install -g npm-check-updates && ncu

# Build the production docker container, which is just an nginx server
# with the files from the dist folder
docker-build-prod:
	docker build -t quay.io/giantswarm/happa -f Dockerfile .

# Run the development environment
# Becomes available at localhost:7000
develop:
	@echo
	@echo "-------------------------------------------------------------------"
	@echo "Starting Happa development environment using docker-compose"
	@echo "-------------------------------------------------------------------"
	@echo
	docker-compose build
	docker-compose up -d

	@echo
	@echo "-------------------------------------------------------------------"
	@echo "Happa development environment is running at http://localhost:7000."
	@echo "--------------------------------------------------------------------"
	@echo

	@echo
	@echo "You will also need the API test setup from https://github.com/giantswarm/api/tree/master/testing"
	@echo "running. There is also a fixtures.sh script to get you started with users and organizations."
	@echo

	@echo "To tail the development logs use: make develop-logs"
	@echo "To stop the development environment use: make develop-stop"

develop-logs:
	docker-compose logs -f --tail="all"

develop-stop:
	docker-compose down
	docker-compose rm

# Build the dev container
docker-build-dev:
	docker build -t happa-dev -f Dockerfile.dev .

# Build the dev container from scratch
docker-clean-build-dev:
	docker build -t happa-dev --no-cache -f Dockerfile.dev .

# Print a list of outdated dependencies
npm-check-updates:
	docker run -ti happa-dev ncu

# Run tests
test: docker-build-dev
	docker run -ti -p 8000:8000 -p 8080:8080 -v ${PWD}/src:/usr/src/app/src:z happa-dev npm test

clean:
	rm -rf .cache dist docker-volumes node_modules

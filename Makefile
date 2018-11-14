# Default task that Builder will run
# Builds production assets. Builder takes care of building the production container
default: dist

# Build and run the production environment
# becomes available at localhost
production: dist docker-build-prod
	docker-compose -f docker-compose-prod.yml up

# Build production assets and save them in the 'dist' folder
dist: docker-build-dev
	rm -rf dist
	mkdir dist
	docker run -p 8000:8000 -v ${PWD}/src:/usr/src/app/src:Z -v ${PWD}/dist:/usr/src/app/dist:Z happa-dev grunt build

# When in CI, build production assets and save them in the 'dist' folder
dist-ci: docker-build-dev
	rm -rf dist
	mkdir dist
	docker run -p 8000:8000 \
		-v ${PWD}/src:/usr/src/app/src:Z \
		-v ${PWD}/dist:/usr/src/app/dist:Z \
		-v ${PWD}/node_modules:/usr/src/node_modules \
		happa-dev grunt build


check-updates:
	# check for dependency updates
	docker run -p 8000:8000 -v ${PWD}/src:/usr/src/app/src:Z -v ${PWD}/dist:/usr/src/app/dist:Z \
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
	docker run -ti -p 8000:8000 -p 8080:8080 -v ${PWD}/src:/usr/src/app/src:Z happa-dev npm test

# update dependency images
pull-images:
	docker pull quay.io/giantswarm/fake-metrics-node:latest
	docker pull quay.io/giantswarm/fake-metrics-prometheus:latest
	docker pull quay.io/giantswarm/mailcatcher:latest
	docker pull quay.io/giantswarm/giantswarm/mock-api:latest
	docker pull quay.io/giantswarm/passage:latest

# Default task that Builder will run
# Builds production assets. Builder takes care of building the production container
default: dist

# Build and run the production environment
# becomes available at docker.dev
production: dist docker-build-prod
	docker-compose -f docker-compose-prod.yml up

# Build production assets and save them in the 'dist' folder
dist: docker-build-dev
	rm -rf dist
	mkdir dist
	docker run -p 8000:8000 -v ${PWD}/src:/usr/src/app/src -v ${PWD}/dist:/usr/src/app/dist happa-dev grunt build

# Build the production docker container, which is just an nginx server
# with the files from the dist folder
docker-build-prod:
	docker build -t quay.io/giantswarm/happa -f Dockerfile .

# Run the development environment
# Becomes available at docker.dev:8000
develop:
	@echo
	@echo "-----------------------------------------------------------"
	@echo "Starting Happa development environment using Docker Compose"
	@echo "-----------------------------------------------------------"
	@echo
	docker-compose build
	docker-compose up -d

	@echo
	@echo "---------------------------"
	@echo "Creating a development user"
	@echo "---------------------------"
	@echo
	./dev_fixtures.sh

	@echo
	@echo "------------------------------------------------------------"
	@echo "Happa development environment is running at docker.dev:8000."
	@echo "------------------------------------------------------------"
	@echo

	@echo
	@echo "Please ensure there is an entry in your hosts file that points docker.dev to your docker host"
	@echo "In many cases this will simply be 127.0.0.1"
	@echo

	@echo
	@echo "A development user has been created:"
	@echo "Email: developer@example.com"
	@echo "Password: correct_password"
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
	docker run -ti -p 8000:8000 -p 8080:8080 -v ${PWD}/src:/usr/src/app/src happa-dev npm test

# update dependency images
pull-images:
	docker pull quay.io/giantswarm/desmotes:latest
	docker pull registry.giantswarm.io/giantswarm/domain-validator-worker:latest
	docker pull registry.giantswarm.io/giantswarm/domain-validator:latest
	docker pull registry.giantswarm.io/giantswarm/fake-metrics-node:latest
	docker pull registry.giantswarm.io/giantswarm/fake-metrics-prometheus:latest
	docker pull quay.io/giantswarm/mailcatcher:latest
	docker pull registry.giantswarm.io/giantswarm/mock-api:latest
	docker pull registry.giantswarm.io/giantswarm/mock-hubspot-api:latest
	docker pull quay.io/giantswarm/passage:latest

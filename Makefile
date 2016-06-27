# Default task that Builder will run
# Builds production assets. Builder takes care of building the production container
default: dist

# Build and run the production environment
# becomes available at docker.dev
production: dist docker-build-prod
	docker run -ti -p 80:80 -e API_ENDPOINT=https://api.giantswarm.io -e PASSAGE_ENDPOINT=https://passage.giantswarm.io happa

# Build production assets and save them in the 'dist' folder
dist: docker-build-dev
	rm -rf dist
	mkdir dist
	docker run -p 8000:8000 -v ${PWD}/src:/usr/src/app/src -v ${PWD}/dist:/usr/src/app/dist happa-dev grunt build

# Build the production docker container, which is just an nginx server
# with the files from the dist folder
docker-build-prod:
	docker build -t happa -f Dockerfile .

# Run the development environment
# Becomes available at docker.dev:8000
develop:
	docker-compose build
	docker-compose up

# Build the dev container
docker-build-dev:
	docker build -t happa-dev -f Dockerfile.dev .

# Build the dev container from scratch
docker-clean-build-dev:
	docker build -t happa-dev --no-cache -f Dockerfile.dev .

# Run tests (of which there are non right now)
test: docker-build
	docker run -ti -p 8000:8000 -v ${PWD}/src:/usr/src/app/src happa-dev npm test
develop: docker-build
	docker run -ti -p 8000:8000 -v ${PWD}/src:/usr/src/app/src happa npm start

test: docker-build
	docker run -ti -p 8000:8000 -v ${PWD}/src:/usr/src/app/src happa npm test

docker-build:
	docker build -t happa .

clean-build:
	docker build -t happa --no-cache .

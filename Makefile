all: build
	cd Transcendence/ && docker-compose up -d

build: 
	cd Transcendence/ && docker-compose build

fclean:
	$(MAKE) clean
	docker system prune --force --volumes --all

stop:
	cd Transcendence/ && docker-compose -f docker-compose.yml stop

clean:
	cd Transcendence/ && docker-compose -f docker-compose.yml down -v


re: stop clean build
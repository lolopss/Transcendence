all: build
	cd Trancendance/ && docker-compose up -d

build: 
	cd Trancendance/ && docker-compose build

fclean:
	$(MAKE) clean
	docker system prune --force --volumes --all

stop:
	cd Trancendance/ && docker-compose -f docker-compose.yml stop

clean:
	cd Trancendance/ && docker-compose -f docker-compose.yml down -v


re: stop clean build
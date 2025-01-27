all: build
	cd Transcendence/ && docker-compose up -d

build: 
	cd Transcendence/ && docker-compose build

stop:
	cd Transcendence/ && docker-compose -f docker-compose.yml stop

clean:
	cd Transcendence/ && docker-compose -f docker-compose.yml down -v

fclean: clean
	docker system prune --force --volumes --all

check:
	@echo "\033[031mContainers Status :\n\033[0m"
	@cd Transcendence/ && docker-compose ps
	@echo "\033[031m\n________________________\n\033[0m"
	@echo "\033[031mDocker images :\n\033[0m"
	@docker images
	@echo "\033[031m\n________________________\n\033[0m"

db-users:
	@echo "\033[031mEntering db\033[0m"
	@docker exec -it db psql -U superUser -d db -c "SELECT * FROM auth_user;"
	@echo "\033[031m\n________________________\n\033[0m"
	@echo "\033[031mShow auth_user tables\n\033[0m"


re: stop clean all
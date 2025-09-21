.PHONY: init start stop reset logs

init:
	bash ./script/init.sh

start:
	bash ./script/start.sh

stop:
	bash ./script/stop.sh

reset:
	make stop
	make init
	make start

logs:
	docker compose -f ./docker/docker-compose.yml logs -f

db:
	bash ./script/createDb.sh

migration:
	bash ./script/migration.sh
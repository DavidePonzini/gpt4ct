SHELL := /bin/bash
VENV=./venv
ENV=.env
HTML_DIR='/var/www/html/gpt4ct'

ifeq ($(OS),Windows_NT)
	VENV_BIN=$(VENV)/Scripts
else
	VENV_BIN=$(VENV)/bin
endif

.PHONY: start psql

start: $(ENV)
	docker compose down
	docker compose up -d --build

psql:
	docker exec -it gpt4ct_db psql -U postgres

$(VENV):
	python -m venv $(VENV)
	$(VENV_BIN)/python -m pip install --upgrade -r server/requirements.txt

$(ENV):
	cp $(ENV).template $(ENV)
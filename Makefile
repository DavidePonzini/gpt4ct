SHELL := /bin/bash
VENV=./venv
ENV=.env
HTML_DIR='/var/www/html/gpt4ct'

ifeq ($(OS),Windows_NT)
	VENV_BIN=$(VENV)/Scripts
else
	VENV_BIN=$(VENV)/bin
endif

.PHONY: start start_bg mount

start: mount
	docker compose up -d

mount:
	rm -rf $(HTML_DIR)
#mkdir -p $(HTML_DIR)
	cp -r client $(HTML_DIR)
#sudo mount --bind client $(HTML_DIR)

$(VENV):
	python -m venv $(VENV)
	$(VENV_BIN)/python -m pip install --upgrade -r server/requirements.txt

$(ENV):
	cp $(ENV).template $(ENV)

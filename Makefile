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

start: $(ENV) $(VENV) mount
	sudo service postgresql start
	source $(ENV) && $(VENV_BIN)/python ./server/main.py

start_bg: $(ENV) $(VENV) mount
	sudo service postgresql start
	source $(ENV) && nohup $(VENV_BIN)/python ./server/main.py > log.txt 2>&1 &

mount:
	mkdir -p $(HTML_DIR)
	sudo mount --bind client $(HTML_DIR)

$(VENV):
	python -m venv $(VENV)
	$(VENV_BIN)/python -m pip install --upgrade -r requirements.txt

$(ENV):
	cp $(ENV).template $(ENV)
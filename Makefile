########## Makefile start ##########
# Type: PyPi
# Author: Davide Ponzini

VENV=./venv

ifeq ($(OS),Windows_NT)
	VENV_BIN=$(VENV)/Scripts
else
	VENV_BIN=$(VENV)/bin
endif


venv:
	python -m venv --clear $(VENV)
	$(VENV_BIN)/python -m pip install --upgrade -r requirements.txt


########## Makefile end ##########


SHELL := /bin/bash
HTML_DIR='/var/www/html/gpt4ct'

start: mount venv
	sudo service postgresql start
	source server/SECRET && $(VENV_BIN)/python ./server/main.py

start_bg: mount venv
	sudo service postgresql start
	source server/SECRET && nohup $(VENV_BIN)/python ./server/main.py > log.txt 2>&1 &

mount:
	mkdir -p $(HTML_DIR)
	sudo mount --bind client $(HTML_DIR)
	

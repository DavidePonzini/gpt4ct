SHELL := /bin/bash

start:
	sudo service postgresql start
	source server/SECRET && python ./server/main.py
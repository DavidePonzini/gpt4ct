SHELL := /bin/bash

start:
	sudo service postgresql start
	source server/SECRET && python ./server/main.py

start_bg:
	sudo service postgresql start
	source server/SECRET && nohup python ./server/main.py > log.txt 2>&1 &

update:
	cd client/ && git pull && make
	make

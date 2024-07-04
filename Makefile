SHELL := /bin/bash
HTML_DIR='/var/www/html/gpt4ct'

start: mount
	sudo service postgresql start
	source server/SECRET && python ./server/main.py

start_bg: mount
	sudo service postgresql start
	source server/SECRET && nohup python ./server/main.py > log.txt 2>&1 &

mount:
	mkdir -p $(HTML_DIR)
	sudo mount --bind client $(HTML_DIR)
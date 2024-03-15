DIR=/var/www/html/vis-d3

link-vis:
	rm -f $(DIR)/*
	for f in `ls vis-d3/`; do ln -v vis-d3/$$f $(DIR)/$$f; done

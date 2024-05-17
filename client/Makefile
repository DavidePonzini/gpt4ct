DIR=/var/www/html/problem-decomposition

link-vis:
	rm -rf $(DIR)/*
	
	mkdir -p $(DIR)/api
	for f in `find * -type f`; do ln -v $$f $(DIR)/$$f; done

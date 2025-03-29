FROM postgres:latest

WORKDIR /app

COPY 00-admin.sql docker-entrypoint-initdb.d/
COPY 01-tables.sql docker-entrypoint-initdb.d/
COPY 02-triggers.sql docker-entrypoint-initdb.d/
COPY 03-triggers-solve.sql docker-entrypoint-initdb.d/
COPY 05-tree_view.sql docker-entrypoint-initdb.d/
COPY 06-leaderboard_view.sql docker-entrypoint-initdb.d/
COPY 10-analytical_views.sql docker-entrypoint-initdb.d/
COPY 20-users.sql docker-entrypoint-initdb.d/

COPY 80-user-permissions.sql ./
COPY 90-allow_decomposition.sql ./
COPY 90-allow_implementation.sql ./
COPY 90-block_decomposition.sql ./
COPY 90-block_implementation.sql ./

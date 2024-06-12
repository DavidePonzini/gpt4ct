BEGIN;

DROP USER IF EXISTS problem_decomposition_admin;
CREATE USER problem_decomposition_admin WITH PASSWORD 'decomp';

COMMIT;
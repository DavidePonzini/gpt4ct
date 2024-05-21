BEGIN;

DROP SCHEMA IF EXISTS problem_decomposition CASCADE;
CREATE SCHEMA problem_decomposition;

DROP USER IF EXISTS problem_decomposition_admin;
CREATE USER problem_decomposition_admin WITH PASSWORD 'decomp';
GRANT USAGE ON SCHEMA problem_decomposition TO problem_decomposition_admin;

CREATE TABLE problem_decomposition.decomposition_runs (
  user_id VARCHAR(32) NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  root_task_description VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_description VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  run_date TIMESTAMP NOT NULL DEFAULT NOW(),
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);


CREATE TABLE problem_decomposition.implementation_runs (
  user_id VARCHAR(32) NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  root_task_description VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_description VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  run_date TIMESTAMP NOT NULL DEFAULT NOW(),
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA problem_decomposition TO problem_decomposition_admin;

COMMIT;
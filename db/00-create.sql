BEGIN;

DROP SCHEMA IF EXISTS problem_decomposition CASCADE;
CREATE SCHEMA problem_decomposition;

DROP USER IF EXISTS problem_decomposition_admin;
CREATE USER problem_decomposition_admin WITH PASSWORD 'decomp';
GRANT USAGE ON SCHEMA problem_decomposition TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON TABLES TO problem_decomposition_admin;


CREATE TABLE problem_decomposition.users (
  user_id CHAR(32) PRIMARY KEY
);


CREATE TABLE problem_decomposition.decomposition (
  user_id VARCHAR(32) REFERENCES problem_decomposition.users(user_id) NOT NULL,
  creation_ts TIMESTAMP NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  answer TEXT NOT NULL,
  decomposition_ts TIMESTAMP NOT NULL DEFAULT NOW(),
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);


CREATE TABLE problem_decomposition.implementation_runs (
  user_id VARCHAR(32) REFERENCES problem_decomposition.users(user_id) NOT NULL,
  creation_ts TIMESTAMP NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  implementation_language VARCHAR(64),
  implementation_ts TIMESTAMP NOT NULL DEFAULT NOW(),
  answer TEXT NOT NULL,
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);

CREATE TABLE problem_decomposition.feedback_decomposition (
  user_id VARCHAR(32) REFERENCES problem_decomposition.users(user_id) NOT NULL,
  creation_ts TIMESTAMP NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  tree TEXT NOT NULL,
  q1 DECIMAL(1) NOT NULL,
  q2 DECIMAL(1) NOT NULL,
  q3 DECIMAL(1) NOT NULL,
  q4 DECIMAL(1) NOT NULL,
  comments VARCHAR(2000) NOT NULL,
  feedback_ts TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;
BEGIN;

DROP SCHEMA IF EXISTS problem_decomposition CASCADE;
CREATE SCHEMA problem_decomposition;

DROP USER IF EXISTS problem_decomposition_admin;
CREATE USER problem_decomposition_admin WITH PASSWORD 'decomp';
GRANT USAGE ON SCHEMA problem_decomposition TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON TABLES TO problem_decomposition_admin;


CREATE TABLE problem_decomposition.decomposition_runs (
  user_id VARCHAR(32) NOT NULL,
  root_task_name VARCHAR(1000) NOT NULL,
  root_task_description VARCHAR(1000) NOT NULL,
  task_name VARCHAR(1000) NOT NULL,
  task_description VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  answer TEXT NOT NULL,
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
  answer TEXT NOT NULL,
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);

CREATE VIEW problem_decomposition.costs AS (
  SELECT
    'Decomposition' AS type,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost
  FROM problem_decomposition.decomposition_runs
  UNION
  SELECT
    'Implementation' AS type,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost
  FROM problem_decomposition.implementation_runs
);

CREATE VIEW problem_decomposition.costs2 AS (
  SELECT
    type,
    SUM(prompt_tokens) as prompt_tokens,
    SUM(completion_tokens) as completion_tokens,
    SUM(cost) as cost
  FROM problem_decomposition.costs
  GROUP BY type 
);

COMMIT;
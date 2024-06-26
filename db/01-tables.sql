BEGIN;

DROP SCHEMA IF EXISTS problem_decomposition CASCADE;
CREATE SCHEMA problem_decomposition;

GRANT USAGE ON SCHEMA problem_decomposition TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON TABLES TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON SEQUENCES TO problem_decomposition_admin;


CREATE TABLE problem_decomposition.users (
  user_id VARCHAR(32) PRIMARY KEY
);

CREATE TABLE problem_decomposition.trees (
  -- primary key
  tree_id SERIAL PRIMARY KEY,

  user_id VARCHAR(32) REFERENCES problem_decomposition.users(user_id) NOT NULL,
  creation_ts TIMESTAMP NOT NULL DEFAULT NOW(),
  root_task_name VARCHAR(1000) NOT NULL,

  last_save_ts TIMESTAMP NOT NULL DEFAULT NOW(),
  tree_data TEXT NOT NULL
);

CREATE TABLE problem_decomposition.decompositions (
  -- primary key
  decomposition_id SERIAL PRIMARY KEY,

  tree_id INTEGER REFERENCES problem_decomposition.trees(tree_id) NOT NULL,
  
  decomposition_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  task_name VARCHAR(1000) NOT NULL,
  task_level DECIMAL(2) NOT NULL,
  task_id DECIMAL(2)[] NOT NULL,
  subtasks_amount DECIMAL(2) NOT NULl,
  answer TEXT NOT NULL,

  -- usage
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);

CREATE TABLE problem_decomposition.implementations (
  -- primary key
  implementation_id SERIAL PRIMARY KEY,

  tree_id INTEGER REFERENCES problem_decomposition.trees(tree_id) NOT NULL,
  decomposition_id INTEGER REFERENCES problem_decomposition.decompositions(decomposition_id),

  implementation_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  task_name VARCHAR(1000) NOT NULL,
  task_level DECIMAL(4) NOT NULL,
  task_id DECIMAL(2)[] NOT NULL,
  implementation_language VARCHAR(64),
  answer TEXT NOT NULL,

  -- usage
  prompt_tokens DECIMAL(6) NOT NULL,
  completion_tokens DECIMAL(6) NOT NULL
);

CREATE TABLE problem_decomposition.feedback_decompositions (
  -- primary key
  decomposition_id INTEGER REFERENCES problem_decomposition.decompositions(decomposition_id) NOT NULL,
  user_id VARCHAR(32) REFERENCES problem_decomposition.users(user_id) NOT NULL, -- support feedback by different users

  q1 DECIMAL(1) NOT NULL,
  q2 DECIMAL(1) NOT NULL,
  q3 DECIMAL(1) NOT NULL,
  q4 DECIMAL(1) NOT NULL,
  comments VARCHAR(2000),
  feedback_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY(decomposition_id, user_id)
);


COMMIT;
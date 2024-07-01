BEGIN;

DROP SCHEMA IF EXISTS problem_decomposition CASCADE;
CREATE SCHEMA problem_decomposition;

GRANT USAGE ON SCHEMA problem_decomposition TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON TABLES TO problem_decomposition_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA problem_decomposition GRANT ALL ON SEQUENCES TO problem_decomposition_admin;

SET search_path TO problem_decomposition;


CREATE TYPE task_generation_mode AS ENUM ('manual', 'ai', 'mixed');


CREATE TABLE users (
  user_id VARCHAR(32) PRIMARY KEY,
  credits DECIMAL(10) NOT NULL DEFAULT 0,
  feedback_excellent DECIMAL(5) NOT NULL DEFAULT 0,
  feedback_good DECIMAL(5) NOT NULL DEFAULT 0,
  feedback_received DECIMAL(5) NOT NULL DEFAULT 0,
  feedback_given DECIMAL(5) NOT NULL DEFAULT 0,
  correct_guesses DECIMAL(5) NOT NULL DEFAULT 0,
);

CREATE TABLE trees (
  -- primary key
  tree_id SERIAL PRIMARY KEY,

  user_id VARCHAR(32) REFERENCES users(user_id) NOT NULL,
  creation_ts TIMESTAMP NOT NULL DEFAULT NOW(),
  last_update_ts TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  -- primary key
  task_id SERIAL NOT NULL PRIMARY KEY,

  parent_id INTEGER REFERENCES tasks(task_id) DEFAULT NULL,
  is_edit_from INTEGER REFERENCES tasks(task_id) DEFAULT NULL,

  tree_id INTEGER REFERENCES trees(tree_id) NOT NULL,
  order_n DECIMAL(2),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,

  user_id VARCHAR(32) REFERENCES users(user_id) NOT NULL,
  creation_mode task_generation_mode NOT NULL,
  creation_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  name VARCHAR(1000) NOT NULL,
  description VARCHAR(2000) NOT NULL,

  solved BOOLEAN NOT NULL DEFAULT FALSE,

  -- usage
  tokens_in DECIMAL(6) DEFAULT NULL,
  tokens_out DECIMAL(6) DEFAULT NULL,

  -- order_n = null iff deleted = true 
  CHECK ((deleted = TRUE AND order_n IS NULL) OR (deleted = FALSE AND order_n IS NOT NULL)),

  -- only ai-generated tasks have a cost
  CHECK ((creation_mode = 'ai' AND tokens_in IS NOT NULL AND tokens_out IS NOT NULL) OR (creation_mode <> 'ai' AND tokens_in IS NULL AND tokens_out IS NULL)), 
  
  -- no duplicate order_n for the same parent_id
  UNIQUE (parent_id, order_n)
);

CREATE TABLE implementations (
  -- primary key
  implementation_id SERIAL NOT NULL PRIMARY KEY,

  task_id INTEGER REFERENCES tasks(task_id) NOT NULL,
  is_edit_from INTEGER REFERENCES implementations(implementation_id) DEFAULT NULL,
  additional_prompt VARCHAR(1000) DEFAULT NULL,

  deleted BOOLEAN NOT NULL DEFAULT FALSE,

  user_id VARCHAR(32) REFERENCES users(user_id) NOT NULL,
  
  implementation TEXT NOT NULL,
  implementation_language VARCHAR(64),

  creation_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  -- usage
  tokens_in DECIMAL(6) NOT NULL,
  tokens_out DECIMAL(6) NOT NULL
);

CREATE TABLE feedback_tasks (
  -- primary key
  task_id INTEGER REFERENCES tasks(task_id) NOT NULL,
  user_id VARCHAR(32) REFERENCES users(user_id) NOT NULL,

  creation_mode task_generation_mode NOT NULL, -- ai/manual/mixed
  quality DECIMAL(1) NOT NULL, -- task quality (1-5)
  decomposition_quality DECIMAL(1), -- decomposition quality (1-5 | NULL)
  feedback_ts TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY(task_id, user_id)
);


COMMIT;

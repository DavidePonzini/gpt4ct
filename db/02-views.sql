BEGIN TRANSACTION;

CREATE VIEW problem_decomposition.costs AS (
  SELECT
    'Decomposition' AS type,
    user_id,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost,
    decomposition_ts AS ts
  FROM problem_decomposition.decomposition
  UNION
  SELECT
    'Implementation' AS type,
    user_id,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost,
    implementation_ts AS ts
  FROM problem_decomposition.implementation
);

CREATE VIEW problem_decomposition.costs_per_type AS (
  SELECT
    type,
    SUM(prompt_tokens) as prompt_tokens,
    SUM(completion_tokens) as completion_tokens,
    SUM(cost) as cost
  FROM problem_decomposition.costs
  GROUP BY type 
);

CREATE VIEW problem_decomposition.costs_per_user AS (
  SELECT
    user_id,
    type,
    SUM(prompt_tokens) as prompt_tokens,
    SUM(completion_tokens) as completion_tokens,
    SUM(cost) as cost
  FROM problem_decomposition.costs
  GROUP BY user_id, type
);

CREATE VIEW problem_decomposition.feedback_decomposition_avg AS (
  SELECT
    user_id,
    creation_ts,
    root_task_name,
    AVG(q1) AS q1,
    AVG(q2) AS q2,
    AVG(q3) AS q3,
    AVG(q4) AS q4
  FROM problem_decomposition.feedback_decomposition
  GROUP BY
    user_id,
    creation_ts,
    root_task_name
);


COMMIT;

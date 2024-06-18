BEGIN TRANSACTION;

CREATE OR REPLACE VIEW problem_decomposition.v_costs AS (
  SELECT
    'Decomposition' AS type,
    user_id,
    t.tree_id,
    SUM(prompt_tokens) AS tokens_in,
    SUM(completion_tokens) AS tokens_out,
    SUM(prompt_tokens) / 1000000 * .50 + SUM(completion_tokens) / 1000000 * 1.50 AS cost
  FROM problem_decomposition.decompositions d
    JOIN problem_decomposition.trees t ON t.tree_id = d.tree_id
  GROUP BY
    user_id,
    t.tree_id
  UNION
  SELECT
    'Implementation' AS type,
    user_id,
    t.tree_id,
    SUM(prompt_tokens) AS tokens_in,
    SUM(completion_tokens) AS tokens_out,
    SUM(prompt_tokens) / 1000000 * .50 + SUM(completion_tokens) / 1000000 * 1.50 AS cost
  FROM problem_decomposition.implementations i
    JOIN problem_decomposition.trees t ON t.tree_id = i.tree_id
  GROUP BY
    user_id,
    t.tree_id
);

CREATE OR REPLACE VIEW problem_decomposition.v_costs_per_user AS (
  SELECT
    user_id,
    type,
    SUM(tokens_in) as tokens_in,
    SUM(tokens_out) as tokens_out,
    SUM(cost) as cost
  FROM problem_decomposition.v_costs
  GROUP BY user_id, type
);

CREATE OR REPLACE VIEW problem_decomposition.v_feedback_decomposition_avg AS (
  SELECT
    user_id,
    t.tree_id,
    root_task_name,
    CASE WHEN LENGTH(root_task_name) > 15 THEN SUBSTRING(root_task_name FROM 1 FOR 15) || '...' ELSE root_task_name END AS root_task_name,
    AVG(q1) AS q1,
    AVG(q2) AS q2,
    AVG(q3) AS q3,
    AVG(q4) AS q4,
    COUNT(comments) AS comments,
    COUNT(*) AS amount
  FROM problem_decomposition.feedback_decompositions fd
    JOIN problem_decomposition.decompositions d ON fd.decomposition_id = d.decomposition_id
    JOIN problem_decomposition.trees t ON t.tree_id = d.tree_id
  GROUP BY
    user_id,
    tree_id
);

CREATE OR REPLACE VIEW problem_decomposition.v_latest_trees AS (
  SELECT
    tree_id,
    user_id,
    root_task_name
  FROM problem_decomposition.trees
  ORDER BY tree_id DESC
);

COMMIT;

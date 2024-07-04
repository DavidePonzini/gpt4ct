BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

CREATE OR REPLACE VIEW v_costs AS (
  SELECT
    'Decomposition' AS type,
    user_id,
    SUM(tokens_in) AS tokens_in,
    SUM(tokens_out) AS tokens_out,
    SUM(tokens_in) / 1000000 * .50 + SUM(tokens_out) / 1000000 * 1.50 AS cost
  FROM tasks
  GROUP BY
    user_id
  UNION ALL
  SELECT
    'Implementation' AS type,
    user_id,
    SUM(tokens_in) AS tokens_in,
    SUM(tokens_out) AS tokens_out,
    SUM(tokens_in) / 1000000 * .50 + SUM(tokens_out) / 1000000 * 1.50 AS cost
  FROM implementations
  GROUP BY
    user_id
);

CREATE OR REPLACE VIEW v_tree_summary AS (
  SELECT
    tree_id,
    t.user_id,
    solved,
    CASE WHEN LENGTH(name) > 50 THEN SUBSTRING(name FROM 1 FOR 50) || '...' ELSE name END AS name
  FROM trees t
    JOIN tasks USING(tree_id)
  WHERE
    parent_id IS NULL
  ORDER BY tree_id
);

COMMIT;

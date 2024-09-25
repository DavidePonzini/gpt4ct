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

CREATE OR REPLACE VIEW v_leaves AS (
  SELECT
    t.tree_id,
    COUNT(*)
  FROM v_trees t
  WHERE
    t.task_id NOT IN (
      SELECT tt.parent_id
      FROM v_trees tt
      WHERE
        t.tree_id = tt.tree_id AND
        tt.parent_id IS NOT NULL
      )
  GROUP BY t.tree_id
  ORDER BY t.tree_id
);

COMMIT;

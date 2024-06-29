BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

DROP VIEW IF EXISTS v_trees;

CREATE VIEW v_trees AS
  WITH RECURSIVE tree_cte AS (
    SELECT 
      task_id,
      parent_id,
      tree_id,
      deleted,
      user_id,
      creation_mode,
      creation_ts,
      name,
      description,
      solved,
      0 AS level,
      ARRAY[]::DECIMAL[] AS path
    FROM 
      tasks
    WHERE 
      parent_id IS NULL

    UNION ALL

    SELECT 
      t.task_id,
      t.parent_id,
      t.tree_id,
      t.deleted,
      t.user_id,
      t.creation_mode,
      t.creation_ts,
      t.name,
      t.description,
      t.solved,
      cte.level + 1,
      cte.path || t.order_n
    FROM 
      tasks t
    INNER JOIN 
      tree_cte cte ON t.parent_id = cte.task_id
  )

  SELECT 
    tree_id,
    path,
    level,
    task_id,
    parent_id,
    deleted,
    user_id,
    creation_mode,
    creation_ts,
    name,
    description,
    solved
  FROM 
    tree_cte
  ORDER BY 
    tree_id, path;


COMMIT;

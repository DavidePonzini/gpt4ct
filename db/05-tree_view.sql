BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

DROP VIEW IF EXISTS v_trees;

CREATE VIEW v_trees AS
  WITH RECURSIVE tree_cte AS (
    SELECT 
      task_id,
      parent_id,
      tree_id,
      user_id,
      creation_mode,
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
      t.user_id,
      t.creation_mode,
      t.name,
      t.description,
      t.solved,
      cte.level + 1,
      cte.path || t.order_n
    FROM 
      tasks t
    INNER JOIN 
      tree_cte cte ON t.parent_id = cte.task_id
    WHERE
      t.deleted = FALSE
  )

  SELECT 
    tree_id,
    path,
    level,
    t.task_id,
    parent_id,
    t.user_id AS task_user_id,
    i.user_id as implementation_user_id,
    creation_mode,
    solved,
    name,
    description,
    implementation_id,
    implementation,
    implementation_language
  FROM
    tree_cte t
    LEFT JOIN implementations i ON i.task_id = t.task_id AND (i.deleted = FALSE OR i.deleted IS NULL)
  ORDER BY 
    tree_id, path;


COMMIT;

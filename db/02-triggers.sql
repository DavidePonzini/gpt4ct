BEGIN;

SET search_path TO problem_decomposition;

-- Set order n to null for deleted tasks
CREATE OR REPLACE FUNCTION trg_tasks_deleted_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted = TRUE THEN
    NEW.order_n := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_deleted
BEFORE UPDATE ON tasks
FOR EACH ROW
WHEN (OLD.deleted IS DISTINCT FROM NEW.deleted)
EXECUTE FUNCTION trg_tasks_deleted_update();


-- Recursively solve all subtasks of a task
-- Recursively unsolve all parents of a task
-- Recursively remove all parent implementations of a task
COMMIT;
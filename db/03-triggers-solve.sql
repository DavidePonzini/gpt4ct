BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

-- Trigger function to mark all subtasks as solved
CREATE OR REPLACE FUNCTION mark_subtasks_solved() RETURNS TRIGGER AS $$
BEGIN
    -- Recursively update all subtasks
    UPDATE tasks
    SET solved = TRUE
    WHERE parent_id = NEW.task_id
    AND solved = FALSE;

    -- Recursively apply the trigger to subtasks
    PERFORM mark_subtasks_solved()
    FROM tasks
    WHERE parent_id = NEW.task_id
    AND solved = FALSE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to mark all parent tasks as unsolved
CREATE OR REPLACE FUNCTION mark_parents_unsolved() RETURNS TRIGGER AS $$
BEGIN
    -- Recursively update all parent tasks
    UPDATE tasks
    SET solved = FALSE
    WHERE task_id = NEW.parent_id
    AND solved = TRUE;

    -- Recursively apply the trigger to parent tasks
    PERFORM mark_parents_unsolved()
    FROM tasks
    WHERE task_id = NEW.parent_id
    AND solved = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to mark subtasks as solved when a task is solved
CREATE TRIGGER trg_mark_subtasks_solved
AFTER UPDATE OF solved ON tasks
FOR EACH ROW
WHEN (NEW.solved = TRUE)
EXECUTE FUNCTION mark_subtasks_solved();

-- Trigger to mark parent tasks as unsolved when a task is unsolved
CREATE TRIGGER trg_mark_parents_unsolved
AFTER UPDATE OF solved ON tasks
FOR EACH ROW
WHEN (NEW.solved = FALSE)
EXECUTE FUNCTION mark_parents_unsolved();


COMMIT;

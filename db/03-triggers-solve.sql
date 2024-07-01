BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trg_mark_subtasks_solved ON tasks;
DROP TRIGGER IF EXISTS trg_mark_parents_unsolved ON tasks;
DROP FUNCTION IF EXISTS mark_subtasks_solved();
DROP FUNCTION IF EXISTS mark_parents_unsolved();

-- Trigger function to mark all subtasks as solved
CREATE OR REPLACE FUNCTION mark_subtasks_solved() RETURNS TRIGGER AS $$
BEGIN
    -- Recursively update all subtasks
    UPDATE problem_decomposition.tasks
    SET solved = TRUE
    WHERE parent_id = NEW.task_id
    AND solved = FALSE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to mark all parent tasks as unsolved
CREATE OR REPLACE FUNCTION mark_parents_unsolved() RETURNS TRIGGER AS $$
DECLARE
    parent_task RECORD;
BEGIN
    -- Recursively update all parent tasks
    FOR parent_task IN
        SELECT * FROM problem_decomposition.tasks WHERE task_id = NEW.parent_id
    LOOP
        UPDATE problem_decomposition.tasks
        SET solved = FALSE
        WHERE task_id = parent_task.task_id
        AND solved = TRUE;

        -- Continue the recursion up the hierarchy
        NEW.parent_id := parent_task.parent_id;
        -- PERFORM mark_parents_unsolved();
    END LOOP;

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

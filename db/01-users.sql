BEGIN TRANSACTION;

INSERT INTO problem_decomposition.users(user_id)
VALUES
    ('dav')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
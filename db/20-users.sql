BEGIN TRANSACTION;

INSERT INTO problem_decomposition.users(user_id, credits)
VALUES
    ('dav', 2000),
    ('dev', 999999),
    ('test', 1000),
    ('giovanna', 500),
    ('giorgio', 500),
    ('giovanni', 500),
    ('daniele', 100)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

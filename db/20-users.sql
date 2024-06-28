BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

INSERT INTO users(user_id, credits)
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

BEGIN TRANSACTION;

INSERT INTO problem_decomposition.users(user_id)
VALUES
    ('dav'),
    ('dev'),
    ('test'),
    ('giovanna'),
    ('giorgio'),
    ('giovanni'),
    ('daniele')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

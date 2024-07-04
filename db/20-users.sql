BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

INSERT INTO users(user_id)
VALUES
    ('dav'),
    ('dev'),
    ('test'),
    ('giovanna'),
    ('giorgio'),
    ('user1'),
    ('user2'),
    ('user3'),
    ('user4'),
    ('user5'),
    ('user6'),
    ('user7'),
    ('user8'),
    ('user9'),
    ('user10')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

INSERT INTO users(user_id)
VALUES
    ('dav'),
    ('dev'),
    ('test'),
    ('giovanna'),
    ('giorgio'),
    ('phd1'),
    ('phd2'),
    ('phd3'),
    ('phd4'),
    ('phd5'),
    ('phd6'),
    ('phd7'),
    ('phd8'),
    ('phd9'),
    ('phd10')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

BEGIN TRANSACTION;

INSERT INTO problem_decomposition.users(user_id)
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
    ('phd10'),
    ('phd11'),
    ('phd12'),
    ('phd13'),
    ('phd14'),
    ('phd15')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
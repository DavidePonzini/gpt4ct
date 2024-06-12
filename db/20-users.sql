BEGIN TRANSACTION;

INSERT INTO problem_decomposition.users(user_id)
VALUES
    ('dav'),
    ('dev'),
    ('test'),
    ('giovanna'),
    ('giorgio'),
    ('daniele'),
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
    ('phd15'),
    ('bsc1'),
    ('bsc2'),
    ('bsc3'),
    ('bsc4'),
    ('bsc5'),
    ('bsc6'),
    ('bsc7'),
    ('bsc8'),
    ('bsc9'),
    ('bsc10')
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

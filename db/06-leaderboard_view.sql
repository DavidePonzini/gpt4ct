BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

DROP VIEW IF EXISTS v_leaderboard;

CREATE VIEW v_leaderboard AS
  SELECT
    user_id,
    credits,
    RANK() OVER (ORDER BY credits DESC) AS rank
  FROM
    users
  ORDER BY
    rank ASC;


COMMIT;

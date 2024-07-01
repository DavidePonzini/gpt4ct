BEGIN TRANSACTION;

SET search_path TO problem_decomposition;

DROP VIEW IF EXISTS v_leaderboard;

CREATE VIEW v_leaderboard AS
  SELECT
    DENSE_RANK() OVER (ORDER BY credits DESC) AS rank,
    user_id,
    credits,
    feedback_given,
    feedback_received,
    feedback_excellent,
    feedback_good,
    correct_guesses
  FROM
    users
  ORDER BY
    rank ASC;


COMMIT;

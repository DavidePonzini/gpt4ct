BEGIN TRANSACTION;

CREATE VIEW problem_decomposition.costs AS (
  SELECT
    'Decomposition' AS type,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost
  FROM problem_decomposition.decomposition_runs
  UNION
  SELECT
    'Implementation' AS type,
    prompt_tokens,
    completion_tokens,
    prompt_tokens / 1000000 * .50 + completion_tokens / 1000000 * 1.50 AS cost
  FROM problem_decomposition.implementation_runs
);

CREATE VIEW problem_decomposition.costs2 AS (
  SELECT
    type,
    SUM(prompt_tokens) as prompt_tokens,
    SUM(completion_tokens) as completion_tokens,
    SUM(cost) as cost
  FROM problem_decomposition.costs
  GROUP BY type 
);

COMMIT;

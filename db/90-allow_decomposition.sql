UPDATE problem_decomposition.users
SET can_generate_decomposition = TRUE
WHERE user_id like 'user%';
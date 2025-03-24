UPDATE problem_decomposition.users
SET can_generate_decomposition = FALSE
WHERE user_id like 'user%';
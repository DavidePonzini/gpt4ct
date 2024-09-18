UPDATE problem_decomposition.users
SET can_generate_decomposition = TRUE
WHERE NOT user_id like 'user%';
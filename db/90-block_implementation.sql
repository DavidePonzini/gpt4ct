UPDATE problem_decomposition.users
SET can_generate_implementation = FALSE
WHERE NOT user_id like 'user%';
SELECT
    user_id,
    can_generate_decomposition,
    can_generate_implementation
FROM problem_decomposition.users
ORDER BY user_id;
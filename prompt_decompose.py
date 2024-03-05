def make_prompt(problem, node, task):
    return f'''-- Context --
Students will provide you with a problem decomposition step.
Your task is to provide them with feedback to help them identify possible mistakes or misconceptions, if there are any.
Students should be encouraged to reason and learn the solution on their own.

-- Problem description --
{problem}

-- Previous decomposition proposed by student  --
{node.to_str()}

-- Current task --
{task.name}

-- Instruction --
Keeping in mind the decomposition already proposed by the student, break the given task into two or three smaller subtasks.
Each subtask must be simpler to solve than the main task.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.
'''

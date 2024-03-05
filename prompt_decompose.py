import json

def make_prompt(root, current_task):
    return f'''-- Context --
Students will provide you with a problem decomposition step.
Your task is to provide them with feedback to help them identify possible mistakes or misconceptions, if there are any.
Students should be encouraged to reason and learn the solution on their own.

-- Problem description --
{root.description}

-- Previous decomposition proposed by student (in JSON format)  --
{json.dumps(root.to_dict())}

-- Current task --
{current_task.name}

-- Instruction --
Keeping in mind the decomposition already proposed by the student, break the current  task into the smallest possible number of smaller subtasks (usually two or three).
For each subtask, provide a name as well as a description, similar to the one provided for the main problem.
If no reasonable decomposition can be made, state so.
Each subtask must be simpler to solve than the main task.
A subtask at level `n+1` of a given task of level `n` should not include any elements of other tasks at level `n`.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.
The results should be formatted in JSON. Each subtask should contain the fields name and description
'''

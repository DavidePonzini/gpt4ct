import json

def make_prompt(root, current_task):
    return f'''-- Problem description --
{root.description}

-- Instruction --
Decompose the current task into the smallest possible number of smaller subtasks (usually two or three).
For each subtask, provide a name as well as a description, similar to the one provided for the main problem.
If no reasonable decomposition can be made, state so.
Each subtask must be simpler to solve than the main task.
A subtask at level `n+1` of a given task of level `n` should not include any elements of other tasks at level `n`.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.
The results should be formatted as a JSON list of objects. Each object should contain the fields name and description.
'''

def make_followup_prompt():
    return f'Using the same approach, decompose the task ""'
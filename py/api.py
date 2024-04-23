from openai import OpenAI

client = OpenAI()


def make_first_prompt(problem):
    return {
        'role': 'user',
        'content': f'-- Problem description --\n{problem}'
    }

def make_followup_prompt(task):
    return {
        'role': 'user',
        'content': f'Using the same approach, decompose the task "{task}"'
    }

system_prompt = {
    'role': 'system',
    'content': '''Decompose the current task into the smallest possible number of smaller subtasks (usually two or three).
For each subtask, provide a name as well as a description, similar to the one provided for the main problem.
If no reasonable decomposition can be made, state so.
Each subtask must be simpler to solve than the main task.
A subtask at level `n+1` of a given task of level `n` should not include any elements of other tasks at level `n`.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.
The results should be formatted as a JSON list of objects. Each object should contain the fields name and description.
'''
    }

def make_answer_prompt(answer):
    return {
        'role': 'assistant',
        'content': answer
    }

completion = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    system_prompt,
    make_first_prompt('Write a python program to find the most trending videos, given a csv file containing each visualization'),
    make_answer_prompt('{\n  "subtasks": [\n    {\n      "name": "Read data from a CSV file",\n      "description": "Write a Python program to read data from a CSV file containing information about trending videos, such as video ID, title, views, etc."\n    },\n    {\n      "name": "Identify the most trending videos",\n      "description": "Analyze the data read from the CSV file to determine the most trending videos based on the number of views or any other relevant criteria."\n    }\n  ]\n}'),
    make_followup_prompt('Identify the most trending videos'),
  ],
  response_format={'type': 'json_object'}
)

print(completion)
print()
print(completion.choices[0].message.content)
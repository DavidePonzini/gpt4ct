from dav_tools import messages

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

def make_answer_prompt(answer):
    return {
        'role': 'assistant',
        'content': answer
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

prompt1 = make_first_prompt('Write a python program to find the most trending videos, given a csv file containing each visualization')
answer1 = make_answer_prompt('{\n  "subtasks": [\n    {\n      "name": "Read data from a CSV file",\n      "description": "Write a Python program to read data from a CSV file containing information about trending videos, such as video ID, title, views, etc."\n    },\n    {\n      "name": "Identify the most trending videos",\n      "description": "Analyze the data read from the CSV file to determine the most trending videos based on the number of views or any other relevant criteria."\n    }\n  ]\n}')
followup1 = make_followup_prompt('Identify the most trending videos')


# Create assistant
# assistant = client.beta.assistants.create(
#   model="gpt-3.5-turbo",
#   instructions=system_prompt['content'],
#   name='Problem Decomposer',
# #   messages=[
# #     system_prompt,
# #     prompt1,
# #     answer1,
# #     followup1,
# #   ],
#   response_format={'type': 'json_object'}
# )

messages.info('Retrieving assistant')
assistant = client.beta.assistants.retrieve('asst_nDAssQVwXvOXK4RPeaLlncIn')

messages.info('Creating thread')
thread = client.beta.threads.create()

messages.info('Creating message')
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role='user',
    content=prompt1['content']
)

def create_message(thread_id, role, content):
    return client.beta.threads.messages.create(
        thread_id=thread_id,
        role=role,
        content=content
    )

def create_first_message(problem):
    return create_message(thread.id, 'user', f'-- Problem description --\n{problem}')

def create_followup_message(task):
    return create_message(thread.id, 'user', f'Using the same approach, decompose the task "{task}"')

messages.info('Running thread')
run = client.beta.threads.runs.create_and_poll(
    thread_id=thread.id,
    assistant_id=assistant.id
)

if run.status == 'completed': 
    messages.success('Run completed')
else:
    messages.error(run.status)





def print_thread():
    msgs = client.beta.threads.messages.list(thread.id)
   
    for msg in msgs.data:
        messages.message(msg.content[0].text.value, icon='>', icon_options=[messages.TextFormat.Color.PURPLE, messages.TextFormat.Style.BOLD])
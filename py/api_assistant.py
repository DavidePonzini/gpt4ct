from dav_tools import messages
from openai import OpenAI
import json

client = OpenAI()


def get_decomposition_assistant(assistant_id):
    messages.info('Retrieving assistant')
    return client.beta.assistants.retrieve(assistant_id)

def create_thread():
    messages.info('Creating thread')
    return client.beta.threads.create()

def get_thread(thread_id):
    messages.info('Retrieving thread')
    return client.beta.threads.retrieve(thread_id)

def create_message(thread, role, content):
    messages.info('Creating message')
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role=role,
        content=content
    )

def create_first_message(thread, problem):
    create_message(thread, 'user', f'-- Problem description --\n{json.dumps({"name": problem, "description": problem})}')

def create_followup_message(thread, task):
    create_message(thread, 'user', f'Using the same approach, decompose the task "{task}"')

def run_thread(thread, assistant):
    messages.progress('Running thread...')
    run = client.beta.threads.runs.create_and_poll(thread_id=thread.id, assistant_id=assistant.id)
    messages.message(f'Cost: {run.usage}', icon='$', icon_options=[messages.TextFormat.Color.BLUE])

    if run.status == 'completed': 
        messages.success('Run completed')
    else:
        messages.error(run.status)

    return run

def print_thread(thread):
    msgs = client.beta.threads.messages.list(thread.id)
   
    for msg in msgs.data:
        messages.message(msg.content[0].text.value, icon=msg.role[0],
                         icon_options=[
                             messages.TextFormat.Color.PURPLE if msg.role == 'user' else messages.TextFormat.Color.YELLOW
                         ])


assistant = get_decomposition_assistant('asst_nDAssQVwXvOXK4RPeaLlncIn')
thread = get_thread('thread_0QKYAFnS7bIU3RZutHEeSO9Y')
# thread = create_thread()
# message = create_first_message(thread, 'Write a python program to find the most trending videos, given a csv file containing each visualization')
# run = run_thread(thread, assistant)
print_thread(thread)


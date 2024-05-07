from dav_tools import messages
from openai import OpenAI

client = OpenAI()


assistant_instructions = '''Decompose the current task into the smallest possible number of subtasks (usually two or three). You must produce at least two subtasks.

For each subtask, provide a name as well as a description, similar to the one provided for the main problem.

Each subtask must be simpler to solve than the main task.
A subtask of a given task, should not include any elements of other tasks at the same level of decomposition.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.

Format the result in JSON: provide a list of objects such as this: {"result": [{"name":"subtask 1 name", "description": "subtask 1 description"}, ...]}
'''

# Create assistant
# assistant = client.beta.assistants.create(
#   model="gpt-3.5-turbo",
#   instructions=assistant_instructions,
#   name='Problem Decomposer',
#   response_format={'type': 'json_object'}
# )
# messages.success('Created assistant', assistant.id)

# Modify assistant
# assistant = client.beta.assistants.update(
#     assistant_id='asst_FTCjLwGwVPksSPGLPTGgvQ66',
#     instructions=assistant_instructions
# )
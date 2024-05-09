from dav_tools import messages
from openai import OpenAI
import json

client = OpenAI()


instructions = '''Decompose the current task into the smallest possible number of subtasks (usually two or three). You must produce at least two subtasks.

For each subtask, provide a name as well as a description, similar to the one provided for the main problem.

Each subtask must be simpler to solve than the main task.
A subtask of a given task, should not include any elements of other tasks at the same level of decomposition.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.

Format the result in JSON: provide a list of objects such as this: {"result": [{"name":"subtask 1 name", "description": "subtask 1 description"}, ...]}
'''

class Message:
    def __init__(self) -> None:
        self.messages = []
        self.add_message('system', instructions)

    def add_message(self, role: str, message):
        self.messages.append({
            'role': role,
            'content': message
        })

    def generate_answer(self):
        messages.progress('Generating answer')
        completion = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=self.messages,
            response_format={
                'type': 'json_object'
            }
        )

        messages.info('Generated answer')
        print_price(completion.usage)

        self.add_response(completion.choices[0].message.content)

    def add_first_message(self, name, description):
        self.add_message('user', f'-- Problem description --\n{json.dumps({"name": name, "description": description})}')

    def add_followup_message(self, task):
        self.add_message('user', f'Using the same approach, decompose the task "{task}"')

    def add_response(self, response):
        self.add_message('assistant', response)

    def print(self):
        for i in range(len(self.messages)-1, -1, -1):
            message = self.messages[i]

            role = message['role']
            if role == 'system':
                color = messages.TextFormat.Color.BLUE
            elif role == 'assistant':
                color = messages.TextFormat.Color.PURPLE
            else:
                color = messages.TextFormat.Color.YELLOW

            messages.message(message['content'], icon=message['role'][0],
                            icon_options=[color], default_text_options=[
                                color,
                                None if message['role'] == 'user' else messages.TextFormat.Style.ITALIC
                            ])

def print_price(usage):
    cost_in = usage.prompt_tokens / 1_000_000 * 0.50
    cost_out = usage.completion_tokens / 1_000_000 * 1.50
    messages.message(f'Cost: {(cost_in + cost_out):.5f} $ (in={usage.prompt_tokens}, out={usage.completion_tokens})',
                     icon='$', icon_options=[messages.TextFormat.Color.BLUE])
    
    

if __name__ == '__main__':
    message = Message()
    message.add_first_message('Download and store a webpage', 'Write a python program to download and store a webpage')
    message.generate_answer()
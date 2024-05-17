from dav_tools import messages
from openai import OpenAI
import json

client = OpenAI()


class Message:
    def __init__(self) -> None:
        self.messages = []

    def add_message(self, role: str, message):
        self.messages.append({
            'role': role,
            'content': message
        })

    def generate_answer(self, require_json=True):
        messages.progress('Generating answer...')
        completion = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=self.messages,
            response_format={
                'type': 'json_object' if require_json else 'text'
            }
        )

        messages.info('Generated answer')
        print_price(completion.usage)

        answer = completion.choices[0].message.content
        # self.add_message('assistant', answer)

        return answer

    def print(self):
        for message in self.messages:

            role = message['role']
            if role == 'system':
                color = messages.TextFormat.Color.RED
            elif role == 'assistant':
                color = messages.TextFormat.Color.YELLOW
            else:
                color = messages.TextFormat.Color.CYAN

            messages.message(message['content'], icon=message['role'],
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
    message.add_decomposition_first_message('Download and store a webpage', 'Write a python program to download and store a webpage')
    message.generate_answer()
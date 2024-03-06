import json
from dav_tools import text_format

class Task:
    def __init__(self, name, description, id='') -> None:
        self.id = id
        self.name = name
        self.description = description
        self.lvl = len(self.id)
        self.tasks = []

    def format_descr(self, size):
        words = self.description.split()
        current_line = words[0]
        result = ''

        for word in words:
            if len(current_line) + len(word) > size:
                result += '\n' + current_line
                current_line = word
            else:
                current_line += ' ' + word

        result += current_line
        return result

    def decompose(self, *tasks):
        for i, (name, descr) in enumerate(tasks):
            subtask = Task(name, descr, f'{self.id}{i}')
            self.tasks.append(subtask)
        return self.tasks

    def decompose_json(self, tasks: list):
        for i, task in enumerate(tasks):
            subtask = Task(task['name'], task['description'], f'{self.id}{i}')
            self.tasks.append(subtask)
        return self.tasks

    def __str__(self) -> str:
        result = text_format.format_text('|\t' * self.lvl + f'[{self.id}]', text_format.TextFormat.Style.DIM) + \
            f' {self.name}'
        
        for subtask in self.tasks:
            result += '\n' + str(subtask)

        return result

    # textual decomposition format - does not work very well
    def get_decomposition(self) -> str:
        result = self.name + '('

        for i, subtask in enumerate(self.tasks):
            result += subtask.get_decomposition()
            if i < len(self.tasks) - 1:
                result += ' + '

        result += ')'
        return result

    # used to convert to JSON
    def to_dict(self) -> str:
        return {
            'name': self.name,
            # 'description': self.description,
            'subtasks': [ task.to_dict() for task in self.tasks ]
        }
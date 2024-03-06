import json

class Task:
    def __init__(self, name, description, lvl=0) -> None:
        self.name = name
        self.description = description
        self.lvl = lvl
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

    def decompose(self, *tasks, j=None):
        for (name, descr) in tasks:
            subtask = Task(name, descr, self.lvl+1)
            self.tasks.append(subtask)

        if j is not None:
            for subtask in j:
                self.tasks.append(Task(subtask['name'], subtask['description'], self.lvl+1))

        return self.tasks

    def __str__(self) -> str:
        result = '\t' * self.lvl + self.name

        for subtask in self.tasks:
            result += '\n' + str(subtask)

        return result

    def get_decomposition(self) -> str:
        result = self.name + '('
        

        for i, subtask in enumerate(self.tasks):
            result += subtask.get_decomposition()
            if i < len(self.tasks) - 1:
                result += ' + '

        result += ')'
        return result

    def to_dict(self) -> str:
        return {
            'name': self.name,
            # 'description': self.description,
            'subtasks': [ task.to_dict() for task in self.tasks ]
        }
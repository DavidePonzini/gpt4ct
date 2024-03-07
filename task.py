from dav_tools import text_format

class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, name, description, id='') -> None:
        self.id = id
        self.name = name
        self.description = description
        self.lvl = len(self.id)
        self.tasks = []

    def format_descr(self, size):
        '''Format the description to have lines of a max given length'''
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

    def decompose(self, tasks: list[dict[str, str]]) -> list:
        '''
        Decompose the current task in subtasks
        :param tasks: list of dictionaries, each containing "name" and "description"

        :return: the list of subtasks
        '''
        for i, task in enumerate(tasks):
            subtask = Task(task['name'], task['description'], f'{self.id}{i}')
            self.tasks.append(subtask)
        return self.tasks

    def to_indented_list(self) -> str:
        '''Convert current task and subtasks to an indented list'''
        result = text_format.format_text('|\t' * self.lvl + f'[{self.id}]', text_format.TextFormat.Style.DIM) + \
            f' {self.name}'
        
        for subtask in self.tasks:
            result += '\n' + subtask.to_list()

        return result

    def to_text_decomposition(self) -> str:
        '''Textual decomposition format - does not work very well'''
        result = self.name + '('

        for i, subtask in enumerate(self.tasks):
            result += subtask.get_decomposition()
            if i < len(self.tasks) - 1:
                result += ' + '

        result += ')'
        return result

    def to_dict(self) -> str:
        '''
        Convert current task and subtasks to a dictionary, ready for JSON format conversion
        '''
        return {
            'name': self.name,
            # 'description': self.description,
            'subtasks': [ task.to_dict() for task in self.tasks ]
        }
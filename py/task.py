from dav_tools import text_format

class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, name, description) -> None:
        self.name = name
        self.description = description
        self.lvl = 0
        self.subtasks = []
        self.implementation = None
        self.parent = None

    def to_dict(self) -> str:
        '''
        Convert current task and subtasks to a dictionary, ready for JSON format conversion
        '''
        return {
            'name': self.name,
            'description': self.description,
            'id': self.id,
            'subtasks': [ subtask.to_dict() for subtask in self.subtasks ],
            'implementation': self.implementation
        }
    
    
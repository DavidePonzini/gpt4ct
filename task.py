class Task:
    def __init__(self, name, lvl=0) -> None:
        self.name = name
        self.lvl = lvl
        self.task1 = None
        self.task2 = None

    def decompose(self, task1: str, task2: str):
        self.task1 = Task(task1, self.lvl+1)
        self.task2 = Task(task2, self.lvl+1)
 
        return self.task1, self.task2

    def __str__(self) -> str:
        if self.task1 is None:
            return '\t' * self.lvl + self.name
        return '\t' * self.lvl + self.name + '\n' + str(self.task1) + '\n' + str(self.task2)

    def to_str(self) -> str:
        if self.task1 is None:
            return self.name
        return f'{self.name}({self.task1.to_str()} & {self.task2.to_str()})'

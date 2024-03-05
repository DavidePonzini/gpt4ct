from task import Task    
from prompt_decompose import make_prompt
# from prompt_evaluate import make_prompt
import problems

from dav_tools import argument_parser, ArgumentAction, messages
import pyperclip

problem = problems.bicycle
task = Task('Solve the whole problem')

# brackets, result = task.decompose('Insert the brackets', 'Print the result')
# position, brackets2 = brackets.decompose('Determine where to insert the brackets', 'Insert the brackets in the correct positions')
# oddeven, starting = position.decompose('Determine if the string length is odd or even', 'Determine the starting point')
# brackets2.decompose('Insert the left bracket', 'Insert the right bracket')  # this inserts only a set of brackets


if __name__ == '__main__':
    argument_parser.add_argument('--prompt', help='Print ChatGPT prompt', action=ArgumentAction.STORE_TRUE)
    
    if argument_parser.args.prompt:
        prompt = make_prompt(problem, task, task)
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')
    else:
        print(task)

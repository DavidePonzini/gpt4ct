from task import Task    
from prompt_decompose import make_prompt
from visualization import show_tree
from problem_bicycle import *

from dav_tools import argument_parser, ArgumentAction, messages
import pyperclip


if __name__ == '__main__':
    argument_parser.add_argument('--prompt', help='Print ChatGPT prompt', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--visualize', help='Visualize tree', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--list', help='Visualize in list format', action=ArgumentAction.STORE_TRUE)
    
    if argument_parser.args.visualize:
        show_tree(root_task)
    if argument_parser.args.prompt:
        prompt = make_prompt(root_task, sub1[2])
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')
    if argument_parser.args.list:
        print(root_task)

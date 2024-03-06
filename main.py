from task import Task    
from prompt_decompose import make_prompt
from visualization import show_tree
from problem_bicycle_conversation import *

from dav_tools import argument_parser, ArgumentAction, messages
import pyperclip


if __name__ == '__main__':
    argument_parser.add_argument('--prompt', help='Print ChatGPT prompt', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--tree', help='Visualize tree', nargs='?', const=100, metavar='DEPTH', type=int)
    argument_parser.add_argument('--list', help='Visualize in list format', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--out', help='Output file')
    
    if argument_parser.args.tree:
        show_tree(root_task, depth=argument_parser.args.tree)

    if argument_parser.args.prompt:
        prompt = make_prompt(root_task, root_task)
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')
    
    if argument_parser.args.list:
        print(root_task)

    if argument_parser.args.out:
        show_tree(root_task, filename=argument_parser.args.out)

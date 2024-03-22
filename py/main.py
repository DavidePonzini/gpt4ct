from prompt_decompose import make_prompt, make_followup_prompt
from visualization import show_tree, build_tree
from problem_movies_conversation import *

from dav_tools import argument_parser, ArgumentAction, messages
import pyperclip
import json


if __name__ == '__main__':
    argument_parser.add_argument('--tree', help='Visualize tree', nargs='?', const=100, metavar='DEPTH', type=int)
    argument_parser.add_argument('--out', help='Output file')
    argument_parser.add_argument('--prompt', help='Print ChatGPT prompt', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--follow-up-prompt', help='Print ChatGPT follow-up prompt', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--text', help='Visualize in text format', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--json', help='Visualize in JSON format', action=ArgumentAction.STORE_TRUE)
    
    if argument_parser.args.tree:
        tree = build_tree(root_task, depth=argument_parser.args.tree)
        show_tree(tree)

    if argument_parser.args.out:
        tree = build_tree(root_task)
        show_tree(tree, filename=argument_parser.args.out)
                  
    if argument_parser.args.prompt:
        prompt = make_prompt(root_task, root_task)
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')

    if argument_parser.args.follow_up_prompt:
        prompt = make_followup_prompt()
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')
    
    if argument_parser.args.text:
        print(root_task.to_text_decomposition())

    if argument_parser.args.json:
        print(json.dumps(root_task.to_dict()))


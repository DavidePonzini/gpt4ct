from task import Task    
from prompt_decompose import make_prompt
import problems
from visualization import show_tree

from dav_tools import argument_parser, ArgumentAction, messages
import pyperclip

problem = problems.bicycle
root_task = Task('Solve the whole problem', problem)
sub = root_task.decompose(j = [
  {
    "name": "Research bicycle components and design principles",
    "description": "Gather information on various bicycle components such as frame, wheels, gears, brakes, etc. Study design principles and considerations related to bicycle engineering and ergonomics."
  },
  {
    "name": "Create a detailed design plan",
    "description": "Based on the research, develop a comprehensive plan outlining the specifications, dimensions, materials, and assembly process for each component of the bicycle."
  },
  {
    "name": "Prototype construction",
    "description": "Construct a prototype of the bicycle according to the design plan. This involves fabricating or acquiring the necessary components and assembling them into a functional bicycle."
  }
])

sub1 = sub[1].decompose(j = [
  {
    "name": "Specify bicycle frame design",
    "description": "Define the dimensions, geometry, and material specifications for the bicycle frame based on research and ergonomic considerations."
  },
  {
    "name": "Design bicycle wheel assembly",
    "description": "Develop a detailed plan for the construction of bicycle wheels, including selecting appropriate rims, spokes, and hubs, and determining the optimal tire size and type."
  },
  {
    "name": "Plan bicycle component integration",
    "description": "Outline how the various components such as gears, brakes, pedals, and handlebars will be integrated into the bicycle frame, ensuring functionality and ergonomic comfort."
  }
])


if __name__ == '__main__':
    argument_parser.add_argument('--prompt', help='Print ChatGPT prompt', action=ArgumentAction.STORE_TRUE)
    argument_parser.add_argument('--visualize', help='Visualize tree', action=ArgumentAction.STORE_TRUE)
    
    if argument_parser.args.visualize:
        show_tree(root_task)

    if argument_parser.args.prompt:
        prompt = make_prompt(root_task, sub1[0])
        
        print(prompt)

        pyperclip.copy(prompt)
        messages.info('Prompt copied to clipboard')
    else:
        print(root_task)

from chatgpt import Message, print_price
import database
from task import Task
import json
import prompts


def decompose(task: Task):
    message = Message()
    message.add_message('system', prompts.Decomposition.instructions)
    
    # Add all parents, up to root
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    
    # Add request for next task
    message.add_message('user', prompts.Decomposition.prompt(task))
    message.print()

    answer = message.generate_answer(require_json=True, add_to_messages=False)
    
    usage = message.usage[-1]
    database.log_usage_decomposition(task, answer, usage)
    print_price(usage)
    
    return answer

def implement(task: Task):
    message = Message()
    message.add_message('system', prompts.Decomposition.instructions)

    # Add all parents, up to root, and all childrens
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    task.for_each_child(lambda t: _add_decomposition_step(message, t))

    # Add implementation instructions
    message.add_message('system', prompts.Implementation.instructions)

    # Add all children's implementations
    task.for_each_child(lambda t: _add_implementation_step(message, t))

    # Ask for final implemenation
    message.add_message('user', prompts.Implementation.prompt(task))
    message.print()

    # Get the result
    answer = message.generate_answer(require_json=False, add_to_messages=False)

    usage = message.usage[-1]
    database.log_usage_implementation(task, answer, usage)
    print_price(usage)

    return json.dumps({
        'implementation': answer
    })

def _add_decomposition_step(message: Message, t: Task):
    '''
    Add a two-message step for the decomposition of node `t`.
    Messages include both the user's prompt and the assistant's answer containing all `t`'s subtasks
    '''

    message.add_message('user', prompts.Decomposition.prompt(t))
    message.add_message('assistant', json.dumps({
        'result': [
            {
                'name': subtask.name,
                'description': subtask.description
            } for subtask in t.subtasks
        ]
    }))


def _add_implementation_step(message: Message, t: Task):
    '''
    Add a two-message step for the decomposition of node `t`.
    Messages include both the user's prompt and the assistant's answer containing all `t`'s subtasks
    '''

    message.add_message('user', prompts.Implementation.prompt(t))
    message.add_message('assistant', t.implementation)

from chatgpt import Message, print_price
import database
from task import Task
import json
import prompts


def decompose(tree_id: int, user_id: str, task: Task):
    message = Message()
    message.add_message('system', prompts.Decomposition.instructions)
    
    # Add all parents, up to root
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    
    # Add request for next task
    message.add_message('user', prompts.Decomposition.prompt(task))
    # message.print()

    answer_json = message.generate_answer(require_json=True, add_to_messages=False)
    answer = json.loads(answer_json)
    subtasks = answer['result']

    usage = message.usage[-1]
    decomposition_id, tree_id = database.log_decomposition(
        tree_id=tree_id,
        user_id=user_id,
        task=task,
        subtasks_amount=len(subtasks),
        answer=answer_json,
        usage=usage
    )

    print_price(usage)

    return {
        'subtasks': subtasks,
        'decomposition_id': decomposition_id,
        'tree_id': tree_id,
    }

def implement(tree_id: int, user_id: str, task: Task, language: str):
    message = Message()
    message.add_message('system', prompts.Decomposition.instructions)

    # Add all parents, up to root, and all childrens
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    task.for_each_child(lambda t: _add_decomposition_step(message, t),
                        where=lambda t: len(t.subtasks) > 0)

    # Add implementation instructions
    message.add_message('system', prompts.Implementation.instructions)

    # Add siblings' implementations
    task.for_each_sibling(lambda t: _add_implementation_step(message, t, t.implementation_language), 
                          where=lambda t: t.implementation is not None and t.implementation != False)

    # Add children implementations
    task.for_each_child(lambda t: _add_implementation_step(message, t, t.implementation_language),
                        where=lambda t: t.implementation != False)

    # Ask for final implemenation
    message.add_message('user', prompts.Implementation.prompt(task, language))
    # message.print()

    # Get the result
    answer = message.generate_answer(require_json=False, add_to_messages=False)

    usage = message.usage[-1]
    implementation_id, tree_id = database.log_implementation(
        tree_id=tree_id,
        task=task,
        language=language,
        answer=answer,
        usage=usage)
    
    print_price(usage)

    return {
        'implementation': answer,
        'implementation_id': implementation_id,
        'tree_id': tree_id,
    }

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


def _add_implementation_step(message: Message, t: Task, language: str):
    '''
    Add a two-message step for the decomposition of node `t`.
    Messages include both the user's prompt and the assistant's answer containing all `t`'s subtasks
    '''

    if t.implementation == False:
        return        

    message.add_message('user', prompts.Implementation.prompt(t, language))
    message.add_message('assistant', t.implementation)

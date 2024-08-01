import database
from task import Task, TaskCreationMode
import json
import prompts
from dav_tools.chatgpt import Message, print_price, MessageRole, AIModel


cost_in = .15
cost_out = .6

def decompose(task: Task, user_id: str) -> None:
    message = Message()
    message.add_message(MessageRole.SYSTEM, prompts.Decomposition.instructions)
    
    # Add all parents, up to root
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    
    # Add request for next task
    message.add_message('user', prompts.Decomposition.prompt(task))
    # message.print()

    answer_json = message.generate_answer(require_json=True, add_to_messages=False, model=AIModel.GPT4o_mini)
    answer = json.loads(answer_json)
    subtasks = answer['result']

    usage = message.usage[-1]

    # add subtasks to tree
    database.set_children_of_task(
        user_id=user_id,
        parent_id=task.task_id,
        tasks=[{
            'name': subtask['name'],
            'description': subtask['description'],
            'task_id': None,
        } for subtask in subtasks],
        new_task_creation_mode=TaskCreationMode.AI,
        tokens=(usage.prompt_tokens, usage.completion_tokens),
    )

    print_price(usage, cost_in, cost_out)


def implement(task: Task, user_id: str, language: str, additional_prompt: str | None = None) -> None:
    message = Message()
    message.add_message(MessageRole.SYSTEM, prompts.Decomposition.instructions)

    # Add all parents, up to root, and all childrens
    task.for_each_parent(lambda t: _add_decomposition_step(message, t))
    task.for_each_child(lambda t: _add_decomposition_step(message, t),
                        where=lambda t: len(t.subtasks) > 0)

    # Add implementation instructions
    message.add_message(MessageRole.SYSTEM, prompts.Implementation.instructions)

    # Add siblings' implementations
    task.for_each_sibling(lambda t: _add_implementation_step(message, t, t.implementation_language), 
                          where=lambda t: t.implementation is not None)

    # Add children implementations
    task.for_each_child(lambda t: _add_implementation_step(message, t, t.implementation_language),
                        where=lambda t: t.implementation is not None)

    # Ask for this task's implementation
    message.add_message(MessageRole.USER, prompts.Implementation.prompt(task, language))

    # If this task has already been implemented, add its implementation and the additional request
    if additional_prompt is not None and task.implementation is not None:
        message.add_message(MessageRole.ASSISTANT, task.implementation)
        message.add_message(MessageRole.USER, prompts.Implementation.prompt_refine(task, language, additional_prompt))

    # message.print()

    # Get the result
    answer = message.generate_answer(require_json=False, add_to_messages=False, model=AIModel.GPT4o_mini)

    task.implementation = answer
    usage = message.usage[-1]
    
    database.set_implementation(
        task=task,
        user_id=user_id,
        implementation=answer,
        language=language,
        additional_prompt=additional_prompt,
        tokens=(usage.prompt_tokens, usage.completion_tokens),
    )

    print_price(usage, cost_in, cost_out)


def _add_decomposition_step(message: Message, t: Task):
    '''
    Add a two-message step for the decomposition of node `t`.
    Messages include both the user's prompt and the assistant's answer containing all `t`'s subtasks
    '''

    message.add_message(MessageRole.USER, prompts.Decomposition.prompt(t))
    message.add_message(MessageRole.ASSISTANT, json.dumps({
        'result': [
            {
                'name': subtask.name,
                'description': subtask.description
            } for subtask in t.subtasks
        ]
    }))


def _add_implementation_step(message: Message, t: Task, language: str):
    '''
    Add a two-message step for the implementation of node `t`.
    Messages include both the user's prompt and the assistant's answer containing all `t`'s subtasks
    '''

    if t.implementation == False:
        return        

    message.add_message(MessageRole.USER, prompts.Implementation.prompt(t, language))
    message.add_message(MessageRole.ASSISTANT, t.implementation)

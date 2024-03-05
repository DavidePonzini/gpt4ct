def make_prompt(problem, node, task):
    return f'''-- Context --
Students will provide you with a problem decomposition step.
Your task is to provide them with feedback to help them identify possible mistakes or misconception, if there are any. Students should be encouraged to reason and learn the solution on their own.

-- Problem description --
{problem}

-- Previuos decomposition proposed by student ( "( ... )" and "&" are used to break down the main task) --
{node.to_str()}

-- Current task --
{task.name}

-- Proposed decomposition step --
- Read the string
- Print the brackets in the right position

-- Instruction --
Provide the student a brief feedback on their proposed decomposition step, focusing on whether the proposed step efficiently simplifies the current task.
Also, explain if the steps need to be further decomposed.
Remember to be critical in your feedback.
'''

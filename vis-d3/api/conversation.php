<?php
    include('request.php');
    include('database.php');

    // Model instructions
    define('DECOMPOSE_INSTRUCTIONS', 
'Decompose the current task into the smallest possible number of subtasks (usually two or three). You must produce at least two subtasks and you can produce up to five subtasks.

For each subtask, provide a name as well as a description, similar to the one provided for the main problem.

Each subtask must be simpler to solve than the main task.
A subtask of a given task, should not include any elements of other tasks at the same level of decomposition.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.

Format the result in JSON: provide a list of objects such as this: {"result": [{"name":"subtask 1 name", "description": "subtask 1 description"}, ...]}
');
    function log_usage($usage) {
        execute_query(
            'INSERT INTO decomposition_runs(prompt_tokens, completion_tokens) VALUES(?, ?)',
            array(
                $usage->prompt_tokens,
                $usage->completion_tokens
            )
        );
    }

    function decompose_task($task) {
        $messages = task_to_messages($task);

        $url = 'https://api.openai.com/v1/chat/completions';
        $data = array(
            'model' => 'gpt-3.5-turbo',
            'messages' => $messages,
            'response_format' => array(
                'type' => 'json_object'
            )
        );

        $result = make_request('POST', $url, json_encode($data));
        check_error($result);

        // Log usage to DB
        log_usage($result->usage);
        
        return $result;
    }

    function task_to_messages($task) {
        $messages = array();

        $t = $task;

        while($t->parent != null) {
            // Add message and prompt
            add_user_message($messages, 'Using the same approach, decompose the task "' . $t->name . '"');
            add_assistant_message($messages, $t->tasks);

            // Move to parent task
            $t = $t->parent;
        }

        // Add message for initial task
        add_user_message($messages, '-- Problem description --\n' . json_encode(array(
            'name' => $t->name,
            'description' => $t->description
        )));

        // Add model instructions
        add_system_message($messages, DECOMPOSE_INSTRUCTIONS);
        
        return $messages;
    }

    function add_message(&$messages, $role, $content) {
        array_unshift($messages, array(
            'role' => $role,
            'content' => ($content)
        ));
    }

    function add_assistant_message(&$messages, $tasks) {
        $content = json_encode($tasks);

        add_message($messages, 'assistant', $content);
    }

    function add_user_message(&$messages, $text) {
        add_message($messages, 'user', $text);
    }

    function add_system_message(&$messages, $text) {
        add_message($messages, 'system', $text);
    }
?>



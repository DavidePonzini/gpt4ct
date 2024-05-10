<?php

    // Model instructions
    define('DECOMPOSE_INSTRUCTIONS', 
'Decompose the current task into the smallest possible number of subtasks (usually two or three). You must produce at least two subtasks.

For each subtask, provide a name as well as a description, similar to the one provided for the main problem.

Each subtask must be simpler to solve than the main task.
A subtask of a given task, should not include any elements of other tasks at the same level of decomposition.
Ensure that there are no missing steps: i.e. the sum of all subtasks solves the entire task.

Format the result in JSON: provide a list of objects such as this: {"result": [{"name":"subtask 1 name", "description": "subtask 1 description"}, ...]}
');

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

        echo json_encode($data);

        // $result = make_request('POST', $url, $data);

    }

    function task_to_messages($task) {
        $messages = array();

        $t = $task;

        while(true) {
            // Stop when we have reached root node
            if ($t->parent == null) {
                add_user_message($messages, '-- Problem description --\n' . json_encode(array(
                    'name' => $t->name,
                    'description' => $t->description
                )));

                add_system_message($messages, DECOMPOSE_INSTRUCTIONS);

                break;
            }

            // Add message and prompt
            add_assistant_message($messages, $t->tasks);

            // Move to parent task
            $t = $t->parent;

            if($t->parent != null)
                add_user_message($messages, 'Using the same approach, decompose the task "' . $t->name . '"');
        }
        
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

    $t = '{"tasks":[{"name":"Import requests or urllib library","description":"Include the requests or urllib library in the Python program using the \'import\' statement"},{"name":"Send request to webpage URL","description":"Use the appropriate functions provided by the library to send a request to the specified webpage URL and retrieve the webpage content"}],"name":"Send request to webpage URL","parent":{"tasks":[{"name":"Specify webpage URL","description":"Define the URL of the webpage that needs to be downloaded in the Python program"},{"name":"Use requests or urllib library","description":"Utilize the requests or urllib library in the Python program to send a request to the webpage URL and download its contents"}],"name":"Use requests or urllib library","parent":{"tasks":[{"name":"Download webpage using Python","description":"Write a Python program to download a webpage using libraries like requests or urllib"},{"name":"Handle errors during download","description":"Implement error handling in the Python program to manage any issues that may occur during the download process"}],"name":"Download webpage using Python","parent":{"tasks":[{"name":"Download webpage","description":"Write a python program to download a webpage"},{"name":"Store webpage","description":"Write a python program to store a downloaded webpage"}],"name":"Download webpage","parent":{"name":"Download and store a webpage","description":"Write a python program to download and store a webpage","parent":null}}}}}';
    $task = json_decode($t);

    decompose_task($task);
    // echo $t;
    // print_r($task);
?>


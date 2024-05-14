<?php
    include('conversation.php');
    include('functions.php');

    if ($_SERVER["REQUEST_METHOD"] != "POST" || is_any_field_missing($_POST, array('task', 'name', 'description', 'level'))) {
        invalid_request('Missing parameters');
    }

    // Get parameters
    $task = json_decode($_POST['task']);
    $name = $_POST['name'];
    $description = $_POST['description'];
    $level = $_POST['level'];

    // Generate decomposition
    $decomposition = decompose_task($name, $description, $level, $task);

    // Get actual message
    $message_content = $decomposition->choices[0]->message->content;
    $message_content = json_decode($message_content);

    // Make sure the `result` field is present in the output
    if (!isset($message_content->result)) {
        invalid_request('Missing result field in output.');
    }

    print_json(array(
        'decomposition' => $message_content->result
    ));
?>
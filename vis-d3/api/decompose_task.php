<?php
    include('conversation.php');

    if ($_SERVER["REQUEST_METHOD"] != "POST" || !isset($_POST['task'])) {
        invalid_request('Missing parameters');
    }

    $task = json_decode($_POST['task']);
    $decomposition = decompose_task($task);

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
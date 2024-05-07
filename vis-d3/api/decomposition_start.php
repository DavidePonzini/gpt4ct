<?php
    include('threads.php');

    // if (!isset($_GET['problem']) || !isset($_GET['description'])) {
    //     invalid_request('Missing parameters');
    // }


    $thread_id = create_thread();
    $message = create_first_message($thread_id, 'Write a python program to download and store a webpage', 'Create the whole program');
    
    $run = run_thread($thread_id, ASSISTANT_ID);
    wait_for_run($thread_id, $run->id);

    $message = get_messages($thread_id);
    
    // Get actual message
    $message_content = $message->data[0]->content[0]->text->value;
    $message_content = json_decode($message_content);

    // Make sure the `result` field is present in the output
    if (!isset($message_content->result)) {
        invalid_request('Missing result field in output.');
    }

    print_json(array(
        'thread_id' => $thread_id,
        'decomposition' => $message_content->result
    ));
    
    // print_json(array(
    //     'thread_id' => $thread_id,
    //     'run_id' => $run->id,
    //     'status' => $run->status
    // ));
?>
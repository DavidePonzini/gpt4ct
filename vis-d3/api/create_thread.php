<?php
    include('threads.php');

    $thread_id = create_thread();

    $r = create_first_message($thread_id, 'Write a python program to download and store a webpage', 'Create the whole program');

    print_r($r);
    echo '<br>';
    echo '<br>';

    print_r($thread_id);
    echo '<br>';
    echo '<br>';

    $r = run_thread($thread_id, 1);
    print_r($r);
?>
<?php
    include('threads.php');

    if (!isset($_GET['id'])) {
        invalid_request('Missing id');
    }

    $result = get_messages($_GET['id']);

    print_json(array(
        'result' => $result
    ));
?>
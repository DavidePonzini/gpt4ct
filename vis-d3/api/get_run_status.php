<?php
    include('threads.php');

    if (!isset($_GET['thread']) || !isset($_GET['run'])) {
        invalid_request('Missing parameters');
    }

    $run = get_run($_GET['thread'], $_GET['run']);

    print_json(array(
        'status' => $run->status
    ));


?>
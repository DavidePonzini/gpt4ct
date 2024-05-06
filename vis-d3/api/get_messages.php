<?php
    if (!isset($_GET['id'])) {
        echo 'Missing id';
        die();
    }

    include('threads.php');

    print_r(get_messages($_GET['id']));

?>
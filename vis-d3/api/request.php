<?php
    include('SECRET.php');

    function make_request($method, $url, $data = null) {
        $curl = curl_init();

        // Set request method
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        if ($data) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }

        // Set headers
        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENAI_API_KEY,
            'OpenAI-Beta: assistants=v2'
        ));

        // Set URL
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        // Execute request
        $result = curl_exec($curl);
        curl_close($curl);

        $result = json_decode($result);

        return check_error($result);
    }

    function check_error($result) {
        if (isset($result->error)) {
            invalid_request($result->error->message);
        }

        return $result;
    }

    function invalid_request($message) {
        echo json_encode(array(
            'status' => 'invalid_request',
            'message' => $message 
        ));

        die();
    }

    function print_json($data) {
        echo json_encode($data);
    }
?>
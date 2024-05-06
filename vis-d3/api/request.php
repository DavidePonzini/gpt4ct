<?php
    include('SECRET.php');

    function make_request($method, $url, $data) {
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

        return $result;
    }

    // $p = 'https://ponzidav.altervista.org/utils/request.php';
    // $res = make_request('GET', $p, null);
    // print_r($res);
?>
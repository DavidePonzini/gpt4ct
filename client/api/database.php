<?php
    function execute_query(string $query, array $params = array()) {
        $db_username = 'ponzidav';
        $db_password = 'password';
        $db_dbname = 'my_ponzidav';

        try {
            $db = new PDO('mysql:host=localhost:3306;dbname=' . $db_dbname, $db_username, $db_password);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $db->prepare($query);
            $stmt->execute($params);

            return $stmt;
        } catch (PDOException $e) {
            die('Database connection failed: ' . $e->getMessage());
        }
    }

    // Execute a query and automatically fetch the result
    function execute_query_select(string $query, array $params = array()) {
        return execute_query($query, $params)->fetchAll(PDO::FETCH_ASSOC);
    }
?>

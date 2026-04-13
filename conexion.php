<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "academy_db";
$dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];
function getDb() {
  global $dsn, $username, $password, $options;
  return new PDO($dsn, $username, $password, $options);
}
?> 

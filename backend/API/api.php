<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/conexion.php';

require_once __DIR__ . '/students.php';
require_once __DIR__ . '/academica.php';
require_once __DIR__ . '/pagos.php';
require_once __DIR__ . '/teachers.php';
require_once __DIR__ . '/users.php';

try {
  $pdo = getDb();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'La conexión a la base de datos ha fallado', 'details' => $e->getMessage()]);
  exit;
}
$resource = $_GET['resource'] ?? $_POST['resource'] ?? '';
$action   = $_GET['action']   ?? $_POST['action']   ?? 'list';

if (!$resource) {
  http_response_code(400);
  echo json_encode(['error' => 'El parámetro "resource" es obligatorio']);
  exit;
}
switch ($resource) {
  case 'students':     handleStudents($pdo);     break;
  case 'inscriptions': handleInscriptions($pdo); break;
  case 'subjects':     handleSubjects($pdo);     break;
  case 'courses':      handleCourses($pdo);      break;
  case 'schedule':     handleSchedule($pdo);     break;
  case 'teachers':     handleTeachers($pdo);     break;
  case 'users':        handleUsers($pdo);        break;
  case 'auth':         handleAuth($pdo);         break;
  case 'grades':       handleGrades($pdo);       break;
  case 'attendance':   handleAttendance($pdo);   break;
  case 'payments':     handlePayments($pdo);     break;
  default:
    http_response_code(400);
    echo json_encode(['error' => 'Recurso desconocido: ' . $resource]);
    break;
}
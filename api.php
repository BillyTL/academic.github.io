<?php
header('Content-Type: application/json; charset=utf-8');
include 'conexion.php';

try {
  $pdo = getDb();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
  exit;
}

$resource = $_GET['resource'] ?? $_POST['resource'] ?? '';
$action   = $_GET['action']   ?? $_POST['action']   ?? 'list';

if (!$resource) {
  http_response_code(400);
  echo json_encode(['error' => 'Resource parameter is required']);
  exit;
}

switch ($resource) {
  case 'students':     handleStudents($pdo);     break;
  case 'teachers':     handleTeachers($pdo);     break;
  case 'subjects':     handleSubjects($pdo);     break;
  case 'courses':      handleCourses($pdo);      break;
  case 'schedule':     handleSchedule($pdo);     break;
  case 'users':        handleUsers($pdo);        break;
  case 'inscriptions': handleInscriptions($pdo); break;
  case 'payments':     handlePayments($pdo);     break;
  case 'attendance':   handleAttendance($pdo);   break;
  case 'grades':       handleGrades($pdo);       break;
  default:
    http_response_code(400);
    echo json_encode(['error' => 'Recurso desconocido: ' . $resource]);
    break;
}

// ─── STUDENTS ───────────────────────────────────────────────────────────────

function handleStudents($pdo) {
  global $action;

  if ($action === 'save') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id       = intval($body['id'] ?? 0);
    $name     = trim($body['name'] ?? '');
    $courseId = intval($body['courseId'] ?? 0);
    $shift    = trim($body['shift'] ?? '');

    if (!$name || !$courseId || !$shift) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      if ($id) {
        // Update: find the usuario ID linked to this student, then update Estudiantes
        $stmt = $pdo->prepare('SELECT ID_usuario FROM Estudiantes WHERE Id_estudiante = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Estudiante no encontrado']); return; }

        $pdo->prepare('UPDATE Usuario SET nombre = :name WHERE ID = :uid')
            ->execute([':name' => $name, ':uid' => $row['ID_usuario']]);
        $pdo->prepare('UPDATE Estudiantes SET Id_curso = :courseId, Turno = :shift WHERE Id_estudiante = :id')
            ->execute([':courseId' => $courseId, ':shift' => $shift, ':id' => $id]);
      }
      // Redirect to fresh list
      $sql = "SELECT e.Id_estudiante AS id, u.nombre AS name, u.email, u.rol AS role,
                     c.ID_Curso AS courseId, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Turno AS turno
              FROM Estudiantes e
              JOIN Usuario u ON e.ID_usuario=u.ID
              JOIN Curso c ON e.Id_curso=c.ID_Curso
              WHERE e.Id_estudiante = :id";
      $fetch = $pdo->prepare($sql);
      $fetch->execute([':id' => $id]);
      echo json_encode(['student' => $fetch->fetch()]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar estudiante', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      // Get linked usuario ID before deleting
      $stmt = $pdo->prepare('SELECT ID_usuario FROM Estudiantes WHERE Id_estudiante = :id');
      $stmt->execute([':id' => $id]);
      $row = $stmt->fetch();
      $pdo->prepare('DELETE FROM Estudiantes WHERE Id_estudiante = :id')->execute([':id' => $id]);
      if ($row) $pdo->prepare('DELETE FROM Usuario WHERE ID = :uid')->execute([':uid' => $row['ID_usuario']]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  $sql = "SELECT e.Id_estudiante AS id, u.nombre AS name, u.email, u.rol AS role,
                 c.ID_Curso AS courseId, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Turno AS turno
          FROM Estudiantes e
          JOIN Usuario u ON e.ID_usuario=u.ID
          JOIN Curso c ON e.Id_curso=c.ID_Curso";
  echo json_encode($pdo->query($sql)->fetchAll());
}

// ─── TEACHERS ───────────────────────────────────────────────────────────────

function handleTeachers($pdo) {
  global $action;

  if ($action === 'save') {
    $body      = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id        = intval($body['id'] ?? 0);
    $name      = trim($body['name'] ?? '');
    $email     = trim($body['email'] ?? '');
    $password  = trim($body['password'] ?? '');
    $specialty = trim($body['specialty'] ?? '');
    $shift     = trim($body['shift'] ?? '');
    $role      = trim($body['role'] ?? 'Docente');

    if (!$name || !$email || !$specialty || !$shift) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      if ($id) {
        $stmt = $pdo->prepare('SELECT ID_usuario FROM Docente WHERE ID_docente = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Docente no encontrado']); return; }

        $updateUser = 'UPDATE Usuario SET nombre = :name, email = :email, rol = :role';
        $params = [':name' => $name, ':email' => $email, ':role' => $role, ':uid' => $row['ID_usuario']];
        // Only update password if one was provided
        if ($password) {
          $updateUser .= ', contraseña = :password';
          $params[':password'] = password_hash($password, PASSWORD_BCRYPT);
        }
        $updateUser .= ' WHERE ID = :uid';
        $pdo->prepare($updateUser)->execute($params);
        $pdo->prepare('UPDATE Docente SET Especialidad = :spec, Turno = :shift WHERE ID_docente = :id')
            ->execute([':spec' => $specialty, ':shift' => $shift, ':id' => $id]);
      } else {
        if (!$password) { http_response_code(400); echo json_encode(['error' => 'La contraseña es obligatoria para un nuevo docente']); return; }
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO Usuario (nombre, email, rol, contraseña) VALUES (:name, :email, :role, :password)')
            ->execute([':name' => $name, ':email' => $email, ':role' => $role, ':password' => password_hash($password, PASSWORD_BCRYPT)]);
        $userId = (int)$pdo->lastInsertId();
        $pdo->prepare('INSERT INTO Docente (ID_usuario, Especialidad, Turno) VALUES (:uid, :spec, :shift)')
            ->execute([':uid' => $userId, ':spec' => $specialty, ':shift' => $shift]);
        $id = (int)$pdo->lastInsertId();
        $pdo->commit();
      }

      $fetch = $pdo->prepare("SELECT d.ID_docente AS id, u.nombre AS name, u.email, d.Especialidad AS specialty, d.Turno AS turno, u.rol AS role FROM Docente d JOIN Usuario u ON d.ID_usuario=u.ID WHERE d.ID_docente = :id");
      $fetch->execute([':id' => $id]);
      echo json_encode(['teacher' => $fetch->fetch()]);
    } catch (PDOException $e) {
      if ($pdo->inTransaction()) $pdo->rollBack();
      http_response_code(500);
      echo json_encode(['error' => $e->errorInfo[1] === 1062 ? 'El correo ya está registrado' : 'Error al guardar docente', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $stmt = $pdo->prepare('SELECT ID_usuario FROM Docente WHERE ID_docente = :id');
      $stmt->execute([':id' => $id]);
      $row = $stmt->fetch();
      $pdo->prepare('DELETE FROM Docente WHERE ID_docente = :id')->execute([':id' => $id]);
      if ($row) $pdo->prepare('DELETE FROM Usuario WHERE ID = :uid')->execute([':uid' => $row['ID_usuario']]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  $sql = "SELECT d.ID_docente AS id, u.nombre AS name, u.email, d.Especialidad AS specialty, d.Turno AS turno, u.rol AS role FROM Docente d JOIN Usuario u ON d.ID_usuario=u.ID";
  echo json_encode($pdo->query($sql)->fetchAll());
}

function tableHasColumn($pdo, $table, $column) {
  $allowed = ['Materias', 'Docente', 'Curso', 'Usuario'];
  if (!in_array($table, $allowed, true)) {
    return false;
  }
  try {
    $stmt = $pdo->query("SHOW COLUMNS FROM `{$table}` LIKE '{$column}'");
    return (bool)$stmt->fetch();
  } catch (PDOException $e) {
    return false;
  }
}

// ─── SUBJECTS ───────────────────────────────────────────────────────────────

function handleSubjects($pdo) {
  global $action;
  $hasTeacherColumn = tableHasColumn($pdo, 'Materias', 'ID_docente');

  if ($action === 'save') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id        = intval($body['id'] ?? 0);
    $name      = trim($body['name'] ?? '');
    $teacherId = intval($body['teacherId'] ?? 0);
    if (!$name) { http_response_code(400); echo json_encode(['error' => 'El nombre es obligatorio']); return; }
    if ($hasTeacherColumn && !$teacherId) { http_response_code(400); echo json_encode(['error' => 'El docente es obligatorio']); return; }

    try {
      if ($id) {
        if ($hasTeacherColumn) {
          $pdo->prepare('UPDATE Materias SET Nombre = :name, ID_docente = :teacherId WHERE Id_Materia = :id')
              ->execute([':name' => $name, ':teacherId' => $teacherId, ':id' => $id]);
        } else {
          $pdo->prepare('UPDATE Materias SET Nombre = :name WHERE Id_Materia = :id')
              ->execute([':name' => $name, ':id' => $id]);
        }
      } else {
        if ($hasTeacherColumn) {
          $pdo->prepare('INSERT INTO Materias (Nombre, ID_docente) VALUES (:name, :teacherId)')
              ->execute([':name' => $name, ':teacherId' => $teacherId]);
        } else {
          $pdo->prepare('INSERT INTO Materias (Nombre) VALUES (:name)')
              ->execute([':name' => $name]);
        }
        $id = (int)$pdo->lastInsertId();
      }

      if ($hasTeacherColumn) {
        $fetch = $pdo->prepare('SELECT m.Id_Materia AS id, m.Nombre AS name, m.ID_docente AS teacherId, u.nombre AS teacher FROM Materias m LEFT JOIN Docente d ON m.ID_docente=d.ID_docente LEFT JOIN Usuario u ON d.ID_usuario=u.ID WHERE m.Id_Materia = :id');
      } else {
        $fetch = $pdo->prepare('SELECT Id_Materia AS id, Nombre AS name FROM Materias WHERE Id_Materia = :id');
      }
      $fetch->execute([':id' => $id]);
      echo json_encode(['subject' => $fetch->fetch()]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar materia', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Materias WHERE Id_Materia = :id')->execute([':id' => $id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($hasTeacherColumn) {
    echo json_encode($pdo->query("SELECT m.Id_Materia AS id, m.Nombre AS name, m.ID_docente AS teacherId, u.nombre AS teacher FROM Materias m LEFT JOIN Docente d ON m.ID_docente=d.ID_docente LEFT JOIN Usuario u ON d.ID_usuario=u.ID")->fetchAll());
  } else {
    echo json_encode($pdo->query('SELECT Id_Materia AS id, Nombre AS name FROM Materias')->fetchAll());
  }
}

// ─── COURSES ────────────────────────────────────────────────────────────────

function handleCourses($pdo) {
  global $action;

  if ($action === 'save') {
    $body     = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id       = intval($body['id'] ?? 0);
    $level    = trim($body['level'] ?? '');
    $parallel = trim($body['parallel'] ?? '');
    $shift    = trim($body['shift'] ?? '');

    if (!$level || !$parallel || !$shift) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios para el curso']); return;
    }

    try {
      if ($id) {
        $pdo->prepare('UPDATE Curso SET Nivel = :level, Paralelo = :parallel, Turno = :shift WHERE ID_Curso = :id')
            ->execute([':level' => $level, ':parallel' => $parallel, ':shift' => $shift, ':id' => $id]);
      } else {
        $pdo->prepare('INSERT INTO Curso (Nivel, Paralelo, Turno) VALUES (:level, :parallel, :shift)')
            ->execute([':level' => $level, ':parallel' => $parallel, ':shift' => $shift]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare('SELECT ID_Curso AS id, Nivel, Paralelo, Turno FROM Curso WHERE ID_Curso = :id');
      $fetch->execute([':id' => $id]);
      $row = $fetch->fetch();
      if ($row) {
        $row['name'] = trim($row['Nivel'] . ' ' . $row['Paralelo']);
        $row['level'] = $row['Nivel']; $row['shift'] = $row['Turno'];
        $row['room'] = ''; $row['tutor'] = ''; $row['students'] = 0; $row['status'] = 'Activo';
      }
      echo json_encode(['course' => $row]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar el curso', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID de curso inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Curso WHERE ID_Curso = :id')->execute([':id' => $id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar el curso. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  $rows = [];
  foreach ($pdo->query("SELECT ID_Curso AS id, Nivel, Paralelo, Turno FROM Curso")->fetchAll() as $row) {
    $row['name'] = trim($row['Nivel'] . ' ' . $row['Paralelo']);
    $row['level'] = $row['Nivel']; $row['shift'] = $row['Turno'];
    $row['room'] = ''; $row['tutor'] = ''; $row['students'] = 0; $row['status'] = 'Activo';
    $rows[] = $row;
  }
  echo json_encode($rows);
}

// ─── SCHEDULE ───────────────────────────────────────────────────────────────

function handleSchedule($pdo) {
  global $action;

  if ($action === 'save') {
    $body      = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id        = intval($body['id'] ?? 0);
    $courseId  = intval($body['courseId'] ?? 0);
    $subjectId = intval($body['subjectId'] ?? 0);
    $teacherId = intval($body['teacherId'] ?? 0);
    $day       = trim($body['day'] ?? '');
    $start     = trim($body['start'] ?? '');
    $end       = trim($body['end'] ?? '');
    $room      = trim($body['room'] ?? '');

    if (!$courseId || !$subjectId || !$teacherId || !$day || !$start || !$end) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      if ($id) {
        $pdo->prepare('UPDATE Horarios SET id_curso=:c, Id_Materia=:m, ID_docente=:d, Dia=:day, HoraInicio=:s, HoraFin=:e, Aula=:r WHERE Id_Horario=:id')
            ->execute([':c'=>$courseId,':m'=>$subjectId,':d'=>$teacherId,':day'=>$day,':s'=>$start,':e'=>$end,':r'=>$room,':id'=>$id]);
      } else {
        $pdo->prepare('INSERT INTO Horarios (id_curso, Id_Materia, ID_docente, Dia, HoraInicio, HoraFin, Aula) VALUES (:c,:m,:d,:day,:s,:e,:r)')
            ->execute([':c'=>$courseId,':m'=>$subjectId,':d'=>$teacherId,':day'=>$day,':s'=>$start,':e'=>$end,':r'=>$room]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare("SELECT h.Id_Horario AS id, CONCAT(c.Nivel,' ',c.Paralelo) AS course, h.Dia AS day, h.HoraInicio AS start, h.HoraFin AS end, m.Nombre AS subject, u.nombre AS teacher, h.Aula AS room FROM Horarios h JOIN Curso c ON h.id_curso=c.ID_Curso JOIN Materias m ON h.Id_Materia=m.Id_Materia JOIN Docente d ON h.ID_docente=d.ID_docente JOIN Usuario u ON d.ID_usuario=u.ID WHERE h.Id_Horario = :id");
      $fetch->execute([':id' => $id]);
      echo json_encode(['schedule' => $fetch->fetch()]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar horario', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Horarios WHERE Id_Horario = :id')->execute([':id' => $id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al eliminar horario', 'details' => $e->getMessage()]);
    }
    return;
  }

  $sql = "SELECT h.Id_Horario AS id, CONCAT(c.Nivel,' ',c.Paralelo) AS course, h.Dia AS day, h.HoraInicio AS start, h.HoraFin AS end, m.Nombre AS subject, u.nombre AS teacher, h.Aula AS room FROM Horarios h JOIN Curso c ON h.id_curso=c.ID_Curso JOIN Materias m ON h.Id_Materia=m.Id_Materia JOIN Docente d ON h.ID_docente=d.ID_docente JOIN Usuario u ON d.ID_usuario=u.ID";
  echo json_encode($pdo->query($sql)->fetchAll());
}

// ─── USERS ──────────────────────────────────────────────────────────────────

function handleUsers($pdo) {
  global $action;

  if ($action === 'save') {
    $body     = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id       = intval($body['id'] ?? 0);
    $name     = trim($body['name'] ?? '');
    $email    = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');
    $role     = trim($body['role'] ?? 'Administrador');

    if (!$name || !$email) { http_response_code(400); echo json_encode(['error' => 'Nombre y email son obligatorios']); return; }

    try {
      if ($id) {
        $update = 'UPDATE Usuario SET nombre=:name, email=:email, rol=:role';
        $params = [':name'=>$name,':email'=>$email,':role'=>$role,':id'=>$id];
        if ($password) { $update .= ', contraseña=:password'; $params[':password'] = password_hash($password, PASSWORD_BCRYPT); }
        $pdo->prepare($update . ' WHERE ID=:id')->execute($params);
      } else {
        if (!$password) { http_response_code(400); echo json_encode(['error' => 'La contraseña es obligatoria']); return; }
        $pdo->prepare('INSERT INTO Usuario (nombre, email, rol, contraseña) VALUES (:name,:email,:role,:password)')
            ->execute([':name'=>$name,':email'=>$email,':role'=>$role,':password'=>password_hash($password, PASSWORD_BCRYPT)]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare('SELECT ID AS id, nombre AS name, email, rol AS role FROM Usuario WHERE ID=:id');
      $fetch->execute([':id'=>$id]);
      $row = $fetch->fetch();
      $row['status'] = 'Activo'; $row['lastAccess'] = '—'; $row['phone'] = '';
      echo json_encode(['user' => $row]);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => $e->errorInfo[1] === 1062 ? 'El correo ya está registrado' : 'Error al guardar usuario', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Usuario WHERE ID=:id')->execute([':id'=>$id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  $rows = [];
  foreach ($pdo->query("SELECT ID AS id, nombre AS name, email, rol AS role FROM Usuario")->fetchAll() as $row) {
    $row['status'] = 'Activo'; $row['lastAccess'] = '—'; $row['phone'] = '';
    $rows[] = $row;
  }
  echo json_encode($rows);
}

// ─── INSCRIPTIONS ───────────────────────────────────────────────────────────

function handleInscriptions($pdo) {
  global $action;

  if ($action === 'save') {
    $body     = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $name     = trim($body['name'] ?? '');
    $email    = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');
    $courseId = intval($body['courseId'] ?? 0);
    $date     = trim($body['date'] ?? '');
    $status   = trim($body['status'] ?? 'Activa');

    if (!$name || !$email || !$password || !$courseId || !$date) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      $pdo->beginTransaction();

      // FIX: hash the password before storage
      $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

      $pdo->prepare('INSERT INTO Usuario (nombre, email, rol, contraseña) VALUES (:name,:email,:role,:password)')
          ->execute([':name'=>$name,':email'=>$email,':role'=>'Estudiante',':password'=>$hashedPassword]);
      $userId = (int)$pdo->lastInsertId();

      $courseStmt = $pdo->prepare('SELECT Turno FROM Curso WHERE ID_Curso = :courseId');
      $courseStmt->execute([':courseId' => $courseId]);
      $courseData = $courseStmt->fetch();
      if (!$courseData) { $pdo->rollBack(); http_response_code(400); echo json_encode(['error' => 'Curso no válido']); return; }

      // FIX: do NOT store the password again in Estudiantes — only store hashed in Usuario
      $pdo->prepare('INSERT INTO Estudiantes (ID_usuario, Id_curso, email, rol, Turno) VALUES (:uid,:courseId,:email,:role,:turno)')
          ->execute([':uid'=>$userId,':courseId'=>$courseId,':email'=>$email,':role'=>'Estudiante',':turno'=>$courseData['Turno']]);
      $studentId = (int)$pdo->lastInsertId();

      $pdo->prepare('INSERT INTO Inscripcion (ID_Estudiante, Id_curso, Fecha, Estado) VALUES (:sid,:courseId,:date,:status)')
          ->execute([':sid'=>$studentId,':courseId'=>$courseId,':date'=>$date,':status'=>$status]);
      $inscriptionId = (int)$pdo->lastInsertId();

      $pdo->commit();

      $fetch = $pdo->prepare("SELECT e.Id_estudiante AS id, u.nombre AS name, u.email, u.rol AS role, c.ID_Curso AS courseId, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Turno AS turno FROM Estudiantes e JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON e.Id_curso=c.ID_Curso WHERE e.Id_estudiante=:id");
      $fetch->execute([':id' => $studentId]);
      $student = $fetch->fetch();

      $fetchI = $pdo->prepare("SELECT i.ID_inscripcion AS id, u.nombre AS student, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Nivel AS level, i.Fecha AS date, i.Estado AS status FROM Inscripcion i JOIN Estudiantes e ON i.ID_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON i.Id_curso=c.ID_Curso WHERE i.ID_inscripcion=:id");
      $fetchI->execute([':id' => $inscriptionId]);
      $inscription = $fetchI->fetch();

      echo json_encode(['student' => $student, 'inscription' => $inscription]);
    } catch (PDOException $e) {
      if ($pdo->inTransaction()) $pdo->rollBack();
      http_response_code(500);
      echo json_encode(['error' => $e->errorInfo[1] === 1062 ? 'El correo ya está registrado' : 'Error al guardar la inscripción', 'details' => $e->getMessage()]);
    }
    return;
  }

  $sql = "SELECT i.ID_inscripcion AS id, u.nombre AS student, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Nivel AS level, i.Fecha AS date, i.Estado AS status FROM Inscripcion i JOIN Estudiantes e ON i.ID_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON i.Id_curso=c.ID_Curso";
  echo json_encode($pdo->query($sql)->fetchAll());
}

// ─── PAYMENTS ───────────────────────────────────────────────────────────────
// Note: assumes a Pagos table with columns:
//   ID_Pago (PK), ID_Estudiante (FK), Concepto, Monto, Metodo, Fecha, Estado

function handlePayments($pdo) {
  global $action;

  if ($action === 'save') {
    $body      = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id        = intval($body['id'] ?? 0);
    $studentId = intval($body['studentId'] ?? 0);
    $concept   = trim($body['concept'] ?? '');
    $amount    = floatval($body['amount'] ?? 0);
    $method    = trim($body['method'] ?? 'Efectivo');
    $date      = trim($body['date'] ?? date('Y-m-d'));
    $status    = trim($body['status'] ?? 'Pendiente');

    if (!$studentId || !$concept || !$amount) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      if ($id) {
        $pdo->prepare('UPDATE Pagos SET ID_Estudiante=:s, Concepto=:c, Monto=:m, Metodo=:me, Fecha=:f, Estado=:e WHERE ID_Pago=:id')
            ->execute([':s'=>$studentId,':c'=>$concept,':m'=>$amount,':me'=>$method,':f'=>$date,':e'=>$status,':id'=>$id]);
      } else {
        $pdo->prepare('INSERT INTO Pagos (ID_Estudiante, Concepto, Monto, Metodo, Fecha, Estado) VALUES (:s,:c,:m,:me,:f,:e)')
            ->execute([':s'=>$studentId,':c'=>$concept,':m'=>$amount,':me'=>$method,':f'=>$date,':e'=>$status]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare("SELECT p.ID_Pago AS id, u.nombre AS student, p.ID_Estudiante AS studentId, p.Concepto AS concept, p.Monto AS amount, p.Metodo AS method, p.Fecha AS date, p.Estado AS status FROM Pagos p JOIN Estudiantes e ON p.ID_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID WHERE p.ID_Pago=:id");
      $fetch->execute([':id' => $id]);
      echo json_encode(['payment' => $fetch->fetch()]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar pago', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Pagos WHERE ID_Pago=:id')->execute([':id'=>$id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al eliminar pago', 'details' => $e->getMessage()]);
    }
    return;
  }

  try {
    $sql = "SELECT p.ID_Pago AS id, u.nombre AS student, p.ID_Estudiante AS studentId, p.Concepto AS concept, p.Monto AS amount, p.Metodo AS method, p.Fecha AS date, p.Estado AS status FROM Pagos p JOIN Estudiantes e ON p.ID_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID";
    echo json_encode($pdo->query($sql)->fetchAll());
  } catch (PDOException $e) {
    // Table may not exist yet — return empty array so the frontend loads cleanly
    echo json_encode([]);
  }
}

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
// Note: assumes an Asistencia table with columns:
//   ID_Asistencia (PK), ID_Estudiante (FK), Fecha, Estado

function handleAttendance($pdo) {
  global $action;

  if ($action === 'save') {
    $body      = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $studentId = intval($body['studentId'] ?? 0);
    $date      = trim($body['date'] ?? '');
    $status    = trim($body['status'] ?? 'Presente');

    if (!$studentId || !$date) { http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return; }

    try {
      // Upsert: update if record exists for same student+date, otherwise insert
      $check = $pdo->prepare('SELECT ID_Asistencia FROM Asistencia WHERE ID_Estudiante=:s AND Fecha=:d');
      $check->execute([':s'=>$studentId,':d'=>$date]);
      $existing = $check->fetch();
      if ($existing) {
        $pdo->prepare('UPDATE Asistencia SET Estado=:e WHERE ID_Asistencia=:id')->execute([':e'=>$status,':id'=>$existing['ID_Asistencia']]);
      } else {
        $pdo->prepare('INSERT INTO Asistencia (ID_Estudiante, Fecha, Estado) VALUES (:s,:d,:e)')->execute([':s'=>$studentId,':d'=>$date,':e'=>$status]);
      }
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar asistencia', 'details' => $e->getMessage()]);
    }
    return;
  }

  try {
    $sql = "SELECT a.ID_Asistencia AS id, u.nombre AS student, CONCAT(c.Nivel,' ',c.Paralelo) AS course, a.Fecha AS date, a.Estado AS status FROM Asistencia a JOIN Estudiantes e ON a.ID_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON e.Id_curso=c.ID_Curso";
    echo json_encode($pdo->query($sql)->fetchAll());
  } catch (PDOException $e) {
    echo json_encode([]);
  }
}

// ─── GRADES ─────────────────────────────────────────────────────────────────
// Note: assumes a Calificaciones table with columns:
//   Id_Calificacion (PK), Id_Estudiante (FK), Id_Materia (FK), Nota, Periodo

function handleGrades($pdo) {
  global $action;

  if ($action === 'save') {
    $body      = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id        = intval($body['id'] ?? 0);
    $studentId = intval($body['studentId'] ?? 0);
    $subjectId = intval($body['subjectId'] ?? 0);
    $nota      = intval($body['nota'] ?? 0);
    $periodo   = trim($body['periodo'] ?? '1er Trimestre');

    if (!$studentId || !$subjectId) { http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return; }

    try {
      if ($id) {
        $pdo->prepare('UPDATE Calificaciones SET Id_Estudiante=:s, Id_Materia=:m, Nota=:n, Periodo=:p WHERE Id_Calificacion=:id')
            ->execute([':s'=>$studentId,':m'=>$subjectId,':n'=>$nota,':p'=>$periodo,':id'=>$id]);
      } else {
        $pdo->prepare('INSERT INTO Calificaciones (Id_Estudiante, Id_Materia, Nota, Periodo) VALUES (:s,:m,:n,:p)')
            ->execute([':s'=>$studentId,':m'=>$subjectId,':n'=>$nota,':p'=>$periodo]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare("SELECT cal.Id_Calificacion AS id, u.nombre AS student, CONCAT(c.Nivel,' ',c.Paralelo) AS course, mat.Nombre AS subject, cal.Nota AS nota, cal.Periodo AS periodo FROM Calificaciones cal JOIN Estudiantes e ON cal.Id_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON e.Id_curso=c.ID_Curso JOIN Materias mat ON cal.Id_Materia=mat.Id_Materia WHERE cal.Id_Calificacion=:id");
      $fetch->execute([':id' => $id]);
      echo json_encode(['grade' => $fetch->fetch()]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al guardar nota', 'details' => $e->getMessage()]);
    }
    return;
  }

  if ($action === 'delete') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? $_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); return; }
    try {
      $pdo->prepare('DELETE FROM Calificaciones WHERE Id_Calificacion=:id')->execute([':id'=>$id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'Error al eliminar nota', 'details' => $e->getMessage()]);
    }
    return;
  }

  try {
    $sql = "SELECT cal.Id_Calificacion AS id, u.nombre AS student, CONCAT(c.Nivel,' ',c.Paralelo) AS course, mat.Nombre AS subject, cal.Nota AS nota, cal.Periodo AS periodo FROM Calificaciones cal JOIN Estudiantes e ON cal.Id_Estudiante=e.Id_estudiante JOIN Usuario u ON e.ID_usuario=u.ID JOIN Curso c ON e.Id_curso=c.ID_Curso JOIN Materias mat ON cal.Id_Materia=mat.Id_Materia";
    echo json_encode($pdo->query($sql)->fetchAll());
  } catch (PDOException $e) {
    echo json_encode([]);
  }
}
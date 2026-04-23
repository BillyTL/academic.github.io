<?php
// ─── TEACHERS ───────────────────────────────────────────────────────────────

// handleTeachers: procesa solicitudes para el recurso "teachers".
// - action=save: crea o actualiza un docente y su información asociada.
// - action=delete: elimina un docente y su usuario asociado.
// - default: devuelve la lista de docentes.
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

// tableHasColumn: helper para verificar si una columna existe en una tabla permitida.
// Se usa en materias para soportar esquemas con o sin relación al docente.
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
<?php

// ─── Api de Estudiantes ───────────────────────────────────────────────────────────────

// Procesa las solicitudes para el recurso "students".
// - action=save: crea o actualiza un estudiante.
// - action=delete: elimina un estudiante y su usuario asociado.
// - default: devuelve la lista de estudiantes.
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
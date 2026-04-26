<?php

// ─── Api de Estudiantes ───────────────────────────────────────────────────────────────
function handleStudents($pdo) {
  global $action;

  if ($action === 'save') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Payload inválido']); return; }

    $id       = intval($body['id'] ?? 0);
    $name     = trim($body['name'] ?? '');
    $courseId = intval($body['courseId'] ?? 0);
    $shift    = trim($body['shift'] ?? '');
    $ci       = trim($body['ci'] ?? '');
    $celular  = trim($body['celular'] ?? '');

    if (!$name || !$courseId || !$shift) {
      http_response_code(400); echo json_encode(['error' => 'Faltan campos obligatorios']); return;
    }

    try {
      if ($id) {
        $stmt = $pdo->prepare('SELECT ID_usuario FROM estudiantes WHERE Id_estudiante = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error' => 'Estudiante no encontrado']); return; }

        $pdo->prepare('UPDATE usuario SET nombre=:name, ci=:ci, celular=:celular WHERE ID=:uid')
            ->execute([':name'=>$name, ':ci'=>$ci, ':celular'=>$celular, ':uid'=>$row['ID_usuario']]);
        $pdo->prepare('UPDATE estudiantes SET Id_curso=:courseId, Turno=:shift WHERE Id_estudiante=:id')
            ->execute([':courseId'=>$courseId, ':shift'=>$shift, ':id'=>$id]);
      }

      $sql = "SELECT e.Id_estudiante AS id, u.nombre AS name, u.email, u.ci, u.celular,
                     c.ID_Curso AS courseId, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Turno AS turno
              FROM estudiantes e
              JOIN usuario u ON e.ID_usuario=u.ID
              JOIN curso c ON e.Id_curso=c.ID_Curso
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
      $stmt = $pdo->prepare('SELECT ID_usuario FROM estudiantes WHERE Id_estudiante = :id');
      $stmt->execute([':id' => $id]);
      $row = $stmt->fetch();
      $pdo->prepare('DELETE FROM estudiantes WHERE Id_estudiante = :id')->execute([':id' => $id]);
      if ($row) $pdo->prepare('DELETE FROM usuario WHERE ID = :uid')->execute([':uid' => $row['ID_usuario']]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  // LIST — incluye ci y celular desde la tabla usuario
  $sql = "SELECT e.Id_estudiante AS id, u.nombre AS name, u.email, u.ci, u.celular,
                 c.ID_Curso AS courseId, CONCAT(c.Nivel,' ',c.Paralelo) AS course, c.Turno AS turno,
                 'Activo' AS status
          FROM estudiantes e
          JOIN usuario u ON e.ID_usuario=u.ID
          JOIN curso c ON e.Id_curso=c.ID_Curso";
  echo json_encode($pdo->query($sql)->fetchAll());
}
<?php

// ─── PAGOS ───────────────────────────────────────────────────────────────
// Note: assumes a Pagos table with columns:
//   ID_Pago (PK), ID_Estudiante (FK), Concepto, Monto, Metodo, Fecha, Estado

// handlePayments: procesa solicitudes para el recurso "payments".
// - action=save: crea o actualiza un pago.
// - action=delete: elimina un pago.
// - default: devuelve la lista de pagos.
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
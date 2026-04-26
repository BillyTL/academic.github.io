<?php

// ─── USUARIOS ──────────────────────────────────────────────────────────────────
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
    $ci       = trim($body['ci'] ?? '');
    $celular  = trim($body['celular'] ?? '');

    if (!$name || !$email) { http_response_code(400); echo json_encode(['error' => 'Nombre y email son obligatorios']); return; }

    try {
      if ($id) {
        $update = 'UPDATE usuario SET nombre=:name, email=:email, rol=:role, ci=:ci, celular=:celular';
        $params = [':name'=>$name,':email'=>$email,':role'=>$role,':ci'=>$ci,':celular'=>$celular,':id'=>$id];
        if ($password) { $update .= ', contraseña=:password'; $params[':password'] = password_hash($password, PASSWORD_BCRYPT); }
        $pdo->prepare($update . ' WHERE ID=:id')->execute($params);
      } else {
        if (!$password) { http_response_code(400); echo json_encode(['error' => 'La contraseña es obligatoria']); return; }
        $pdo->prepare('INSERT INTO usuario (nombre, email, rol, contraseña, ci, celular) VALUES (:name,:email,:role,:password,:ci,:celular)')
            ->execute([':name'=>$name,':email'=>$email,':role'=>$role,':password'=>password_hash($password, PASSWORD_BCRYPT),':ci'=>$ci,':celular'=>$celular]);
        $id = (int)$pdo->lastInsertId();
      }
      $fetch = $pdo->prepare('SELECT ID AS id, nombre AS name, email, rol AS role, ci, celular FROM usuario WHERE ID=:id');
      $fetch->execute([':id'=>$id]);
      $row = $fetch->fetch();
      $row['status'] = 'Activo'; $row['lastAccess'] = '—';
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
      $pdo->prepare('DELETE FROM usuario WHERE ID=:id')->execute([':id'=>$id]);
      echo json_encode(['success' => true]);
    } catch (PDOException $e) {
      http_response_code(500); echo json_encode(['error' => 'No se puede eliminar. Verifique dependencias.', 'details' => $e->getMessage()]);
    }
    return;
  }

  $rows = [];
  foreach ($pdo->query("SELECT ID AS id, nombre AS name, email, rol AS role, ci, celular FROM usuario")->fetchAll() as $row) {
    $row['status'] = 'Activo'; $row['lastAccess'] = '—';
    $rows[] = $row;
  }
  echo json_encode($rows);
}

// handleAuth
function handleAuth($pdo) {
  global $action;

  if ($action !== 'login') {
    http_response_code(400);
    echo json_encode(['error' => 'Acción inválida para auth']);
    return;
  }

  $body = json_decode(file_get_contents('php://input'), true);
  if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload inválido']);
    return;
  }

  $email    = trim($body['email'] ?? '');
  $password = trim($body['password'] ?? '');

  if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña son obligatorios']);
    return;
  }

  $stmt = $pdo->prepare('SELECT ID, nombre, email, rol AS role, contraseña FROM usuario WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    return;
  }

  $hash = $user['contraseña'] ?? '';
  $passwordMatches = false;
  if ($hash && password_verify($password, $hash)) {
    $passwordMatches = true;
  } elseif ($password === $hash) {
    $passwordMatches = true;
  }

  if (!$passwordMatches) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    return;
  }

  unset($user['contraseña']);
  echo json_encode(['success' => true, 'user' => $user]);
}
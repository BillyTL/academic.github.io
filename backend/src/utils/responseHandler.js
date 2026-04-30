const ok = (res, data = {}, message = 'OK') =>
  res.status(200).json({ success: true, message, data });

const created = (res, data = {}, message = 'Creado correctamente') =>
  res.status(201).json({ success: true, message, data });

const badRequest = (res, message = 'Solicitud invalida') =>
  res.status(400).json({ success: false, message });

const unauthorized = (res, message = 'No autorizado') =>
  res.status(401).json({ success: false, message });

const forbidden = (res, message = 'Acceso denegado') =>
  res.status(403).json({ success: false, message });

const notFound = (res, message = 'No encontrado') =>
  res.status(404).json({ success: false, message });

const serverError = (res, message = 'Error interno del servidor') =>
  res.status(500).json({ success: false, message });

module.exports = { ok, created, badRequest, unauthorized, forbidden, notFound, serverError };

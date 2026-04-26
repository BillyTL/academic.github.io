CREATE DATABASE academy_db;


USE academy_db;

-- ------------------------------------------------------------
-- TABLA: Usuario
-- ------------------------------------------------------------
CREATE TABLE Usuario (
  ID         INT          NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  rol        VARCHAR(50)  NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  PRIMARY KEY (ID),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Curso
-- ------------------------------------------------------------
CREATE TABLE Curso (
  ID_Curso INT         NOT NULL AUTO_INCREMENT,
  Nivel    VARCHAR(50) NOT NULL,
  Paralelo VARCHAR(10) NOT NULL,
  Turno    VARCHAR(20) NOT NULL,
  PRIMARY KEY (ID_Curso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Materias
-- ------------------------------------------------------------
CREATE TABLE Materias (
  Id_Materia INT          NOT NULL AUTO_INCREMENT,
  Nombre     VARCHAR(100) NOT NULL,
  ID_docente INT          NULL,
  PRIMARY KEY (Id_Materia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Estudiantes
-- ------------------------------------------------------------
CREATE TABLE Estudiantes (
  Id_estudiante INT         NOT NULL AUTO_INCREMENT,
  ID_usuario    INT         NOT NULL,
  Id_curso      INT         NOT NULL,
  CI          VARCHAR(20) NOT NULL,
  fecha_nacimiento   DATE        NOT NULL,
  telefono     VARCHAR(20) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  rol        VARCHAR(50)  NOT NULL,
  Turno         VARCHAR(20) NOT NULL,
  PRIMARY KEY (Id_estudiante),
  CONSTRAINT fk_est_usuario FOREIGN KEY (ID_usuario) REFERENCES Usuario  (ID)       ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_est_curso   FOREIGN KEY (Id_curso)   REFERENCES Curso    (ID_Curso) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Docente
-- ------------------------------------------------------------
CREATE TABLE Docente (
  ID_docente   INT          NOT NULL AUTO_INCREMENT,
  ID_usuario   INT          NOT NULL,
  Especialidad VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  Turno        VARCHAR(20)  NOT NULL,
  rol        VARCHAR(50)  NOT NULL,
  PRIMARY KEY (ID_docente),
  CONSTRAINT fk_doc_usuario FOREIGN KEY (ID_usuario) REFERENCES Usuario (ID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Materias
  ADD CONSTRAINT fk_mat_docente FOREIGN KEY (ID_docente) REFERENCES Docente (ID_docente) ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------
-- TABLA: Administracion
-- ------------------------------------------------------------
CREATE TABLE Administracion (
  ID_admin   INT          NOT NULL AUTO_INCREMENT,
  cargo      VARCHAR(100) NOT NULL,
  ID_usuario INT          NOT NULL,
  PRIMARY KEY (ID_admin),
  CONSTRAINT fk_adm_usuario FOREIGN KEY (ID_usuario) REFERENCES Usuario (ID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Secretaria
-- ------------------------------------------------------------
CREATE TABLE Secretaria (
  ID_Secretaria INT NOT NULL AUTO_INCREMENT,
  ID_usuario    INT NOT NULL,
  PRIMARY KEY (ID_Secretaria),
  CONSTRAINT fk_sec_usuario FOREIGN KEY (ID_usuario) REFERENCES Usuario (ID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Horarios
-- ------------------------------------------------------------
CREATE TABLE Horarios (
  Id_Horario INT         NOT NULL AUTO_INCREMENT,
  id_curso   INT         NOT NULL,
  Id_Materia INT         NOT NULL,
  ID_docente INT         NOT NULL,
  Dia        VARCHAR(15) NOT NULL,
  HoraInicio TIME        NOT NULL,
  HoraFin    TIME        NOT NULL,
  Aula       VARCHAR(50) NOT NULL,
  PRIMARY KEY (Id_Horario),
  CONSTRAINT fk_hor_curso   FOREIGN KEY (id_curso)   REFERENCES Curso    (ID_Curso)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hor_materia FOREIGN KEY (Id_Materia) REFERENCES Materias (Id_Materia) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hor_docente FOREIGN KEY (ID_docente) REFERENCES Docente  (ID_docente) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Asistencia
-- ------------------------------------------------------------
CREATE TABLE Asistencia (
  ID_asistencia INT         NOT NULL AUTO_INCREMENT,
  Id_estudiante INT         NOT NULL,
  ID_Docente    INT         NOT NULL,
  Id_Materia    INT         NOT NULL,
  Estado        VARCHAR(20) NOT NULL COMMENT 'Ej: Presente, Ausente, Tardanza',
  Fecha         DATE        NOT NULL,
  PRIMARY KEY (ID_asistencia),
  CONSTRAINT fk_asi_estudiante FOREIGN KEY (Id_estudiante) REFERENCES Estudiantes (Id_estudiante) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_asi_docente    FOREIGN KEY (ID_Docente)    REFERENCES Docente     (ID_docente)    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_asi_materia    FOREIGN KEY (Id_Materia)    REFERENCES Materias    (Id_Materia)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Calificaciones
-- ------------------------------------------------------------
CREATE TABLE Calificaciones (
  Id_Calificacion INT   NOT NULL AUTO_INCREMENT,
  Id_curso        INT   NOT NULL,
  Id_estudiante   INT   NOT NULL,
  Id_Materia      INT   NOT NULL,
  Nota            FLOAT NOT NULL,
  PRIMARY KEY (Id_Calificacion),
  CONSTRAINT fk_cal_curso       FOREIGN KEY (Id_curso)      REFERENCES Curso       (ID_Curso)      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cal_estudiante  FOREIGN KEY (Id_estudiante) REFERENCES Estudiantes (Id_estudiante) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cal_materia     FOREIGN KEY (Id_Materia)    REFERENCES Materias    (Id_Materia)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Inscripcion
-- ------------------------------------------------------------
CREATE TABLE Inscripcion (
  ID_inscripcion INT NOT NULL AUTO_INCREMENT,
  ID_Estudiante  INT NOT NULL,
  Id_curso       INT NOT NULL,
  Fecha          DATE NOT NULL,
  Estado         VARCHAR(20) NOT NULL DEFAULT 'Activa',
  PRIMARY KEY (ID_inscripcion),
  CONSTRAINT fk_ins_estudiante FOREIGN KEY (ID_Estudiante) REFERENCES Estudiantes (Id_estudiante) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ins_curso FOREIGN KEY (Id_curso) REFERENCES Curso (ID_Curso) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Pagos
-- ------------------------------------------------------------
CREATE TABLE Pagos (
  ID_Pago       INT            NOT NULL AUTO_INCREMENT,
  Id_estudiante INT            NOT NULL,
  Fecha         DATE           NOT NULL,
  Metodo        VARCHAR(50)    NOT NULL COMMENT 'Ej: Efectivo, Transferencia, Tarjeta',
  Monto         DECIMAL(10, 2) NOT NULL,
  Concepto      VARCHAR(200)   NOT NULL,
  Estado        VARCHAR(50)    NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (ID_Pago),
  CONSTRAINT fk_pag_estudiante FOREIGN KEY (Id_estudiante) REFERENCES Estudiantes (Id_estudiante) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLA: Factura
-- ------------------------------------------------------------
CREATE TABLE Factura (
  Id_Factura INT NOT NULL AUTO_INCREMENT,
  ID_Pago    INT NOT NULL,
  PRIMARY KEY (Id_Factura),
  CONSTRAINT fk_fac_pago FOREIGN KEY (ID_Pago) REFERENCES Pagos (ID_Pago) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================

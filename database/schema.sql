-- =============================================================================
-- BASE DE DATOS: DesignAI - INFOCAL Santa Cruz
-- Sistema Inteligente de Asistencia para el Aprendizaje de Diseño Gráfico
-- Carrera: Diseño Gráfico y Comunicación Visual - INFOCAL Santa Cruz
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `designai_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `designai_db`;

-- Desactivar temporalmente revisión de claves foráneas para reconstrucción segura
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Gestión de cuentas de estudiantes, docentes y administradores de INFOCAL
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('estudiante', 'docente', 'administrador') NOT NULL DEFAULT 'estudiante',
  `matricula` VARCHAR(50) NULL COMMENT 'Código de estudiante / matrícula INFOCAL',
  `carrera` VARCHAR(100) NOT NULL DEFAULT 'Diseño Gráfico y Comunicación Visual',
  `avatar_url` VARCHAR(255) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuarios_email` (`email`),
  INDEX `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del ecosistema DesignAI INFOCAL';

-- -----------------------------------------------------------------------------
-- 2. TABLA: proyectos
-- Carpetas / proyectos de trabajo creados por los estudiantes
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `proyectos`;
CREATE TABLE `proyectos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NULL,
  `categoria` ENUM('editorial', 'publicidad', 'branding', 'ui_ux', 'ilustracion', 'otro') NOT NULL DEFAULT 'editorial',
  `estado` ENUM('activo', 'completado', 'archivado') NOT NULL DEFAULT 'activo',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_proyectos_usuario` (`usuario_id`),
  INDEX `idx_proyectos_categoria` (`categoria`),
  CONSTRAINT `fk_proyectos_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Proyectos creativos de los estudiantes';

-- -----------------------------------------------------------------------------
-- 3. TABLA: analisis_diseno (Módulo 1: Analizador Inteligente de Diseños)
-- Evaluación multimodal de afiches, posts de redes sociales, portadas, etc.
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `analisis_diseno`;
CREATE TABLE `analisis_diseno` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `proyecto_id` INT NULL,
  `titulo_diseno` VARCHAR(200) NOT NULL,
  `tipo_diseno` ENUM('afiche', 'red_social', 'editorial', 'identidad_visual', 'packaging', 'otro') NOT NULL DEFAULT 'afiche',
  `contexto_diseno` TEXT NULL COMMENT 'Contexto del proyecto, público objetivo y objetivos de comunicación',
  `imagen_url` VARCHAR(255) NOT NULL COMMENT 'Ruta local del archivo procesado',
  `puntaje_general` DECIMAL(4,2) NULL COMMENT 'Escala 1 a 10',
  `puntaje_composicion` DECIMAL(4,2) NULL COMMENT 'Regla de tercios, equilibrio, espacio en blanco',
  `puntaje_jerarquia` DECIMAL(4,2) NULL COMMENT 'Escala visual, lectura, puntos focales',
  `puntaje_contraste` DECIMAL(4,2) NULL COMMENT 'Contraste cromático, figura-fondo, legibilidad',
  `analisis_composicion` TEXT NULL,
  `analisis_jerarquia` TEXT NULL,
  `analisis_contraste` TEXT NULL,
  `recomendaciones_mejora` TEXT NULL,
  `resultado_json` JSON NOT NULL COMMENT 'Estructura completa de evaluación retornada por Gemini',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_analisis_usuario` (`usuario_id`),
  INDEX `idx_analisis_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_analisis_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_analisis_proyecto` 
    FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulo 1: Evaluaciones y reportes estructurados de diseño gráfico';

-- -----------------------------------------------------------------------------
-- 4. TABLA: paletas_colores (Módulo 2: Generador Inteligente de Paletas)
-- Paletas cromáticas con ratios de contraste WCAG y aplicación práctica
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `paletas_colores`;
CREATE TABLE `paletas_colores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `proyecto_id` INT NULL,
  `nombre_paleta` VARCHAR(150) NOT NULL,
  `concepto` TEXT NOT NULL COMMENT 'Brief de color o concepto de marca/campaña',
  `publico_objetivo` VARCHAR(200) NULL,
  `emocion_estilo` VARCHAR(100) NULL COMMENT 'Ej: Minimalista, Enérgico, Confiable, Juvenil',
  `imagen_url` VARCHAR(255) NULL COMMENT 'Ruta de la imagen de referencia si fue extraída',
  `colores_hex_rgb` JSON NOT NULL COMMENT 'Arreglo JSON: [{hex, rgb, nombre, rol, descripcion}]',
  `evaluacion_wcag` JSON NOT NULL COMMENT 'Análisis de accesibilidad WCAG 2.1 AA/AAA entre pares de color',
  `consejos_aplicacion` TEXT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_paletas_usuario` (`usuario_id`),
  INDEX `idx_paletas_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_paletas_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_paletas_proyecto` 
    FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulo 2: Generador y evaluador de paletas cromáticas WCAG';

-- -----------------------------------------------------------------------------
-- 5. TABLA: asistente_tipografico (Módulo 3: Asistente Tipográfico)
-- Emparejamiento de fuentes, familias y jerarquía de lectura
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `asistente_tipografico`;
CREATE TABLE `asistente_tipografico` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `proyecto_id` INT NULL,
  `tipo_proyecto` VARCHAR(150) NOT NULL COMMENT 'Ej: Revista cultural, Sitio Web Corporativo, Packaging',
  `estilo_deseado` VARCHAR(100) NOT NULL COMMENT 'Ej: Serif elegante, Moderno grotesco, Editorial audaz',
  `imagen_url` VARCHAR(255) NULL COMMENT 'Ruta de imagen de referencia analizada para tipografía',
  `fuente_titulo` VARCHAR(100) NOT NULL,
  `fuente_cuerpo` VARCHAR(100) NOT NULL,
  `fuente_acento` VARCHAR(100) NULL,
  `justificacion_combinacion` TEXT NULL,
  `reglas_jerarquia` JSON NULL COMMENT 'Reglas de tamaños, pesos (font-weight), tracking e interlineado',
  `enlaces_google_fonts` JSON NULL COMMENT 'URLs e instrucciones de importación Google Fonts',
  `resultado_json` JSON NOT NULL COMMENT 'Respuesta completa y estructurada del modelo IA',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tipografia_usuario` (`usuario_id`),
  INDEX `idx_tipografia_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_tipografia_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tipografia_proyecto` 
    FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulo 3: Recomendaciones y jerarquías tipográficas';

-- -----------------------------------------------------------------------------
-- 6. TABLA: ideas_conceptos (Módulo 4: Generador de Ideas y Conceptos)
-- Brainstorming estructurado y propuestas de dirección de arte
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ideas_conceptos`;
CREATE TABLE `ideas_conceptos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `proyecto_id` INT NULL,
  `prompt_idea` TEXT NOT NULL COMMENT 'Descripción inicial del estudiante',
  `categoria` VARCHAR(100) NOT NULL,
  `publico_meta` VARCHAR(150) NULL,
  `palabras_clave` JSON NOT NULL COMMENT 'Lista de tags y conceptos nucleares',
  `propuestas_conceptuales` JSON NOT NULL COMMENT 'Propuestas creativas con título, narrativa, estilo y metáfora visual',
  `orientacion_cromatica` TEXT NULL,
  `estilo_visual_sugerido` VARCHAR(150) NULL,
  `resultado_json` JSON NOT NULL COMMENT 'Respuesta estructurada completa',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ideas_usuario` (`usuario_id`),
  INDEX `idx_ideas_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_ideas_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ideas_proyecto` 
    FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulo 4: Generador de ideas conceptuales y dirección creativa';

-- -----------------------------------------------------------------------------
-- 7. TABLA: evaluador_uiux (Módulo 5: Evaluador de Interfaces UI/UX)
-- Análisis heurístico y técnico de interfaces digitales
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `evaluador_uiux`;
CREATE TABLE `evaluador_uiux` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `proyecto_id` INT NULL,
  `titulo_pantalla` VARCHAR(200) NOT NULL,
  `tipo_dispositivo` ENUM('mobile', 'desktop', 'tablet', 'dashboard') NOT NULL DEFAULT 'mobile',
  `imagen_url` VARCHAR(255) NOT NULL,
  `puntaje_usabilidad` DECIMAL(4,2) NULL COMMENT 'Escala 1 a 10',
  `evaluacion_distribucion` TEXT NULL COMMENT 'Análisis de layout, retícula y espaciado',
  `evaluacion_legibilidad` TEXT NULL COMMENT 'Análisis de escaneabilidad y microcopy',
  `evaluacion_accesibilidad` TEXT NULL COMMENT 'Análisis de áreas de toque, contraste y affordance',
  `hallazgos_heuristica` JSON NOT NULL COMMENT 'Puntos fuertes y oportunidades de mejora',
  `recomendaciones_ux` JSON NOT NULL COMMENT 'Acciones correctivas concretas recomendadas',
  `resultado_json` JSON NOT NULL COMMENT 'Reporte estructurado generado por Gemini',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_uiux_usuario` (`usuario_id`),
  INDEX `idx_uiux_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_uiux_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_uiux_proyecto` 
    FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Módulo 5: Evaluador de interfaces gráficas digitales y experiencia de usuario';

-- -----------------------------------------------------------------------------
-- 8. TABLA: historial_actividad
-- Registro cronológico de actividades y uso de herramientas para estadísticas
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `historial_actividad`;
CREATE TABLE `historial_actividad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `modulo` ENUM('analizador', 'colores', 'tipografia', 'ideas', 'ui_ux', 'proyecto', 'autenticacion') NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `referencia_id` INT NULL COMMENT 'ID de la fila relacionada en la tabla respectiva',
  `metadatos` JSON NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_historial_usuario` (`usuario_id`),
  INDEX `idx_historial_modulo` (`modulo`),
  INDEX `idx_historial_fecha` (`creado_en`),
  CONSTRAINT `fk_historial_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de auditoría y estadísticas de aprendizaje';

-- Restaurar revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- DATOS SEMILLA (SEEDS) INICIALES
-- Contraseña por defecto para cuentas de prueba: 'Infocal2026!'
-- Hash bcrypt correspondiente: $2b$10$Q7wE3z6F2s4R5u6T7y8U9.w1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y
-- (En Fase 2 y 3 se provee script de migración automática con hashes directos)
-- =============================================================================

INSERT INTO `usuarios` (`id`, `nombre_completo`, `email`, `password_hash`, `rol`, `matricula`, `carrera`, `activo`)
VALUES 
  (1, 'Administrador INFOCAL', 'admin@infocal.edu.bo', '$2b$10$bQoFhX5Rk9w17qjF21n6zOeZcZ3bU2rL3wP9mK1sT0vY7uI4eX8rS', 'administrador', 'ADM-2026-01', 'Dirección de Carrera - Diseño Gráfico', 1),
  (2, 'Estudiante Modelo INFOCAL', 'estudiante@infocal.edu.bo', '$2b$10$bQoFhX5Rk9w17qjF21n6zOeZcZ3bU2rL3wP9mK1sT0vY7uI4eX8rS', 'estudiante', 'DG-784920', 'Diseño Gráfico y Comunicación Visual', 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `proyectos` (`id`, `usuario_id`, `titulo`, `descripcion`, `categoria`, `estado`)
VALUES 
  (1, 2, 'Campaña Concientización Medioambiental 2026', 'Diseño de afiches y material digital para redes sociales sobre reciclaje urbano en Santa Cruz.', 'publicidad', 'activo'),
  (2, 2, 'Rediseño de Identidad Visual Artesanos del Oriente', 'Propuesta de branding y empaques para productos artesanales regionales.', 'branding', 'activo')
ON DUPLICATE KEY UPDATE `titulo` = VALUES(`titulo`);

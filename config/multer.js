/**
 * Configuración de Multer para la subida y almacenamiento temporal de imágenes
 * DesignAI - INFOCAL Santa Cruz
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// En entornos serverless (Netlify/AWS Lambda), usar el directorio temporal /tmp
const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);
const uploadsDir = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '..', 'public', 'uploads');

// Asegurar que el directorio de uploads exista
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: diseno-[timestamp]-[random].[extension]
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `diseno-${uniqueSuffix}${ext}`);
  }
});

// Filtro de formatos de imagen permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no soportado. Formatos válidos: JPG, PNG o WEBP.'), false);
  }
};

// Límite de tamaño: 10MB por defecto
const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10;

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxMb * 1024 * 1024
  }
});

module.exports = upload;

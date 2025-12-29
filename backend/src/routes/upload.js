// backend/src/routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

// Configurar multer para armazenar em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
});

/**
 * @route   POST /api/upload
 * @desc    Upload de foto para Cloudinary
 * @access  Private
 */
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto foi enviada' });
    }

    // Converter buffer para base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'guia-aventureiro',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da foto' });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload de múltiplas fotos
 * @access  Private
 */
router.post('/multiple', auth, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhuma foto foi enviada' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'guia-aventureiro',
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({ photos: results });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload das fotos' });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Deletar foto do Cloudinary
 * @access  Private
 */
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Remover prefixo se existir
    const cleanPublicId = publicId.replace('guia-aventureiro/', '');
    const fullPublicId = `guia-aventureiro/${cleanPublicId}`;

    await cloudinary.uploader.destroy(fullPublicId);

    res.status(200).json({ message: 'Foto deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ message: 'Erro ao deletar foto' });
  }
});

module.exports = router;

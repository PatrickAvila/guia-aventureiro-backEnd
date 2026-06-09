// backend/src/routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');
const { canUploadPhoto, incrementUsage } = require('../middleware/checkLimits');
const Itinerary = require('../models/Itinerary');

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
 * IMPORTANTE: upload.single() DEVE vir ANTES de canUploadPhoto para popular req.body
 */
router.post('/', auth, upload.single('photo'), canUploadPhoto, async (req, res) => {
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
      transformation: [{ width: 1200, height: 800, crop: 'limit' }, { quality: 'auto' }],
    });

    // Se tem itineraryId, adicionar foto ao roteiro
    if (req.itinerary) {
      if (!req.itinerary.rating) {
        req.itinerary.rating = {};
      }
      if (!req.itinerary.rating.photos) {
        req.itinerary.rating.photos = [];
      }
      req.itinerary.rating.photos.push(result.secure_url);
      await req.itinerary.save();
    }

    // Não incrementar contador global de fotos (limite é por roteiro)
    // if (req.subscription) {
    //   req.subscription.incrementUsage('photos');
    //   await req.subscription.save();
    // }

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ message: 'Erro ao fazer upload da foto' });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload de múltiplas fotos
 * @access  Private
 * IMPORTANTE: upload.array() DEVE vir ANTES de canUploadPhoto para popular req.body
 */
router.post('/multiple', auth, upload.array('photos', 10), canUploadPhoto, async (req, res) => {
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
        transformation: [{ width: 1200, height: 800, crop: 'limit' }, { quality: 'auto' }],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    });

    const results = await Promise.all(uploadPromises);

    // Se tem itineraryId, adicionar fotos ao roteiro
    if (req.itinerary) {
      if (!req.itinerary.rating) {
        req.itinerary.rating = {};
      }
      if (!req.itinerary.rating.photos) {
        req.itinerary.rating.photos = [];
      }
      const photoUrls = results.map((r) => r.url);
      req.itinerary.rating.photos.push(...photoUrls);
      await req.itinerary.save();
      console.log(`📸 ${photoUrls.length} fotos adicionadas ao roteiro:`, req.itinerary._id);
    }

    res.status(200).json({ photos: results });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload das fotos' });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Deletar foto do Cloudinary com validação de vínculo ao roteiro
 * @access  Private
 */
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const itineraryId = req.query.itineraryId || req.body?.itineraryId;

    if (!itineraryId) {
      return res.status(400).json({ message: 'itineraryId é obrigatório para deletar foto' });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const collaborator =
      itinerary.collaborators &&
      itinerary.collaborators.find((collab) => collab.user.toString() === req.userId.toString());

    if (!isOwner && !collaborator) {
      return res.status(403).json({ message: 'Sem permissão para deletar foto deste roteiro' });
    }

    if (!itinerary.rating || !Array.isArray(itinerary.rating.photos)) {
      return res.status(404).json({ message: 'Nenhuma foto encontrada neste roteiro' });
    }

    const cleanPublicId = decodeURIComponent(publicId).replace('guia-aventureiro/', '');
    const fullPublicId = `guia-aventureiro/${cleanPublicId}`;

    const photoUrlIndex = itinerary.rating.photos.findIndex(
      (photoUrl) =>
        typeof photoUrl === 'string' && photoUrl.includes(`/guia-aventureiro/${cleanPublicId}`)
    );

    if (photoUrlIndex === -1) {
      return res.status(404).json({ message: 'Foto não vinculada ao roteiro informado' });
    }

    itinerary.rating.photos.splice(photoUrlIndex, 1);
    await itinerary.save();

    await cloudinary.uploader.destroy(fullPublicId);

    res.status(200).json({ message: 'Foto deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ message: 'Erro ao deletar foto' });
  }
});

/**
 * @route   DELETE /api/upload
 * @desc    Remove foto do roteiro (persistência) e tenta remover do Cloudinary
 * @access  Private
 */
router.delete('/', auth, async (req, res) => {
  try {
    const { itineraryId, photoUrl } = req.body || {};

    if (!itineraryId || !photoUrl) {
      return res.status(400).json({ message: 'itineraryId e photoUrl são obrigatórios' });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    const isOwner = itinerary.owner && itinerary.owner.toString() === req.userId.toString();
    const collaborator =
      itinerary.collaborators &&
      itinerary.collaborators.find((collab) => collab.user.toString() === req.userId.toString());

    if (!isOwner && !collaborator) {
      return res.status(403).json({ message: 'Sem permissão para remover foto deste roteiro' });
    }

    if (!itinerary.rating || !Array.isArray(itinerary.rating.photos)) {
      return res.status(404).json({ message: 'Nenhuma foto encontrada neste roteiro' });
    }

    const photoIndex = itinerary.rating.photos.indexOf(photoUrl);
    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Foto não encontrada no roteiro' });
    }

    itinerary.rating.photos.splice(photoIndex, 1);
    await itinerary.save();

    try {
      const matches = photoUrl.match(/\/guia-aventureiro\/([^/.]+)/);
      if (matches && matches[1]) {
        const publicId = `guia-aventureiro/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryError) {
      console.error(
        'Falha ao remover imagem no Cloudinary (foto já removida do roteiro):',
        cloudinaryError.message
      );
    }

    return res.status(200).json({
      message: 'Foto removida com sucesso',
      remainingPhotos: itinerary.rating.photos,
    });
  } catch (error) {
    console.error('Erro ao remover foto do roteiro:', error);
    return res.status(500).json({ message: 'Erro ao remover foto do roteiro' });
  }
});

module.exports = router;

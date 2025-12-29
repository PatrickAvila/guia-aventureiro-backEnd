// backend/src/middleware/checkOwnership.js
const Itinerary = require('../models/Itinerary');

const checkOwnership = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado.' });
    }

    // Verificar se é owner ou colaborador
    const isOwner = itinerary.owner.toString() === req.userId.toString();
    const isCollaborator = itinerary.collaborators.some(
      collab => collab.user.toString() === req.userId.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este roteiro.' });
    }

    // Verificar permissão de edição se for colaborador
    if (!isOwner && req.method !== 'GET') {
      const collaborator = itinerary.collaborators.find(
        collab => collab.user.toString() === req.userId.toString()
      );

      if (collaborator.permission !== 'edit') {
        return res.status(403).json({ message: 'Você não tem permissão para editar este roteiro.' });
      }
    }

    req.itinerary = itinerary;
    req.isOwner = isOwner;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões.', error: error.message });
  }
};

module.exports = checkOwnership;
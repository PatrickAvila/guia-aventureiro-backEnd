// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { recordFailedAttempt, clearFailedAttempts } = require('../middleware/ipBlocker');

// Gerar tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Cadastro
exports.signup = async (req, res) => {
  try {
    const { name, email, password, acceptedTerms } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ message: 'Você deve aceitar os termos de uso.' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    // Validar força da senha
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    // Verificar se já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }

    // Criar usuário (email sempre em lowercase)
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password, 
      acceptedTerms 
    });
    await user.save();

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Salvar refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: `Bem-vindo, ${user.name}!`,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar conta.', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // Buscar usuário com password (email sempre lowercase)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      // Não revelar se o email existe ou não (proteger contra enumeração)
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Registrar tentativa falha
      recordFailedAttempt(req);
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Salvar refresh token e last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Login bem-sucedido, limpar tentativas falhas
    clearFailedAttempts(req);

    // Remover password do retorno
    user.password = undefined;

    res.json({
      message: `Bem-vindo, ${user.name}!`,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token não fornecido.' });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuário
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Refresh token inválido.' });
    }

    // Gerar novo access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Atualizar refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token inválido ou expirado.' });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer logout.', error: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.', error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences, publicProfile } = req.body;

    const user = await User.findById(req.userId);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (publicProfile !== undefined) user.publicProfile = publicProfile;

    await user.save();

    res.json({ message: 'Perfil atualizado com sucesso.', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil.', error: error.message });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    // Buscar usuário COM a senha (select: false por padrão)
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar senha.', error: error.message });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Conta excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir conta.', error: error.message });
  }
};

// Get public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name avatar isPremium createdAt publicProfile preferences');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (!user.publicProfile) {
      return res.status(403).json({ message: 'Perfil privado.' });
    }

    // Buscar estatísticas
    const Itinerary = require('../models/Itinerary');
    const itineraries = await Itinerary.find({ owner: userId });
    
    const stats = {
      totalItineraries: itineraries.length,
      completedItineraries: itineraries.filter(i => i.status === 'concluido').length,
      countries: [...new Set(itineraries.map(i => i.destination.country))].length,
    };

    res.json({
      user: {
        name: user.name,
        avatar: user.avatar,
        isPremium: user.isPremium,
        memberSince: user.createdAt,
        preferences: user.preferences,
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil público.', error: error.message });
  }
};
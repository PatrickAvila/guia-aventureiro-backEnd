/**
 * Validation Helpers - Utilities para validação de dados
 */

module.exports = {
  /**
   * Valida email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida senha forte
   * @param {string} password - Senha
   * @returns {object} - { valid: boolean, errors: [] }
   */
  validatePassword: (password) => {
    const errors = [];

    if (!password || password.length < 6) {
      errors.push('Senha deve ter no mínimo 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Valida URL
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida ObjectId do MongoDB
   * @param {string} id - ID a validar
   * @returns {boolean}
   */
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  /**
   * Valida CPF (brasileiro)
   * @param {string} cpf - CPF (apenas números)
   * @returns {boolean}
   */
  isValidCPF: (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    let rest;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  },

  /**
   * Valida CNPJ (brasileiro)
   * @param {string} cnpj - CNPJ (apenas números)
   * @returns {boolean}
   */
  isValidCNPJ: (cnpj) => {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  },

  /**
   * Valida telefone brasileiro
   * @param {string} phone - Telefone
   * @returns {boolean}
   */
  isValidPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  },

  /**
   * Valida range de datas
   * @param {Date|string} startDate - Data inicial
   * @param {Date|string} endDate - Data final
   * @returns {boolean}
   */
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  },

  /**
   * Valida latitude
   * @param {number} lat - Latitude
   * @returns {boolean}
   */
  isValidLatitude: (lat) => {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
  },

  /**
   * Valida longitude
   * @param {number} lng - Longitude
   * @returns {boolean}
   */
  isValidLongitude: (lng) => {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
  },

  /**
   * Valida que campo não está vazio
   * @param {any} value - Valor a validar
   * @returns {boolean}
   */
  isNotEmpty: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  },

  /**
   * Valida tipo MIME de arquivo
   * @param {string} mimetype - Tipo MIME
   * @param {array} allowedTypes - Tipos permitidos
   * @returns {boolean}
   */
  isValidMimeType: (mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return allowedTypes.includes(mimetype);
  },

  /**
   * Valida tamanho de arquivo
   * @param {number} size - Tamanho em bytes
   * @param {number} maxSize - Tamanho máximo em bytes
   * @returns {boolean}
   */
  isValidFileSize: (size, maxSize = 5 * 1024 * 1024) => {
    return size <= maxSize;
  },
};

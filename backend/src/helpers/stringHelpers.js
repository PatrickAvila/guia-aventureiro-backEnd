/**
 * String Helpers - Utilities para manipulação de strings
 */

module.exports = {
  /**
   * Gera slug a partir de um texto
   * @param {string} text - Texto a converter
   * @returns {string} - Ex: "meu-titulo-exemplo"
   */
  slugify: (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por -
      .replace(/--+/g, '-') // Remove -- duplicados
      .trim();
  },

  /**
   * Trunca texto com ellipsis
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Tamanho máximo
   * @returns {string}
   */
  truncate: (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  },

  /**
   * Sanitiza email (lowercase + trim)
   * @param {string} email - Email a sanitizar
   * @returns {string}
   */
  sanitizeEmail: (email) => {
    if (!email) return '';
    return email.toLowerCase().trim();
  },

  /**
   * Capitaliza primeira letra
   * @param {string} text - Texto
   * @returns {string}
   */
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Capitaliza cada palavra
   * @param {string} text - Texto
   * @returns {string}
   */
  titleCase: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Remove espaços extras
   * @param {string} text - Texto
   * @returns {string}
   */
  cleanSpaces: (text) => {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Mascara email para exibição
   * @param {string} email - Email
   * @returns {string} - Ex: "jo***@example.com"
   */
  maskEmail: (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const masked = name.substring(0, 2) + '***';
    return `${masked}@${domain}`;
  },

  /**
   * Gera string aleatória
   * @param {number} length - Tamanho
   * @returns {string}
   */
  randomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Extrai iniciais do nome
   * @param {string} name - Nome completo
   * @returns {string} - Ex: "JD" para "João da Silva"
   */
  getInitials: (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  },

  /**
   * Remove caracteres especiais
   * @param {string} text - Texto
   * @returns {string}
   */
  removeSpecialChars: (text) => {
    if (!text) return '';
    return text.replace(/[^a-zA-Z0-9 ]/g, '');
  },

  /**
   * Verifica se string contém apenas números
   * @param {string} text - Texto
   * @returns {boolean}
   */
  isNumeric: (text) => {
    return /^\d+$/.test(text);
  },

  /**
   * Formata número de telefone brasileiro
   * @param {string} phone - Telefone (apenas números)
   * @returns {string} - Ex: "(11) 98765-4321"
   */
  formatPhoneBR: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  /**
   * Sanitiza HTML (remove tags)
   * @param {string} html - HTML string
   * @returns {string}
   */
  stripHtml: (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  },
};

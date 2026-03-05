/**
 * Date Helpers - Utilities para manipulação de datas
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

module.exports = {
  /**
   * Formata data para string
   * @param {Date|string} date - Data a formatar
   * @param {string} format - Formato desejado (default: 'YYYY-MM-DD')
   * @returns {string}
   */
  formatDate: (date, format = 'YYYY-MM-DD') => {
    if (!date) return null;
    return dayjs(date).format(format);
  },

  /**
   * Formata data para exibição brasileira
   * @param {Date|string} date - Data
   * @returns {string} - Ex: "01/03/2026"
   */
  formatDateBR: (date) => {
    if (!date) return null;
    return dayjs(date).format('DD/MM/YYYY');
  },

  /**
   * Adiciona dias a uma data
   * @param {Date|string} date - Data base
   * @param {number} days - Número de dias a adicionar
   * @returns {Date}
   */
  addDays: (date, days) => {
    return dayjs(date).add(days, 'day').toDate();
  },

  /**
   * Subtrai dias de uma data
   * @param {Date|string} date - Data base
   * @param {number} days - Número de dias a subtrair
   * @returns {Date}
   */
  subtractDays: (date, days) => {
    return dayjs(date).subtract(days, 'day').toDate();
  },

  /**
   * Verifica se data está no futuro
   * @param {Date|string} date - Data a verificar
   * @returns {boolean}
   */
  isFuture: (date) => {
    return dayjs(date).isAfter(dayjs());
  },

  /**
   * Verifica se data está no passado
   * @param {Date|string} date - Data a verificar
   * @returns {boolean}
   */
  isPast: (date) => {
    return dayjs(date).isBefore(dayjs());
  },

  /**
   * Calcula diferença em dias entre duas datas
   * @param {Date|string} startDate - Data inicial
   * @param {Date|string} endDate - Data final
   * @returns {number}
   */
  daysBetween: (startDate, endDate) => {
    return dayjs(endDate).diff(dayjs(startDate), 'day');
  },

  /**
   * Verifica se uma data está entre duas outras
   * @param {Date|string} date - Data a verificar
   * @param {Date|string} start - Data inicial
   * @param {Date|string} end - Data final
   * @returns {boolean}
   */
  isBetween: (date, start, end) => {
    return dayjs(date).isBetween(dayjs(start), dayjs(end), null, '[]');
  },

  /**
   * Retorna início do dia
   * @param {Date|string} date - Data
   * @returns {Date}
   */
  startOfDay: (date) => {
    return dayjs(date).startOf('day').toDate();
  },

  /**
   * Retorna fim do dia
   * @param {Date|string} date - Data
   * @returns {Date}
   */
  endOfDay: (date) => {
    return dayjs(date).endOf('day').toDate();
  },

  /**
   * Verifica se data é válida
   * @param {Date|string} date - Data a validar
   * @returns {boolean}
   */
  isValidDate: (date) => {
    return dayjs(date).isValid();
  },

  /**
   * Retorna data atual
   * @returns {Date}
   */
  now: () => {
    return new Date();
  },

  /**
   * Formata duração em dias para texto legível
   * @param {number} days - Número de dias
   * @returns {string} - Ex: "3 dias", "1 semana", "2 meses"
   */
  formatDuration: (days) => {
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    if (days < 7) return `${days} dias`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? '1 semana' : `${weeks} semanas`;
    }
    const months = Math.floor(days / 30);
    return months === 1 ? '1 mês' : `${months} meses`;
  },

  /**
   * Converte para timezone de São Paulo
   * @param {Date|string} date - Data
   * @returns {Date}
   */
  toSaoPauloTime: (date) => {
    return dayjs(date).tz('America/Sao_Paulo').toDate();
  },
};

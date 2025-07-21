/**
 * Get nested property from object using dot notation
 * @param {Object} obj - The object to query
 * @param {string} path - The path of the property to get
 * @param {*} defaultValue - The value returned for undefined resolved values
 * @returns {*} Returns the resolved value
 */
export function getNestedValue(obj, path, defaultValue = null) {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Format date string to locale date string
 * @param {string} dateString - The date string to format
 * @param {Object} options - Options for toLocaleDateString
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

/**
 * Format status with appropriate badge class
 * @param {string} status - The status value
 * @returns {Object} Object with text and class properties
 */
export function formatStatus(status) {
  if (!status) return { text: 'Inconnu', class: 'bg-secondary' };
  
  const statusMap = {
    actif: { text: 'Actif', class: 'bg-success' },
    inactif: { text: 'Inactif', class: 'bg-secondary' },
    suspendu: { text: 'Suspendu', class: 'bg-warning' },
    banni: { text: 'Banni', class: 'bg-danger' },
    en_attente: { text: 'En attente', class: 'bg-info' },
  };
  
  return statusMap[status.toLowerCase()] || { text: status, class: 'bg-secondary' };
}

/**
 * Format currency value
 * @param {number} value - The numeric value
 * @param {string} currency - The currency code (default: 'EUR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'EUR') {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(value);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generate initials from a name
 * @param {string} name - The full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Generate pagination range for display
 * @param {number} current - Current page number
 * @param {number} last - Last page number
 * @param {number} delta - Number of pages to show around current
 * @returns {Array} Array of page numbers with possible nulls for ellipsis
 */
export function generatePaginationRange(current, last, delta = 2) {
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);
  
  for (let i = current - delta; i <= current + delta; i++) {
    if (i < last && i > 1) {
      range.push(i);
    }
  }  
  
  range.push(last);
  range.sort((a, b) => a - b);
  
  for (let i of range) {
    if (l) {
      if (i - l > 1) {
        rangeWithDots.push(null);
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  
  return rangeWithDots;
}

/**
 * Reusable helper functions for formatting and asset URL generation.
 */

/**
 * Resolves media/document paths to full asset URLs.
 * Handles both absolute URLs and relative backend paths.
 * 
 * @param {string} path 
 * @returns {string}
 */
export const getAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `http://127.0.0.1:8000/storage/${path}`
}

/**
 * Formats a numeric value into IDR currency string.
 * 
 * @param {number|string} val 
 * @returns {string}
 */
export const formatPrice = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val)
}

/**
 * Formats ISO date strings into local date-time strings.
 * 
 * @param {string} val 
 * @returns {string}
 */
export const formatDateTime = (val) => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).replace(/\./g, ':')
  } catch (err) {
    return val
  }
}

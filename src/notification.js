import toast from 'react-hot-toast';

export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);
/**
 * @typedef {Object} msgs
 * @property {string} loading
 * @property {string} success
 * @property {string} error
 */

/**
 * @param {msgs} messages
 */
export const notifyPromise = (promise, msgs) => toast.promise(promise, msgs);
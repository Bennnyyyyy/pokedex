/**
 * Saves data to localStorage
 * @param {string} key - The key to store the data under
 * @param {any} data - The data to store
 */
export const saveToStorage = (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  /**
   * Retrieves data from localStorage
   * @param {string} key - The key to retrieve data from
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - The retrieved data or defaultValue
   */
  export const getFromStorage = (key, defaultValue = null) => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return defaultValue;
    }
  };
  
  /**
   * Removes data from localStorage
   * @param {string} key - The key to remove
   */
  export const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };
  
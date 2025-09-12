/**
 * Converts pixels to rem units
 * @param {number} value - Value in pixels
 * @returns {number} Value in rem units
 */
const pxToRem = (value) => viewEnv.pxToRem(value);

/**
 * Converts rem units to pixels
 * @param {number} value - Value in rem units
 * @returns {number} Value in pixels
 */
const remToPx = (value) => viewEnv.remToPx(value);

/**
 * Gets the current scale factor
 * @returns {number} Current scale factor
 */
const getScale = () => remToPx(1);

/**
 * Gets the current display size.
 * @param {'px' | 'rem'} [type='px'] - The unit type for the returned size.
 * @returns {{width: number, height: number}} An object containing the width and height.
 */
const getSize = (type = "px") =>
    type === "px" ? viewEnv.getClientSizePx() : viewEnv.getClientSizeRem();

// Export public functions and constants
export { pxToRem, remToPx, getSize, getScale };

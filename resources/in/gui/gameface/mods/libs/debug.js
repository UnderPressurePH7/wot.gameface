/**
 * Recursively logs the structure of an object for debugging purposes.
 * @param {*} obj - The object to be logged.
 * @param {object} [options={}] - Formatting options.
 * @param {number} [options.indentSize=2] - The number of spaces for indentation.
 * @param {number} [options.maxDepth=10] - The maximum depth of recursion.
 * @param {boolean} [options.showArrayIndex=true] - Whether to display array indices.
 * @param {number} [currentDepth=0] - The current recursion depth (for internal use).
 * @param {string} [prefix=''] - The prefix for the current line (for internal use).
 */
function debugObject(obj, options = {}, currentDepth = 0, prefix = "") {
    // Default options
    const { indentSize = 2, maxDepth = 10, showArrayIndex = true } = options;

    const indent = " ".repeat(currentDepth * indentSize);

    // Prevent infinite recursion
    if (currentDepth > maxDepth) {
        console.error(`${indent}${prefix}... [max depth reached]`);
        return;
    }

    // Handle primitive values
    if (obj === null || obj === undefined || typeof obj !== "object") {
        console.error(`${indent}${prefix}${String(obj)}`);
        return;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            console.error(`${indent}${prefix}[]`);
            return;
        }

        console.error(`${indent}${prefix}[`);
        obj.forEach((item, index) => {
            const nextPrefix = showArrayIndex ? `${index}: ` : "";
            debugObject(item, options, currentDepth + 1, nextPrefix);
        });
        console.error(`${indent}]`);
        return;
    }

    // Handle objects
    const keys = Object.keys(obj);
    if (keys.length === 0) {
        console.error(`${indent}${prefix}{}`);
        return;
    }

    console.error(`${indent}${prefix}{`);
    keys.forEach((key) => {
        debugObject(obj[key], options, currentDepth + 1, `${key}: `);
    });
    console.error(`${indent}}`);
}

/**
 * Builds a debug tree from a DOM element.
 * @param {Element} element - The DOM element to analyze.
 * @param {number} [depth=0] - The current depth in the tree (for internal use).
 * @param {number} [maxDepth=5] - The maximum depth to traverse.
 * @returns {object|null} A tree structure representing the element, or null if the element is invalid.
 */
function buildDebugTree(element, depth = 0, maxDepth = 5) {
    // Stop recursion if element is invalid or max depth reached
    if (!element || depth > maxDepth) return null;

    // Extract attributes
    const attrs = {};
    if (element.hasAttributes && element.hasAttributes()) {
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
        }
    }

    // Extract inline styles (safe for Gameface)
    const styles = {};
    if (element.style && element.style.length) {
        for (let i = 0; i < element.style.length; i++) {
            const propName = element.style.item(i);
            styles[propName] = element.style.getPropertyValue(propName);
        }
    }

    // Extract and shorten text content
    let shortText = null;
    if (element.textContent) {
        const textContent = element.textContent.trim();
        shortText =
            textContent.length > 100
                ? textContent.slice(0, 100) + "..."
                : textContent;
    }

    // Build node object
    const node = {
        tag: element.tagName,
        attributes: attrs,
        styles: styles,
        content: shortText,
        depth: depth,
        children: [],
        rect: (() => {
            if (typeof element.getBoundingClientRect !== "function") {
                return undefined;
            }
            const rect = element.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
            };
        })(),
    };

    // Recursively process child elements
    if (element.children && element.children.length > 0) {
        for (let i = 0; i < element.children.length; i++) {
            const childNode = buildDebugTree(
                element.children[i],
                depth + 1,
                maxDepth,
            );
            if (childNode) node.children.push(childNode);
        }
    }

    return node;
}

/**
 * Debugs a DOM element by logging its structure in chunks.
 * @param {Element} element - The DOM element to debug.
 * @param {number} [chunkSize=1000] - The size of JSON chunks to log, which helps avoid console limitations.
 */
function debugElement(element, chunkSize = 1000) {
    const tree = buildDebugTree(element, 0, 10);
    if (!tree) return;

    // Stringify and log in chunks to avoid console limitations
    const json = JSON.stringify(tree, null, 2);
    for (let i = 0; i < json.length; i += chunkSize) {
        console.error(json.slice(i, i + chunkSize));
    }
}

// Export debugging functions
export { debugObject, debugElement };

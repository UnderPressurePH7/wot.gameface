// It is initial script file for all GF views
// It is automatically read on the c++ side with variable substitution
// As a variable template, this string format is used: <%= variable %>
// If you want add new variable you need to add logic to gf_view_impl.cpp (GFViewImpl::onDomBuilt)

const documentCssRules = [
    `
        body {
            overflow-wrap: <%= overflowWrap %>;
        }
    `,
];

window.__feature = '<%= __feature %>';
window.__featureId = Number('<%= __featureId %>' || 0);

if (document.styleSheets.length === 0) {
    document.head.appendChild(document.createElement('style'));
}

const documentStyle = document.styleSheets[0];
documentCssRules.forEach((cssRule) => documentStyle.insertRule(cssRule, documentStyle.cssRules.length));
window.isDomBuilt = true;

window.engine.on('self.onScaleUpdated', (scale) => {
    document.documentElement.style.fontSize = `${scale}px`;
});




// =========================================================================================
// Gameface Resource Injector
// -----------------------------------------------------------------------------------------
// This script is loaded into every Gameface view. Its primary responsibility is to
// dynamically inject resources (CSS, JS, ES modules), provided by mods, into the
// active view.
//
// How it works:
// 1. The script listens for new subViews being added.
// 2. For each subView, it checks for the presence of a `ModInjectModel`.
// 3. If the model exists, the script injects all associated resources into the DOM:
//    - CSS files via <link> tags.
//    - JS files and ES modules via <script> tags.
// 4. To avoid duplicate injections, it keeps track of already processed subViews.
// =========================================================================================

// Tracks the resId of subViews whose resources have already been injected to prevent duplicates.
const injectedResIds = new Set();

// Defines asset categories, their corresponding HTML tags, and default attributes.
const assetTypes = [
    { type: "styles",  tag: "link",   defaults: { rel: "stylesheet" } },
    { type: "scripts", tag: "script", defaults: { type: "text/javascript" } },
    { type: "modules", tag: "script", defaults: { type: "module" } }
];

/**
 * Creates and appends a DOM element for a given asset (CSS or JS).
 *
 * @param {string} type - The logical type of the asset ("styles", "scripts", "modules").
 * @param {string} tagName - The HTML tag to create ("link" or "script").
 * @param {string} url - The URL of the resource.
 * @param {Object} [attributes={}] - Additional attributes to apply to the element (e.g., { rel: "stylesheet" }).
 */
function injectAsset(type, tagName, url, attributes = {}) {
    const el = document.createElement(tagName);

    // Set crossOrigin to avoid potential loading restrictions
    el.crossOrigin = "";

    // Set URL and specific attributes based on the tag type
    if (type === "styles") {
        el.href = url;
    } else {
        el.src = url;
        el.defer = true;
    }

    // Apply default and any additional passed attributes
    Object.assign(el, attributes);

    // Append the element to the document's body
    document.body.appendChild(el);
}

/**
 * Injects all resources for a given subView if they haven't been injected yet.
 *
 * @param {string} resId - The unique identifier of the subView (provided by Gameface).
 */
function injectModAssets(resId) {
    // Skip if resources for this subView have already been injected
    if (injectedResIds.has(resId)) return;

    // Get the injection model from the subView's data
    const featureModule = window.subViews.get(resId)?.model?.ModInjectModel;
    if (!featureModule) return;

    // Mark the subView as processed to prevent duplicate injections
    injectedResIds.add(resId);

    // Iterate over each asset type (styles, scripts, modules)
    assetTypes.forEach(({type, tag, defaults}) => {
        // Inject each asset of this type if the asset array exists
        featureModule[type]?.forEach(asset => {
            if (asset?.value) { // Ensure the asset has an URL
                injectAsset(type, tag, asset.value, { ...defaults });
            }
        });
    });
}

// =========================================================================================
// Engine Lifecycle Hooks
// -----------------------------------------------------------------------------------------

engine.whenReady.then(() => {
    // Inject resources for subViews added dynamically at runtime
    window.engine.on("subViews.onAdded", (resIds) =>
        resIds.forEach(injectModAssets),
    );

    // Inject resources for subViews already present when the script initializes
    window.subViews.ids().forEach(injectModAssets);
});

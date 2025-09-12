import { pxToRem, remToPx } from "./common.js";

// Define event types for view interactions
const ViewEventTypes = {
    tooltip: 1,
    popover: 2,
    contextMenu: 4,
};

/**
 * Serializes event arguments for the view system.
 * @param {*} value - The value to be serialized.
 * @returns {object|undefined} The serialized value object, or undefined if the type is unsupported.
 */
function serializeEventArgument(value) {
    if (value === undefined) return;

    switch (typeof value) {
        case "number":
            return { number: value };
        case "boolean":
            return { bool: value };
        case "string":
            return { string: value };
        default:
            if (value !== null) {
                console.warn("Unsupported argument type", typeof value);
            }
            return;
    }
}

/**
 * Creates formatted arguments for view events.
 * @param {object} args - Key-value pairs of arguments.
 * @returns {Array<object>} An array of formatted argument objects.
 */
function createViewEventArguments(args) {
    const result = [];

    for (const [key, value] of Object.entries(args)) {
        const serialized = serializeEventArgument(value);
        if (serialized !== undefined) {
            result.push({
                __Type: "GFValueProxy",
                name: key,
                ...serialized,
            });
        }
    }

    return result;
}

/**
 * Sends a view event to the game interface.
 * @param {number} type - The event type from `ViewEventTypes`.
 * @param {object} [options] - Event options, including arguments.
 * @returns {*} The result of the view event handling.
 */
function sendViewEvent(type, options) {
    const GFViewEventType = "GFViewEventProxy";

    if (options !== undefined) {
        const { args, ...rest } = options;

        const eventPayload = {
            __Type: GFViewEventType,
            type,
            ...rest,
        };

        if (args !== undefined) {
            eventPayload.arguments = createViewEventArguments(args);
        }

        return viewEnv.handleViewEvent(eventPayload);
    }

    // If no options provided, send a minimal event
    return viewEnv.handleViewEvent({
        __Type: GFViewEventType,
        type,
    });
}

/**
 * Serializes a DOM element's bounding box for the view system.
 * @param {DOMRect} e - The DOMRect object from `getBoundingClientRect()`.
 * @returns {object} The serialized bounding box object.
 */
function serializeGlobalBoundingBox(e) {
    return {
        __Type: "GFBoundingBox",
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
    };
}

/**
 * Gets the global position of the view.
 * @param {'rem' | 'px'} [unit='rem'] - The unit for the result.
 * @returns {{x: number, y: number}} The position object with x and y coordinates.
 */
function getViewGlobalPosition(unit = "rem") {
    const positionRem = viewEnv.getViewGlobalPositionRem();

    return unit === "rem"
        ? positionRem
        : {
              x: remToPx(positionRem.x),
              y: remToPx(positionRem.y),
          };
}

/**
 * Shows a tooltip with the specified content.
 * @param {string} header - The header text for the tooltip.
 * @param {string} body - The body text for the tooltip.
 * @param {string} [contentID] - The ID of the tooltip content.
 * @param {string} [decoratorID] - The ID of the tooltip decorator.
 */
const showTooltip = (
    header = "",
    body = "",
    contentID = R.views.common.tooltip_window.simple_tooltip_content.SimpleTooltipContent(
        "resId",
    ),
    decoratorID = R.views.common.tooltip_window.tooltip_window.TooltipWindow(
        "resId",
    ),
) => {
    sendViewEvent(ViewEventTypes.tooltip, {
        contentID: contentID,
        decoratorID: decoratorID,
        targetID: 0,
        isMouseEvent: true,
        on: true,
        args: {
            body: body,
            header: header,
        },
    });
};

/**
 * Hides a tooltip.
 * @param {string} [contentID] - The ID of the tooltip content.
 * @param {string} [decoratorID] - The ID of the tooltip decorator.
 */
const hideTooltip = (
    contentID = R.views.common.tooltip_window.simple_tooltip_content.SimpleTooltipContent(
        "resId",
    ),
    decoratorID = R.views.common.tooltip_window.tooltip_window.TooltipWindow(
        "resId",
    ),
) => {
    sendViewEvent(ViewEventTypes.tooltip, {
        contentID: contentID,
        decoratorID: decoratorID,
        targetID: 0,
        on: false,
    });
};

/**
 * Shows a popover element at the specified position.
 * @param {HTMLElement} caller - The element that triggered the popover.
 * @param {string} alias - The popover's alias or identifier.
 * @param {string} [contentID] - The ID of the popover content.
 * @param {string} [decoratorID] - The ID of the popover decorator.
 */
const showPopover = (
    caller,
    alias,
    contentID = R.aliases.common.popOver.Backport("resId"),
    decoratorID = R.views.common.pop_over_window.backport_pop_over.BackportPopOverWindow(
        "resId",
    ),
) => {
    const globalPos = getViewGlobalPosition("px");
    const callerRect = caller.getBoundingClientRect();

    const offsetX = remToPx(Math.trunc(2));
    const offsetY = remToPx(Math.trunc(2));

    const boundingBox = {
        x: pxToRem(callerRect.x + globalPos.x - offsetX),
        y: pxToRem(callerRect.y + globalPos.y - offsetY),
        width: pxToRem(callerRect.width + offsetX),
        height: pxToRem(callerRect.height + offsetY),
    };

    sendViewEvent(ViewEventTypes.popover, {
        contentID: contentID,
        decoratorID: decoratorID,
        targetID: 0,
        direction: 2, // Direction constant (e.g., 2 might mean "up" or "down")
        bbox: serializeGlobalBoundingBox(boundingBox),
        on: true,
        isMouseEvent: true,
        args: {
            popoverId: alias,
        },
    });
};

// Export public functions and constants
export { ViewEventTypes, showPopover, showTooltip, hideTooltip };

import { getScale, getSize } from "./common.js";

/**
 * Creates a media context for handling screen size and scale changes.
 * @returns {{
 *   width: number,
 *   height: number,
 *   scale: number,
 *   subscribe: function(): void,
 *   unsubscribe: function(): void,
 *   onUpdate: function(Function): void
 * }}
 */
const MediaContext = () => {
    const context = {
        width: 0,
        height: 0,
        scale: 0,
        onUpdateCallbacks: [],

        /**
         * Subscribes to media events for resize and scale changes.
         */
        subscribe() {
            engine.on("clientResized", this.onClientResized.bind(this));
            engine.on("self.onScaleUpdated", this.onScaleUpdated.bind(this));
        },

        /**
         * Unsubscribes from media events.
         */
        unsubscribe() {
            engine.off("clientResized", this.onClientResized.bind(this));
            engine.off("self.onScaleUpdated", this.onScaleUpdated.bind(this));
        },

        /**
         * Handles client resize events.
         * @param {number} actualWidth - The new width.
         * @param {number} actualHeight - The new height.
         */
        onClientResized(actualWidth, actualHeight) {
            this.width = actualWidth;
            this.height = actualHeight;
            this.notifyUpdate();
        },

        /**
         * Handles scale update events.
         * @param {number} actualScale - The new scale factor.
         */
        onScaleUpdated(actualScale) {
            this.scale = actualScale;
            this.notifyUpdate();
        },

        /**
         * Registers a callback for media updates.
         * @param {function(object): void} callback - The function to be called on media changes.
         */
        onUpdate(callback) {
            this.onUpdateCallbacks.push(callback);
        },

        /**
         * Notifies all registered callbacks about media changes.
         */
        notifyUpdate() {
            for (const cb of this.onUpdateCallbacks) {
                cb({
                    width: this.width,
                    height: this.height,
                    scale: this.scale,
                });
            }
        },
    };

    engine.whenReady.then(() => {
        const size = getSize();
        context.width = size.width;
        context.height = size.height;
        context.scale = getScale();
        context.notifyUpdate();
    });

    return context;
};

// Export public functions and constants
export { MediaContext };

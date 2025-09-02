/**
 * Creates an observer for a specific model within subViews.
 * This observer provides a subscription mechanism for data change notifications.
 *
 * @param {string} [featureName] - The name of the feature model to observe. If not provided, the observer will target the main window model.
 * @returns {{
 *   resId: number|null,
 *   model: object|null,
 *   subscribe: function(): void,
 *   unsubscribe: function(): void,
 *   onUpdate: function(function(object): void): void
 * }}
 */
const ModelObserver = (featureName) => {
    const context = {
        resId: null,
        callbackId: null,
        onUpdateCallbacks: [],

        /**
         * Subscribes to model change events in the game engine.
         */
        subscribe() {
            // Bind handlers once to avoid creating new function refs
            this._boundOnDataChanged = this.onDataChanged.bind(this);
            engine.on("viewEnv.onDataChanged", this._boundOnDataChanged);
            if (!this.resId) return;
            this.callbackId = viewEnv.addDataChangedCallback(
                "model",
                this.resId,
                true,
            );
        },

        /**
         * Unsubscribes from model change events.
         */
        unsubscribe() {
            if (this._boundOnDataChanged) {
                engine.off("viewEnv.onDataChanged", this._boundOnDataChanged);
            }
            if (this.callbackId && this.resId) {
                viewEnv.removeDataChangedCallback(this.callbackId, this.resId);
            }
            this._boundOnDataChanged = null;
            this.callbackId = null;
        },

        /**
         * Retrieves the observed model object.
         * @returns {object|null} The model if found; otherwise, null.
         */
        get model() {
            return this.resId
                ? window.subViews.get(this.resId)?.model
                : window.model;
        },

        /**
         * Registers a callback that fires when the model changes.
         * @param {function(object): void} callback - The function to call with the updated model.
         */
        onUpdate(callback) {
            this.onUpdateCallbacks.push(callback);
        },

        /**
         * Internal handler for data change events.
         * @private
         */
        onDataChanged() {
            this.notifyUpdate();
        },

        /**
         * Notifies all registered callbacks with the current model.
         * @private
         */
        notifyUpdate() {
            for (const cb of this.onUpdateCallbacks) {
                cb(this.model);
            }
        },
    };

    // If a feature name is provided, we want use subView model
    // find the corresponding resId for it when the engine is ready.
    if (featureName) {
        engine.whenReady.then(() => {
            for (const resId of window.subViews.ids()) {
                const modModel =
                    window.subViews.get(resId)?.model?.ModInjectModel;
                if (modModel && modModel.name === featureName) {
                    context.resId = resId;
                    break;
                }
            }
        });
    }

    return context;
};

// Export public functions and constants
export { ModelObserver };

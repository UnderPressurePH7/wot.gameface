/**
 * Plays a sound effect.
 * @param {string} name - The name of the sound to be played.
 */
const playSound = (name) => {
    engine.call("PlaySound", name).catch((error) => {
        console.error("[mods/libs/sounds.js] playSound(", name, "): ", error);
    });
};

// Export public functions and constants
export { playSound };

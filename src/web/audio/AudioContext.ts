import { ControllerManager } from "../input/ControllerManager";

// Get cross-browser AudioContext (Safari still uses webkitAudioContext…)
const AudioContext = window.AudioContext ?? window.webkitAudioContext;

let audioContext: AudioContext | null = null;

/**
 * Returns the (one and only) audio context in use.
 * If no audio context exists, e.g. when this function is called for the first time, it will be created.
 *
 * @param controllerManager Used to initially resume (start?) the audio context, on the first user interaction.
 * @returns
 *   The one (and only) audio context.
 */
export function getAudioContext(controllerManager: ControllerManager = ControllerManager.getInstance()): AudioContext {

    if (audioContext == null) {
        audioContext = new AudioContext();

        // When audio context is suspended then try to wake it up on next key or pointer press
        if (audioContext.state === "suspended") {
            const resume = (): void => void audioContext?.resume();

            controllerManager.onButtonDown.connect(resume);
            document.addEventListener("pointerdown", resume);

            audioContext.addEventListener("statechange", () => {
                if (audioContext?.state === "running") {
                    controllerManager.onButtonDown.disconnect(resume);
                    document.removeEventListener("pointerdown", resume);
                }
            });
        }
    }

    return audioContext;
}

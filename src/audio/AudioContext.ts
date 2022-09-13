import { ControllerManager } from "../input/ControllerManager";

// Get cross-browser AudioContext (Safari still uses webkitAudioContext…)
const AudioContext = window.AudioContext ?? (window as any).webkitAudioContext as AudioContext;

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
    const controllerManager = ControllerManager.getInstance();

    if (audioContext == null) {
        audioContext = new AudioContext();

        // When audio context is suspended then try to wake it up on next key or pointer press
        if (audioContext.state === "suspended") {
            const resume = () => {
                audioContext?.resume();
            };

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

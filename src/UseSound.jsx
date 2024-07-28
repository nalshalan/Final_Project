import { useEffect, useRef } from 'react';

// Maintain a pool of reusable audio objects
const audioPool = {};

function UseSound (soundFile, isSoundEffectsMuted) {
    const soundRef = useRef(audioPool[soundFile] || new Audio(soundFile));
    audioPool[soundFile] = soundRef.current;

    const play = () => {
        const audio = soundRef.current;
        if (!isSoundEffectsMuted) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    };

    useEffect(() => {
        const audio = soundRef.current;
        audio.volume = 1.0;

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    return play;
};

export default UseSound;
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';

const SmartTuner = () => {
    const [isListening, setIsListening] = useState(false);
    const [note, setNote] = useState('--');
    const [cents, setCents] = useState(0);
    const [frequency, setFrequency] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const micStreamRef = useRef(null);
    const animationFrameRef = useRef(null);

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const startTuner = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            setIsListening(true);
            updateTuner();
        } catch (err) {
            console.error("Acceso al micrófono denegado:", err);
            alert("Necesitamos acceso al micrófono para el afinador.");
        }
    };

    const stopTuner = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (micStreamRef.current) micStreamRef.current.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        setIsListening(false);
        setNote('--');
        setCents(0);
    };

    const updateTuner = () => {
        const bufferLength = analyserRef.current.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        const pitch = autoCorrelate(buffer, audioContextRef.current.sampleRate);

        if (pitch !== -1) {
            setFrequency(Math.round(pitch));
            const noteNum = 12 * (Math.log2(pitch / 440)) + 69;
            const noteName = notes[Math.round(noteNum) % 12];
            const diffInCents = (noteNum - Math.round(noteNum)) * 100;

            setNote(noteName);
            setCents(Math.round(diffInCents));
        }

        animationFrameRef.current = requestAnimationFrame(updateTuner);
    };

    // Algoritmo de Autocorrelación para detección de Pitch
    const autoCorrelate = (buffer, sampleRate) => {
        let SIZE = buffer.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1; // Ruido de fondo insuficiente

        let r1 = 0, r2 = SIZE - 1, thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
        }

        const trimmedBuffer = buffer.slice(r1, r2);
        SIZE = trimmedBuffer.length;

        const c = new Float32Array(SIZE);
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - i; j++) {
                c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
            }
        }

        let d = 0;
        while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < SIZE; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;

        let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
        let a = (x1 + x3 - 2 * x2) / 2;
        let b = (x3 - x1) / 2;
        if (a) T0 = T0 - b / (2 * a);

        return sampleRate / T0;
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <Activity size={24} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Smart Tuner Pro</h3>
            </div>

            <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '4px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: Math.abs(cents) < 10 ? 'var(--accent-secondary)' : 'white' }}>
                    {note}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {isListening ? `${frequency} Hz` : 'Silencio'}
                </div>

                {/* Pointer (simplified UI) */}
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    width: '80%',
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '4px',
                        height: '100%',
                        background: Math.abs(cents) < 10 ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                        position: 'absolute',
                        left: `${50 + (cents / 2)}%`,
                        transition: 'left 0.1s ease-out'
                    }} />
                </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: Math.abs(cents) < 10 ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}>
                {isListening ? (Math.abs(cents) < 10 ? '¡Afinado!' : (cents > 0 ? 'Muy agudo' : 'Muy grave')) : 'Presiona iniciar'}
            </div>

            <button
                onClick={isListening ? stopTuner : startTuner}
                style={{
                    width: '100%',
                    background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-primary)',
                    color: isListening ? '#ef4444' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                {isListening ? 'Detener Afinador' : 'Iniciar Afinador'}
            </button>
        </div>
    );
};

export default SmartTuner;

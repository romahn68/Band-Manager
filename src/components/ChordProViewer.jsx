import React, { useState } from 'react';
import ChordSheetJS from 'chordsheetjs';
// Removed Instrument import due to Vite missing export compatibility
import styles from './ChordProViewer.module.css';
import { motion, AnimatePresence } from 'framer-motion';

// Mocked basic dictionaries to avoid heavy payloads, but keeping structure for react-chords
// For a production app, these dictionaries would be fetched from an API or comprehensive local JSON.
const guitarChords = {
    main: {
        strings: 6,
        fretsOnChord: 4,
        name: 'Guitar',
        keys: [],
        tunings: { standard: ['E', 'A', 'D', 'G', 'B', 'E'] }
    },
    chords: {
        'C': [{ frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] }],
        'G': [{ frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4] }],
        'D': [{ frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] }],
        'Am': [{ frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] }],
        'Em': [{ frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] }],
        'F': [{ frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] }]
        // We add just a few for demonstration, full dictionary is external.
    }
};

const ChordProViewer = ({ content }) => {
    const [instrument, setInstrument] = useState(localStorage.getItem('preferredInstrument') || 'guitar');
    const [activeChord, setActiveChord] = useState(null);

    const handleInstrumentChange = (e) => {
        const val = e.target.value;
        setInstrument(val);
        localStorage.setItem('preferredInstrument', val);
    };

    if (!content) return null;

    let song;
    try {
        const parser = new ChordSheetJS.ChordProParser();
        song = parser.parse(content);
    } catch (e) {
        return <div className={styles.error}>Error parseando la canción: {e.message}</div>;
    }

    const renderDiagram = (chordName) => {
        // Fallback custom text-based diagram instead of heavy SVG library
        if (instrument === 'guitar' && guitarChords.chords[chordName]) {
            return (
                <div className={styles.diagramTooltip} style={{ fontSize: '0.9rem', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ color: 'var(--accent-primary)' }}>{chordName}</strong>
                    <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', letterSpacing: '2px' }}>
                        {guitarChords.chords[chordName][0].frets.map(f => f === -1 ? 'X' : f).join('-')}
                    </div>
                </div>
            );
        }
        return (
            <div className={styles.diagramTooltip}>
                <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                    Diagrama no disponible para '{chordName}' ({instrument})
                </div>
            </div>
        );
    };

    return (
        <div className={`glass ${styles.viewerContainer}`}>
            <div className={styles.toolbar}>
                <h3 className={styles.songTitle}>{song.title || 'Canción'}</h3>
                <div className={styles.controls}>
                    <label>Instrumento:</label>
                    <select value={instrument} onChange={handleInstrumentChange} className={styles.instrumentSelect}>
                        <option value="guitar">🎸 Guitarra</option>
                        <option value="ukulele">🌴 Ukelele</option>
                        <option value="piano">🎹 Piano</option>
                    </select>
                </div>
            </div>

            <div className={styles.sheetContent}>
                {song.lines.map((line, lineIdx) => {
                    if (line.isEmpty()) {
                        return <div key={`empty-${lineIdx}`} className={styles.emptyLine}>&nbsp;</div>;
                    }

                    return (
                        <div key={`line-${lineIdx}`} className={styles.line}>
                            {line.items.map((item, itemIdx) => {
                                if (item.constructor.name === 'ChordLyricPair') {
                                    return (
                                        <div key={`pair-${lineIdx}-${itemIdx}`} className={styles.chordLyricPair}>
                                            {item.chords && (
                                                <div 
                                                    className={styles.chordWrapper}
                                                    onMouseEnter={() => setActiveChord(`${lineIdx}-${itemIdx}`)}
                                                    onMouseLeave={() => setActiveChord(null)}
                                                    onClick={() => setActiveChord(activeChord === `${lineIdx}-${itemIdx}` ? null : `${lineIdx}-${itemIdx}`)}
                                                >
                                                    <span className={styles.chordText}>{item.chords}</span>
                                                    <AnimatePresence>
                                                        {activeChord === `${lineIdx}-${itemIdx}` && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className={styles.tooltipContainer}
                                                            >
                                                                {renderDiagram(item.chords)}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                            <div className={styles.lyricText}>
                                                {item.lyrics || '\u00A0'}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                if (item.constructor.name === 'Tag') {
                                    if (item.name === 'title' || item.name === 'subtitle') return null; // Already show title
                                    return (
                                        <div key={`tag-${lineIdx}-${itemIdx}`} className={styles.tag}>
                                            <span className={styles.tagName}>{item.name}:</span> {item.value}
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChordProViewer;

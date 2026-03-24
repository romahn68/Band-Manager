import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Type, Play, Square, Settings } from 'lucide-react';
import styles from './ChordProViewer.module.css';
import ChordSheetJS from 'chordsheetjs';
import { AnimatePresence } from 'framer-motion';

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

const ChordProViewer = ({ content, parserType = 'chordpro', title = '' }) => {
    const [instrument, setInstrument] = useState(localStorage.getItem('preferredInstrument') || 'guitar');
    const [activeChord, setActiveChord] = useState(null);
    const [transposeDelta, setTransposeDelta] = useState(0);

    const handleInstrumentChange = (e) => {
        const val = e.target.value;
        setInstrument(val);
        localStorage.setItem('preferredInstrument', val);
    };

    const song = useMemo(() => {
        if (!content) return null;
        try {
            const parser = parserType === 'ultimate' 
                ? new ChordSheetJS.UltimateGuitarParser() 
                : new ChordSheetJS.ChordProParser();
            
            let parsedSong = parser.parse(content);
            if (transposeDelta !== 0) {
                parsedSong = parsedSong.transpose(transposeDelta);
            }
            return parsedSong;
        } catch (e) {
            console.error("ChordProViewer Parsing Error:", e);
            return { error: e.message };
        }
    }, [content, parserType, transposeDelta]);

    if (!content) return null;
    if (song?.error) return <div className={styles.error}>Error parseando la canción: {song.error}</div>;

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
                <h3 className={styles.songTitle}>{song.title || title || 'Canción'}</h3>
                <div className={styles.controls} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label>Tono:</label>
                        <button className={styles.btnSmall} onClick={() => setTransposeDelta(t => t - 1)}>-1</button>
                        <span style={{ minWidth: '20px', textAlign: 'center' }}>{transposeDelta > 0 ? `+${transposeDelta}` : transposeDelta}</span>
                        <button className={styles.btnSmall} onClick={() => setTransposeDelta(t => t + 1)}>+1</button>
                    </div>
                
                    <div>
                        <label>Instrumento:</label>
                        <select value={instrument} onChange={handleInstrumentChange} className={styles.instrumentSelect}>
                            <option value="guitar">🎸 Guitarra</option>
                            <option value="ukulele">🌴 Ukelele</option>
                            <option value="piano">🎹 Piano</option>
                        </select>
                    </div>
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
                                // Checking for properties is more robust than constructor.name for production builds
                                if (item.chords !== undefined || item.lyrics !== undefined) {
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
                                
                                if (item.name && item.value) {
                                    if (item.name === 'title' || item.name === 'subtitle') return null;
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

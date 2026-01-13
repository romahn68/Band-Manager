import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMessages, sendMessage } from '../services/firestoreService';
import { Send, MessageSquare } from 'lucide-react';

const ChatSession = ({ bandId, entityType, entityId, title }) => {
    const { currentUser, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (!bandId || !entityId) return;

        const unsubscribe = getMessages(bandId, entityType, entityId, (msgs) => {
            setMessages(msgs);
            // Auto scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe();
    }, [bandId, entityType, entityId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            text: newMessage,
            userId: currentUser.uid,
            userName: userProfile?.fullName || currentUser.displayName || 'Músico',
            entityType,
            entityId
        };

        try {
            await sendMessage(bandId, msgData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: '400px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                <MessageSquare size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: '600' }}>Chat: {title}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.userId === currentUser.uid ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            textAlign: msg.userId === currentUser.uid ? 'right' : 'left'
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                            {msg.userName}
                        </div>
                        <div
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '12px',
                                background: msg.userId === currentUser.uid ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    style={{ flex: 1, padding: '0.5rem 1rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem', background: 'var(--accent-secondary)', color: 'white' }}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatSession;

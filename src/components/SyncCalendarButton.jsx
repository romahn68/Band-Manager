import React from 'react';
import { Calendar } from 'lucide-react';

const SyncCalendarButton = ({ title, date, location, description }) => {
    const handleSync = () => {
        // Format: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
        // Since our dates are YYYY-MM-DD, we'll assume a default time of 20:00 to 23:00
        const dateSanitized = date.replace(/-/g, '');
        const startDate = `${dateSanitized}T200000Z`;
        const endDate = `${dateSanitized}T230000Z`;

        const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
        const params = new URLSearchParams({
            text: title,
            dates: `${startDate}/${endDate}`,
            details: description || "Evento agendado vía Band Manager Cloud",
            location: location || "",
            sf: "true",
            output: "xml"
        });

        window.open(`${baseUrl}&${params.toString()}`, '_blank');
    };

    return (
        <button
            onClick={handleSync}
            style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--accent-secondary)',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid var(--glass-border)'
            }}
            title="Sincronizar con Google Calendar"
        >
            <Calendar size={16} /> Sincronizar
        </button>
    );
};

export default SyncCalendarButton;

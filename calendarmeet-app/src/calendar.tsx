import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


const API = 'http://localhost:4000';

export default function Calendar() {
const calRef = useRef(null);

return (
<div>
<FullCalendar
ref={calRef}
plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
initialView="timeGridWeek"
selectable={true}
editable={true}
eventOverlap={true}
events={async (info, success, failure) => {
try {
const params = new URLSearchParams({ start: info.startStr, end: info.endStr });
const res = await fetch(`${API}/events?${params.toString()}`);
if (!res.ok) throw new Error("Failed to load events");
const data = await res.json();
success(data);
} catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    failure(e);
}
}}
dateClick={async (arg) => {
const title = prompt('Event title?');
if (!title) return;
const res = await fetch(`${API}/events`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title, start: arg.dateStr, allDay: arg.allDay })
});
if (res.ok) {
// Refetch events
(calRef.current as any)?.getApi().refetchEvents();
}
}}
eventDrop={async (info) => {
const { id, start, end } = info.event;
await fetch(`${API}/events/${id}/move`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ start: start?.toISOString(), end: end?.toISOString() })
});
}}
eventResize={async (info) => {
const { id, start, end } = info.event;
await fetch(`${API}/events/${id}/move`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ start: start?.toISOString(), end: end?.toISOString() })
});
}}
eventClick={async (info) => {
if (confirm('Delete this event?')) {
await fetch(`${API}/events/${info.event.id}`, { method: 'DELETE' });
(calRef.current as any)?.getApi().refetchEvents();
}
}}
/>
</div>
);
}
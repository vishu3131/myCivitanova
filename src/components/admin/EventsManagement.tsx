import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch('/api/events');
    const data = await response.json();
    setEvents(data);
  };

  const createEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, date, location }),
    });

    if (response.ok) {
      fetchEvents();
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
    }
  };

  const updateEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: selectedEventId, title, description, date, location }),
    });

    if (response.ok) {
      fetchEvents();
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setSelectedEventId(null);
    }
  };

  const deleteEvent = async (id: string) => {
    const response = await fetch('/api/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchEvents();
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEventId(event.id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setLocation(event.location);
  };

  return (
    <div>
      <h2>Gestione Eventi</h2>

      <div>
        <h3>Crea/Modifica Evento</h3>
        <input
          type="text"
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          placeholder="Data"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Luogo"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        {selectedEventId ? (
          <button onClick={updateEvent}>Aggiorna Evento</button>
        ) : (
          <button onClick={createEvent}>Crea Evento</button>
        )}
      </div>

      <div>
        <h3>Eventi Esistenti</h3>
        <table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Descrizione</th>
              <th>Data</th>
              <th>Luogo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.description}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td>
                  <button onClick={() => handleEventSelect(event)}>Modifica</button>
                  <button onClick={() => deleteEvent(event.id)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsManagement;
import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled';
  isFeatured: boolean;
  organizer: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxAttendees?: number;
  price?: number;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'cancelled'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [organizer, setOrganizer] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [price, setPrice] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [fileError, setFileError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  useEffect(() => {
    fetchEvents();
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    try {
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      return (session as any)?.access_token || null;
    } catch {
      return null;
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      setCurrentPage(1); // Reset alla prima pagina quando si caricano nuovi eventi
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Errore nel caricamento degli eventi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };





  const deleteEvent = async (id: string) => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.');
    
    if (!confirmed) return;
    
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Autenticazione richiesta');
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      alert('Evento eliminato con successo!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Errore durante l\'eliminazione dell\'evento');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setImageUrl('');
    setSelectedFile(null);
    setCategory('');
    setStatus('draft');
    setIsFeatured(false);
    setOrganizer('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setMaxAttendees('');
    setPrice('');
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEventId(event.id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setLocation(event.location);
    setImageUrl(event.imageUrl || '');
    setSelectedFile(null);
    setCategory(event.category);
    setStatus(event.status);
    setIsFeatured(event.isFeatured);
    setOrganizer(event.organizer);
    setEndDate(event.endDate || '');
    setStartTime(event.startTime || '');
    setEndTime(event.endTime || '');
    setMaxAttendees(event.maxAttendees?.toString() || '');
    setPrice(event.price?.toString() || '');
  };

  const validateFile = (file: File): string | null => {
    // Validazione tipo file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return 'Sono consentiti solo file immagine (JPEG, PNG, GIF, WEBP, SVG)';
    }

    // Validazione dimensione (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Il file non può superare 5MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    // Validazione lato client
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const idToken = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Errore nel caricamento del file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSubmit = async () => {
    let finalImageUrl = imageUrl;
    
    if (uploadMethod === 'file' && selectedFile) {
      try {
        finalImageUrl = await handleFileUpload(selectedFile);
      } catch (error) {
        alert('Errore nel caricamento dell\'immagine: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return;
      }
    }

    if (selectedEventId) {
      await updateEvent(finalImageUrl);
    } else {
      await createEvent(finalImageUrl);
    }
  };

  const createEvent = async (finalImageUrl: string) => {
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Autenticazione richiesta');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          title, 
          description, 
          date, 
          location, 
          imageUrl: finalImageUrl, 
          category, 
          status, 
          isFeatured, 
          organizer, 
          endDate, 
          startTime, 
          endTime, 
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null, 
          price: price ? parseFloat(price) : null 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      fetchEvents();
      resetForm();
      alert('Evento creato con successo!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Errore nella creazione dell\'evento: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateEvent = async (finalImageUrl: string) => {
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Autenticazione richiesta');
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          id: selectedEventId, 
          title, 
          description, 
          date, 
          location, 
          imageUrl: finalImageUrl, 
          category, 
          status, 
          isFeatured, 
          organizer, 
          endDate, 
          startTime, 
          endTime, 
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null, 
          price: price ? parseFloat(price) : null 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }

      fetchEvents();
      resetForm();
      setSelectedEventId(null);
      alert('Evento aggiornato con successo!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Errore nell\'aggiornamento dell\'evento: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Calcola gli eventi per la pagina corrente
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  // Funzioni per cambiare pagina
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Gestione Eventi</h2>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .event-table {
            font-size: 0.875rem;
          }
          .event-table th,
          .event-table td {
            padding: 0.25rem;
          }
          .pagination-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
          .pagination-info {
            order: -1;
            margin-bottom: 0.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .radio-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div>
        <h3>Crea/Modifica Evento</h3>
        <div className="form-grid" style={{ 
           display: 'grid', 
           gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', 
           gap: '1rem', 
           marginBottom: '2rem' 
         }}>
          <input
            type="text"
            placeholder="Titolo*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Organizzatore*"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <textarea
            placeholder="Descrizione*"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Metodo di caricamento</label>
            <div className="radio-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  checked={uploadMethod === 'url'}
                  onChange={() => setUploadMethod('url')}
                  style={{ marginRight: '0.5rem' }}
                />
                URL Immagine
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  checked={uploadMethod === 'file'}
                  onChange={() => setUploadMethod('file')}
                  style={{ marginRight: '0.5rem' }}
                />
                Carica File
              </label>
            </div>

            {uploadMethod === 'url' ? (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>URL Immagine</label>
                <input
                  type="text"
                  placeholder="URL Immagine"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </>
            ) : (
              <>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Seleziona File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    if (file) {
                      const error = validateFile(file);
                      setFileError(error || '');
                    } else {
                      setFileError('');
                    }
                  }}
                />
                {selectedFile && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>
                      File selezionato: {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>
                      Dimensione: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                {fileError && (
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
                    {fileError}
                  </p>
                )}
              </>
            )}
          </div>
          <input
            type="text"
            placeholder="Categoria*"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="date"
            placeholder="Data Inizio*"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="date"
            placeholder="Data Fine"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="time"
            placeholder="Ora Inizio"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="time"
            placeholder="Ora Fine"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Luogo*"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder="Numero massimo partecipanti"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(e.target.value)}
            min="0"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder="Prezzo (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'cancelled')}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
            <option value="cancelled">Cancellato</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Evento in evidenza
          </label>
        </div>
        {selectedEventId ? (
          <button 
            onClick={handleSubmit}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Aggiorna Evento
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Crea Evento
          </button>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Eventi Esistenti</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="event-table" style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '600px' // Forza una larghezza minima per mobile
          }}>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Luogo</th>
              <th>Organizzatore</th>
              <th>Stato</th>
              <th>In evidenza</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event) => (
              <tr key={event.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}>{event.title}</td>
                <td style={{ padding: '0.5rem' }}>{event.category}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(event.date).toLocaleDateString('it-IT')}</td>
                <td style={{ padding: '0.5rem' }}>{event.location}</td>
                <td style={{ padding: '0.5rem' }}>{event.organizer}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.875rem',
                    backgroundColor: event.status === 'published' ? '#10b981' : event.status === 'cancelled' ? '#ef4444' : '#6b7280',
                    color: 'white'
                  }}>
                    {event.status === 'published' ? 'Pubblicato' : event.status === 'cancelled' ? 'Cancellato' : 'Bozza'}
                  </span>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  {event.isFeatured ? '⭐' : ''}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button 
                    onClick={() => handleEventSelect(event)}
                    style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    Modifica
                  </button>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.875rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Paginazione */}
        {totalPages > 1 && (
          <div className="pagination-buttons" style={{ 
            marginTop: '1rem', 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Precedente
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: currentPage === page ? '#3b82f6' : 'white',
                  color: currentPage === page ? 'white' : '#374151',
                  cursor: 'pointer',
                  minWidth: '2.5rem'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Successiva
            </button>

            <span className="pagination-info" style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              margin: '0.5rem 0',
              textAlign: 'center',
              width: '100%'
            }}>
              Pagina {currentPage} di {totalPages} - {events.length} eventi totali
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsManagement;
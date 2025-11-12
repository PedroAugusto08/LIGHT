import { useState, useEffect } from 'react';

export default function NotesCard() {
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Carregar anotações do localStorage
    const savedNotes = localStorage.getItem('character_notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem('character_notes', newNotes);
  };

  return (
    <div className="notes-card">
      <div className="notes-header">
        <span className="notes-icon">📝</span>
        <h3>Anotações</h3>
      </div>
      
      <div className="notes-content">
        {isEditing ? (
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={handleNotesChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
            placeholder="Escreva suas anotações aqui..."
          />
        ) : (
          <div 
            className="notes-display"
            onClick={() => setIsEditing(true)}
          >
            {notes || 'Clique para adicionar anotações...'}
          </div>
        )}
      </div>
    </div>
  );
}

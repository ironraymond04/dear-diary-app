import { createContext, useState, useContext } from 'react';

const DiaryContext = createContext();

export function DiaryProvider({ children }) {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [lockedEntryId, setLockedEntryId] = useState(null);

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      isLocked: false,
      pin: null,
      ...entry
    };
    setDiaryEntries([newEntry, ...diaryEntries]);
  };

  const updateEntry = (id, updatedEntry) => {
    setDiaryEntries(diaryEntries.map(entry =>
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
    setEditingEntryId(null);
  };

  const deleteEntry = (id) => {
    setDiaryEntries(diaryEntries.filter(entry => entry.id !== id));
    setEditingEntryId(null);
  };

  const lockEntry = (id, pin) => {
    updateEntry(id, { isLocked: true, pin });
  };

  const unlockEntry = (id) => {
    setDiaryEntries(diaryEntries.map(entry =>
      entry.id === id ? { ...entry, isLocked: false, pin: null } : entry
    ));
  };

  const verifyEntryPin = (id, pin) => {
    const entry = diaryEntries.find(e => e.id === id);
    return entry && entry.pin === pin;
  };

  return (
    <DiaryContext.Provider value={{ 
      diaryEntries, 
      addEntry, 
      updateEntry, 
      deleteEntry, 
      editingEntryId, 
      setEditingEntryId,
      lockEntry,
      unlockEntry,
      verifyEntryPin,
      lockedEntryId,
      setLockedEntryId
    }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
}

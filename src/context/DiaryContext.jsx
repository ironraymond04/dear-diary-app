import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../lib/supabase';

const DiaryContext = createContext();

export function DiaryProvider({ children }) {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [lockedEntryId, setLockedEntryId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format server row -> UI entry shape
  function formatRow(row) {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      emotion: row.moods?.name || row._mood_name || '', // depending on join
      mood_id: row.mood_id,
      date: new Date(row.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      isLocked: !!row.is_private,
      pin: row.entry_pass ? String(row.entry_pass) : null,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  // Load moods by name (returns id). If not exists, insert then return id.
  async function getMoodIdByName(name) {
    if (!name) return null;
    // Trim & normalize
    const cleanName = String(name).trim();
    if (!cleanName) return null;

    // Try find existing
    const { data: existing, error: selErr } = await supabase
      .from('moods')
      .select('id')
      .ilike('name', cleanName)
      .limit(1)
      .single();

    if (!selErr && existing && existing.id) return existing.id;

    // Insert new
    const { data: inserted, error: insErr } = await supabase
      .from('moods')
      .insert({ name: cleanName })
      .select('id')
      .single();

    if (insErr) {
      console.error('Error inserting mood:', insErr);
      return null;
    }
    return inserted?.id ?? null;
  }

  // Fetch all diary entries for current user
  async function loadEntries() {
    setLoading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setDiaryEntries([]);
        setLoading(false);
        return;
      }

      // select diary entries and join mood name if present
      const { data, error } = await supabase
        .from('diaryentry')
        .select(`
          id,
          title,
          content,
          mood_id,
          created_at,
          updated_at,
          is_private,
          entry_pass,
          moods ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching diary entries:', error);
        setDiaryEntries([]);
        setLoading(false);
        return;
      }

      // map rows to UI format
      const rows = (data || []).map((r) => {
        // depending on supabase naming the joined mood may be "moods"
        // we'll place mood name into .moods?.name
        return formatRow({
          ...r,
          moods: r.moods?.[0] ? r.moods[0] : r.moods // safe guard if array
        });
      });

      setDiaryEntries(rows);
    } catch (err) {
      console.error('Unexpected error loading entries:', err);
      setDiaryEntries([]);
    } finally {
      setLoading(false);
    }
  }

  // Add an entry
  async function addEntry(entry) {
    setLoading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const mood_id = await getMoodIdByName(entry.emotion);

      const payload = {
        user_id: user.id,
        title: entry.title,
        content: entry.content,
        mood_id: mood_id,
        is_private: !!entry.isLocked,
        entry_pass: entry.pin ? Number(entry.pin) : null
      };

      const { data, error } = await supabase
        .from('diaryentry')
        .insert(payload)
        .select(`
          id,
          title,
          content,
          mood_id,
          created_at,
          updated_at,
          is_private,
          entry_pass,
          moods ( name )
        `)
        .single();

      if (error) {
        console.error('Error inserting entry:', error);
        return false;
      }

      // prepend to state
      setDiaryEntries((prev) => [formatRow({ ...data, moods: data.moods }), ...prev]);
      return true;
    } catch (err) {
      console.error('addEntry error', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Update an entry by id
  async function updateEntry(id, updatedEntry) {
    setLoading(true);
    try {
      const patch = {};
      if ('title' in updatedEntry) patch.title = updatedEntry.title;
      if ('content' in updatedEntry) patch.content = updatedEntry.content;
      if ('emotion' in updatedEntry) {
        const mood_id = await getMoodIdByName(updatedEntry.emotion);
        patch.mood_id = mood_id;
      }
      if ('isLocked' in updatedEntry) patch.is_private = !!updatedEntry.isLocked;
      if ('pin' in updatedEntry) patch.entry_pass = updatedEntry.pin ? Number(updatedEntry.pin) : null;

      const { data, error } = await supabase
        .from('diaryentry')
        .update(patch)
        .eq('id', id)
        .select(`
          id,
          title,
          content,
          mood_id,
          created_at,
          updated_at,
          is_private,
          entry_pass,
          moods ( name )
        `)
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return false;
      }

      // update local state
      setDiaryEntries((prev) =>
        prev.map((e) => (e.id === id ? formatRow({ ...data, moods: data.moods }) : e))
      );
      setEditingEntryId(null);
      return true;
    } catch (err) {
      console.error('updateEntry error', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Delete entry
  async function deleteEntry(id) {
    setLoading(true);
    try {
      const { error } = await supabase.from('diaryentry').delete().eq('id', id);
      if (error) {
        console.error('Error deleting entry:', error);
        return false;
      }

      setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
      setEditingEntryId(null);
      return true;
    } catch (err) {
      console.error('deleteEntry error', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Lock/unlock convenience wrappers (they call updateEntry)
  async function lockEntry(id, pin) {
    return updateEntry(id, { isLocked: true, pin: pin });
  }

  async function unlockEntry(id) {
    // set pin to null and isLocked false
    return updateEntry(id, { isLocked: false, pin: null });
  }

  // Verify entry PIN
  // Will check local state first; if not found, will fetch single row from DB to verify
  async function verifyEntryPin(id, pin) {
    if (!id) return false;
    const local = diaryEntries.find((e) => e.id === id);
    if (local && local.pin !== null) {
      return String(local.pin) === String(pin);
    }

    // fallback fetch
    try {
      const { data, error } = await supabase
        .from('diaryentry')
        .select('id, entry_pass')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching entry for pin verify:', error);
        return false;
      }
      return String(data.entry_pass) === String(pin);
    } catch (err) {
      console.error('verifyEntryPin error', err);
      return false;
    }
  }

  // Reload entries on mount and when auth state changes
  useEffect(() => {
    // initial load
    loadEntries();

    // subscribe to auth state changes to refresh entries for new user / logout
    const { data: authListener } = supabase.auth.onAuthStateChange((_evt, _session) => {
      loadEntries();
    });

    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DiaryContext.Provider
      value={{
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
        setLockedEntryId,
        loadEntries,
        loading
      }}
    >
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
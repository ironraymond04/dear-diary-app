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
      emotion: row.moods?.name || '',
      emoji: row.moods?.emoji || '',
      mood_id: row.mood_id,
      tag: row.tag_name || '', // tag name from joined data
      tag_id: row.tag_id || null,
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

  // Get or create mood by name and emoji
  async function getMoodIdByNameAndEmoji(name, emoji) {
    if (!name) return null;
    const cleanName = String(name).trim();
    if (!cleanName) return null;

    // Try find existing mood
    const { data: existing, error: selErr } = await supabase
      .from('moods')
      .select('id')
      .ilike('name', cleanName)
      .limit(1)
      .single();

    if (!selErr && existing && existing.id) return existing.id;

    // Insert new mood with emoji
    const { data: inserted, error: insErr } = await supabase
      .from('moods')
      .insert({ name: cleanName, emoji: emoji || null })
      .select('id')
      .single();

    if (insErr) {
      console.error('Error inserting mood:', insErr);
      return null;
    }
    return inserted?.id ?? null;
  }

  // Get or create tag by name
  async function getTagIdByName(tagName) {
    if (!tagName || !tagName.trim()) return null;
    
    const cleanTag = String(tagName).trim().toLowerCase();

    // Try find existing tag
    const { data: existing, error: selErr } = await supabase
      .from('tag')
      .select('id')
      .ilike('name', cleanTag)
      .limit(1)
      .single();

    if (!selErr && existing && existing.id) return existing.id;

    // Insert new tag
    const { data: inserted, error: insErr } = await supabase
      .from('tag')
      .insert({ name: cleanTag })
      .select('id')
      .single();

    if (insErr) {
      console.error('Error inserting tag:', insErr);
      return null;
    }
    return inserted?.id ?? null;
  }

  // Link entry to tag via junction table
  async function linkEntryTag(entryId, tagId) {
    if (!entryId || !tagId) return;

    // Check if already linked
    const { data: existing } = await supabase
      .from('entrytag')
      .select('entry_id')
      .eq('entry_id', entryId)
      .eq('tag_id', tagId)
      .single();

    if (existing) return; // Already linked

    const { error } = await supabase
      .from('entrytag')
      .insert({ entry_id: entryId, tag_id: tagId });

    if (error) {
      console.error('Error linking entry to tag:', error);
    }
  }

  // Unlink all tags from entry
  async function unlinkAllEntryTags(entryId) {
    if (!entryId) return;

    const { error } = await supabase
      .from('entrytag')
      .delete()
      .eq('entry_id', entryId);

    if (error) {
      console.error('Error unlinking tags:', error);
    }
  }

  // Fetch all diary entries for current user with tags
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

      // Fetch diary entries with moods
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
          moods ( name, emoji )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching diary entries:', error);
        setDiaryEntries([]);
        setLoading(false);
        return;
      }

      // For each entry, fetch its tag via junction table
      const entriesWithTags = await Promise.all(
        (data || []).map(async (entry) => {
          // Get tag for this entry
          const { data: tagData } = await supabase
            .from('entrytag')
            .select('tag_id, tag(name)')
            .eq('entry_id', entry.id)
            .limit(1)
            .single();

          return {
            ...entry,
            tag_name: tagData?.tag?.name || '',
            tag_id: tagData?.tag_id || null
          };
        })
      );

      const rows = entriesWithTags.map((r) => formatRow(r));
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

      // Get mood emoji from emotions array (you'll need to pass this)
      const emotionsMap = {
        "Happy": "😊",
        "Sad": "😢",
        "Excited": "🎉",
        "Anxious": "😰",
        "Calm": "😌",
        "Angry": "😠",
        "Grateful": "🙏",
        "Tired": "😴",
        "Hopeful": "🌟",
        "Lonely": "😔",
        "Content": "😊",
        "Stressed": "😫",
        "Peaceful": "☮️",
        "Frustrated": "😤",
        "Loved": "❤️"
      };

      const emoji = emotionsMap[entry.emotion] || '';
      const mood_id = await getMoodIdByNameAndEmoji(entry.emotion, emoji);

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
          moods ( name, emoji )
        `)
        .single();

      if (error) {
        console.error('Error inserting entry:', error);
        return false;
      }

      // Handle tag if provided
      if (entry.tag && entry.tag.trim()) {
        const tagId = await getTagIdByName(entry.tag);
        if (tagId) {
          await linkEntryTag(data.id, tagId);
        }
      }

      // Reload to get fresh data with tags
      await loadEntries();
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
        const emotionsMap = {
          "Happy": "😊",
          "Sad": "😢",
          "Excited": "🎉",
          "Anxious": "😰",
          "Calm": "😌",
          "Angry": "😠",
          "Grateful": "🙏",
          "Tired": "😴",
          "Hopeful": "🌟",
          "Lonely": "😔",
          "Content": "😊",
          "Stressed": "😫",
          "Peaceful": "☮️",
          "Frustrated": "😤",
          "Loved": "❤️"
        };
        
        const emoji = emotionsMap[updatedEntry.emotion] || '';
        const mood_id = await getMoodIdByNameAndEmoji(updatedEntry.emotion, emoji);
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
          moods ( name, emoji )
        `)
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return false;
      }

      // Handle tag update
      if ('tag' in updatedEntry) {
        // First, remove existing tag links
        await unlinkAllEntryTags(id);

        // Then add new tag if provided
        if (updatedEntry.tag && updatedEntry.tag.trim()) {
          const tagId = await getTagIdByName(updatedEntry.tag);
          if (tagId) {
            await linkEntryTag(id, tagId);
          }
        }
      }

      setEditingEntryId(null);
      
      // Reload to get fresh data with tags
      await loadEntries();
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
      // Junction table entries will be deleted automatically due to CASCADE
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

  // Lock/unlock convenience wrappers
  async function lockEntry(id, pin) {
    return updateEntry(id, { isLocked: true, pin: pin });
  }

  async function unlockEntry(id) {
    return updateEntry(id, { isLocked: false, pin: null });
  }

  // Verify entry PIN
  async function verifyEntryPin(id, pin) {
    if (!id) return false;
    const local = diaryEntries.find((e) => e.id === id);
    if (local && local.pin !== null) {
      return String(local.pin) === String(pin);
    }

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
    loadEntries();

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
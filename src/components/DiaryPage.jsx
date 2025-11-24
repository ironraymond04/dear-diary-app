import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDiary } from "../context/DiaryContext";
import { useTheme } from "../context/ThemeContext";
import supabase from "../lib/supabase";

export default function DiaryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { editingEntryId, setEditingEntryId } = useDiary();
  const { isDarkMode } = useTheme();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntry() {
      setLoading(true);

      // Fetch entry from Supabase with mood and tag
      const { data: entryData, error } = await supabase
        .from("diaryentry")
        .select("id, title, content, mood_id, entry_pass, moods(name, emoji)")
        .eq("id", id)
        .single();

      if (error || !entryData) {
        navigate("/main");
        return;
      }

      // Fetch tag for this entry via junction table
      const { data: tagData } = await supabase
        .from("entrytag")
        .select("tag_id, tag(name)")
        .eq("entry_id", id)
        .limit(1)
        .single();

      // Combine entry and tag data
      const fullEntry = {
        ...entryData,
        tag: tagData?.tag?.name || null
      };

      setEntry(fullEntry);

      // If entry is locked, check if it's been unlocked in this session
      if (entryData.entry_pass) {
        const unlockedEntries = JSON.parse(sessionStorage.getItem('unlockedEntries') || '[]');
        
        if (!unlockedEntries.includes(id)) {
          // Not unlocked yet - redirect to unlock page
          navigate(`/unlock/${id}`);
          return;
        }
      }

      // Entry is accessible - mark as currently editing
      setEditingEntryId(id);
      setLoading(false);
    }

    fetchEntry();
  }, [id, navigate, setEditingEntryId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!entry) return null;

  return (
    <div
      className={`p-6 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/main")}
        className={`cursor-pointer text-2xl mb-4 hover:opacity-70 transition-opacity ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        ←
      </button>

      {/* Title */}
      <h1
        className={`text-3xl font-bold mb-6 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Diary Entry
      </h1>

      {/* Diary Content */}
      <div
        className={`mt-4 p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-4">{entry.title}</h2>
        
        {/* Display Mood with Emoji */}
        {entry.moods && (
          <div className="flex items-center gap-2 mb-4">
            {entry.moods.emoji && <span className="text-2xl">{entry.moods.emoji}</span>}
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {entry.moods.name}
            </p>
          </div>
        )}

        {/* Display Tag if exists */}
        {entry.tag && (
          <div className="mb-4">
            <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
              #{entry.tag}
            </span>
          </div>
        )}

        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{entry.content}</p>

        {/* Edit Button */}
        <button
          onClick={() => {
            setEditingEntryId(entry.id);
            navigate("/entry");
          }}
          className="cursor-pointer mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Edit Diary
        </button>
      </div>
    </div>
  );
}
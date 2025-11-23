import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDiary } from "../context/DiaryContext";
import { useTheme } from "../context/ThemeContext";
import supabase from "../lib/supabase";

export default function DiaryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { editingEntryId, setEditingEntryId } = useDiary(); // check unlocked entry
  const { isDarkMode } = useTheme();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntry() {
      setLoading(true);

      // Fetch entry from Supabase
      const { data, error } = await supabase
        .from("diaryentry")
        .select("id, title, content, mood_id, entry_pass, moods(name)")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/main"); // Entry not found → go back
        return;
      }

      setEntry(data);

      // If entry is locked and NOT unlocked, redirect to unlock page
      if (data.entry_pass && editingEntryId !== id) {
        navigate(`/unlock/${id}`);
      } else {
        // Mark as currently editing/unlocked
        setEditingEntryId(id);
      }

      setLoading(false);
    }

    fetchEntry();
  }, [id, navigate, editingEntryId, setEditingEntryId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!entry) return null;

  return (
    <div
      className={`p-6 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/main")}
        className={`text-2xl mb-4 hover:opacity-70 transition-opacity ${
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

      {/* 📖 Diary Content */}
      <div
        className={`mt-4 p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold">{entry.title}</h2>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{entry.moods.name}</p>

        {/* Edit Button */}
        <button
          onClick={() => {
            setEditingEntryId(entry.id);
            navigate("/entry");
          }}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Edit Diary
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDiary } from "../context/DiaryContext";
import { useTheme } from "../context/ThemeContext";

export default function EntryPage() {
  const navigate = useNavigate();
  const { addEntry, updateEntry, diaryEntries, editingEntryId, unlockEntry } =
    useDiary();
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [tag, setTag] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [confirmLockPin, setConfirmLockPin] = useState("");
  const [lockError, setLockError] = useState("");
  const [isEntryLocked, setIsEntryLocked] = useState(false);
  const [existingPin, setExistingPin] = useState(null);

  useEffect(() => {
    if (editingEntryId) {
      const entry = diaryEntries.find((e) => e.id === editingEntryId);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setEmotion(entry.emotion);
        setTag(entry.tag || "");
        setIsEntryLocked(entry.isLocked || false);
        setExistingPin(entry.pin || null);
      }
    } else {
      setExistingPin(null);
      setIsEntryLocked(false);
    }
  }, [editingEntryId, diaryEntries]);

  const handleLockToggle = () => {
    if (isEntryLocked) {
      if (editingEntryId) {
        unlockEntry(editingEntryId);
      }
      setIsEntryLocked(false);
      setLockPin("");
      setConfirmLockPin("");
      setLockError("");
    } else {
      setIsEntryLocked(true);
    }
  };

  const emotions = [
    { name: "Happy", emoji: "😊" },
    { name: "Sad", emoji: "😢" },
    { name: "Excited", emoji: "🎉" },
    { name: "Anxious", emoji: "😰" },
    { name: "Calm", emoji: "😌" },
    { name: "Angry", emoji: "😠" },
    { name: "Grateful", emoji: "🙏" },
    { name: "Tired", emoji: "😴" },
    { name: "Hopeful", emoji: "🌟" },
    { name: "Lonely", emoji: "😔" },
    { name: "Content", emoji: "😊" },
    { name: "Stressed", emoji: "😫" },
    { name: "Peaceful", emoji: "☮️" },
    { name: "Frustrated", emoji: "😤" },
    { name: "Loved", emoji: "❤️" },
  ];

  const tags = [
    "work",
    "family",
    "travel",
    "health",
    "goals",
    "relationships",
    "hobbies",
    "reflection",
  ];

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !emotion.trim()) {
      return;
    }

    const entryData = { title, content, emotion, tag };

    if (editingEntryId && !isEntryLocked && existingPin) {
      entryData.isLocked = false;
      entryData.pin = null;
      updateEntry(editingEntryId, entryData);
    } else if (editingEntryId && isEntryLocked && existingPin) {
      entryData.isLocked = true;
      entryData.pin = existingPin;
      updateEntry(editingEntryId, entryData);
    } else if (isEntryLocked) {
      setShowLockModal(true);
      return;
    } else {
      if (editingEntryId) {
        updateEntry(editingEntryId, entryData);
      } else {
        addEntry(entryData);
      }
    }

    setTitle("");
    setContent("");
    setEmotion("");
    setTag("");
    setExistingPin(null);
    navigate("/main");
  };

  const handleLockEntry = () => {
    if (!lockPin.trim() || !confirmLockPin.trim()) {
      setLockError("Please enter a PIN");
      return;
    }
    if (lockPin !== confirmLockPin) {
      setLockError("PINs do not match");
      return;
    }
    if (lockPin.length < 4) {
      setLockError("PIN must be at least 4 digits");
      return;
    }

    const entryData = {
      title,
      content,
      emotion,
      tag,
      isLocked: true,
      pin: lockPin,
    };

    if (editingEntryId) {
      updateEntry(editingEntryId, entryData);
    } else {
      addEntry(entryData);
    }

    setTitle("");
    setContent("");
    setEmotion("");
    setTag("");
    setShowLockModal(false);
    setLockPin("");
    setConfirmLockPin("");
    setLockError("");
    navigate("/main");
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Back Button and Lock Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/main")}
          className={`cursor-pointer text-2xl hover:opacity-70 transition-opacity ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          ←
        </button>
        <button
          onClick={handleLockToggle}
          className={`cursor-pointer text-2xl hover:opacity-70 transition-opacity ${
            isEntryLocked ? "opacity-100" : "opacity-60"
          }`}
          title={isEntryLocked ? "Entry will be locked" : "Entry is not locked"}
        >
          {isEntryLocked ? "🔒" : "🔓"}
        </button>
      </div>

      {/* Page Title */}
      <h1 className={`text-3xl font-bold mb-6 text-center ${
        isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
        >
        {editingEntryId ? "Edit Entry" : "New Entry"}
      </h1>

      {/* Title Input */}
      <div className="mb-4">
        <input
          id="entry-title"
          name="entryTitle"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-pink-300 text-gray-900 placeholder-gray-900 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      {/* Content Textarea */}
      <div className="mb-4">
        <textarea
          id="entry-content"
          name="entryContent"
          placeholder="Dear Diary,"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full bg-pink-300 text-gray-900 placeholder-gray-900 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
        />
      </div>

      {/* Emotion and Tag Dropdowns */}
      <div className="mb-6 flex justify-center gap-4">
        {/* Emotion Dropdown */}
        <select
          id="entry-emotion"
          name="entryEmotion"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none cursor-pointer text-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
          }}
        >
          <option value="">Select emotion</option>
          {emotions.map((emo) => (
            <option key={emo.name} value={emo.name}>
              {emo.emoji} {emo.name}
            </option>
          ))}
        </select>

        {/* Tag Dropdown */}
        <select
          id="entry-tag"
          name="entryTag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none cursor-pointer text-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
          }}
        >
          <option value="">Select tag</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!(title.trim() && content.trim() && emotion)}
        className={`w-full font-medium py-4 rounded-full transition-colors ${
          title.trim() && content.trim() && emotion
            ? "bg-yellow-300 hover:bg-yellow-400 text-gray-900 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Save Entry
      </button>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div
            className={`rounded-3xl p-6 w-full max-w-sm ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Set Entry PIN
            </h2>
            <p
              className={`mb-4 text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Set a PIN to lock this entry
            </p>
            <div className="space-y-4 mb-6">
              <input
                id="lock-pin"
                name="lockPin"
                type="password"
                placeholder="Enter PIN (4+ digits)"
                value={lockPin}
                onChange={(e) => setLockPin(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-gray-200 text-gray-900 placeholder-gray-700"
                }`}
                maxLength={6}
              />
              <input
                id="confirm-lock-pin"
                name="confirmLockPin"
                type="password"
                placeholder="Confirm PIN"
                value={confirmLockPin}
                onChange={(e) => setConfirmLockPin(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-gray-200 text-gray-900 placeholder-gray-700"
                }`}
                maxLength={6}
              />
            </div>
            {lockError && (
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {lockError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setIsEntryLocked(false);
                  setLockError("");
                  setLockPin("");
                  setConfirmLockPin("");
                }}
                className={`flex-1 font-medium py-3 rounded-full transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleLockEntry}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-full transition-colors"
              >
                Lock Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDiary } from '../context/DiaryContext';
import { useTheme } from '../context/ThemeContext';
import supabase from "../lib/supabase";

export default function MainInterfacePage() {
  const navigate = useNavigate();
  const { diaryEntries, setEditingEntryId, setLockedEntryId, deleteEntry } = useDiary();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const menuRef = useRef(null);

  // -----------------------------
  // FETCH USER NAME
  // -----------------------------
  useEffect(() => {
    fetchUserName();
  }, []);

  async function fetchUserName() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user")
      .select("name")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user name:", error);
      return;
    }

    if (data) setUserName(data.name);
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncateContent = (text, maxLength = 100) => {
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanText.length > maxLength) {
      return cleanText.substring(0, maxLength) + '...';
    }
    return cleanText;
  };

  const handleEntryClick = (entryId) => {
    setEditingEntryId(entryId);
    navigate('/entry');
  };

  const handleAddNew = () => {
    setEditingEntryId(null);
    navigate('/entry');
  };

  const handleLockedEntryClick = (entry) => {
    setLockedEntryId(entry.id);
    navigate('/unlock');
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
  <h1
    className={`text-3xl font-bold ${
      isDarkMode ? "text-white" : "text-gray-900"
    }`}
  >
    My Diary
  </h1>

  {userName && (
    <h2
      className={`text-xl font-medium ${
        isDarkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Hello, {userName}
    </h2>
  )}
</div>


        <div className="flex items-center space-x-4">
          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              title="Menu"
            >
              <svg className={`cursor-pointer w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => { handleAddNew(); setMenuOpen(false); }}
                      className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                    >
                      New Entry
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
                      className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                    >
                      About
                    </button>
                  </li>
                  <li className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => { setEditingEntryId(null); setLockedEntryId(null); setMenuOpen(false); navigate('/login'); }}
                      className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600 font-medium ${isDarkMode ? 'hover:bg-red-900' : ''}`}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center sm:space-x-2">
            <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1 sm:mb-0`}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
            <button
              onClick={toggleDarkMode}
              role="switch"
              aria-checked={isDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              className={`cursor-pointer w-12 h-6 rounded-full p-1 flex items-center transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform`} />
            </button>
          </div>
        </div>
      </div>

      {/* Diary Entries */}
      <div className="space-y-4 mb-20">
        {diaryEntries.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-center text-gray-600 text-lg">
              No Entry yet, create an entry to display here.
            </p>
          </div>
        ) : (
          diaryEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => entry.isLocked ? handleLockedEntryClick(entry) : handleEntryClick(entry.id)}
              className="bg-purple-300 rounded-3xl p-6 shadow-sm cursor-pointer hover:bg-purple-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  {entry.isLocked ? (
                    <div className="flex flex-col items-center justify-center py-16 ml-8">
                      <span className="text-5xl">🔒</span>
                      <p className="text-gray-900 font-medium text-sm mt-4">Entry is locked</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-semibold text-gray-900 text-wrap mb-2">{entry.date}</h2>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{entry.title}</h3>
                      <p className="text-sm text-gray-700 mb-3">{entry.emotion}</p>
                      <p className="text-gray-900 text-wrap overflow-hidden">{truncateContent(entry.content)}</p>
                    </>
                  )}
                </div>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(entry.id);
                    }}
                    className={`p-2 rounded-md hover:bg-red-100 focus:outline-none ${isDarkMode ? 'hover:bg-red-700' : ''}`}
                    title="Delete entry"
                    aria-label="Delete entry"
                  >
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={handleAddNew}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <span className="cursor-pointer text-3xl mb-2 leading-none">+</span>
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg w-full max-w-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Delete Entry?</h2>
              <p className="mb-6 text-sm">
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteEntry(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">About Dear Diary</h2>
              <p className="text-sm mb-4">Dear Diary is a simple and secure diary app to store your thoughts and memories. Your entries are stored locally in application state for this demo.</p>
              <p className="text-sm mb-6">Version 1.0</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setAboutOpen(false)}
                  className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDiary } from '../context/DiaryContext';
import { useTheme } from '../context/ThemeContext';
import supabase from '../lib/supabase';

export default function UnlockPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lockedEntryId } = useDiary();
  const { isDarkMode } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const entryId = lockedEntryId || id;

  useEffect(() => {
    if (!entryId) {
      navigate('/main');
    }
  }, [entryId, navigate]);

  const handleUnlock = async () => {
    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    if (!entryId) {
      setError('No entry to unlock');
      return;
    }

    setLoading(true);

    try {
      const { data: entry, error } = await supabase
        .from('diaryentry')
        .select('id, entry_pass')
        .eq('id', entryId)
        .single();

      if (error || !entry) {
        setError('Entry not found');
        setLoading(false);
        return;
      }

      const enteredPin = String(pin).trim();
      const storedPin = String(entry.entry_pass);

      if (storedPin === enteredPin) {
        // Store unlocked entry ID in sessionStorage
        const unlockedEntries = JSON.parse(sessionStorage.getItem('unlockedEntries') || '[]');
        if (!unlockedEntries.includes(entryId)) {
          unlockedEntries.push(entryId);
          sessionStorage.setItem('unlockedEntries', JSON.stringify(unlockedEntries));
        }
        

         console.log('Unlocked entries:', unlockedEntries);

        // Navigate to the diary entry view
        navigate(`/diary/${entryId}`);
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUnlock();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <button
        onClick={() => navigate('/main')}
        className={`cursor-pointer absolute top-6 left-6 text-2xl hover:opacity-70 transition-opacity ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        ←
      </button>

      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <svg className={`w-20 h-20 ${isDarkMode ? 'text-white' : 'text-current'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
        </div>

        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>This diary</h1>
        <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>is private.</h2>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            className={`w-full text-center px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 ${
              isDarkMode
                ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500'
                : 'bg-gray-200 text-gray-900 placeholder-gray-700 focus:ring-gray-300'
            } font-medium`}
            maxLength={6}
            disabled={loading}
          />
          {error && <p className={`text-sm mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
        </div>

        <button
          onClick={handleUnlock}
          disabled={loading}
          className={`cursor-pointer w-full font-medium py-4 rounded-full transition-colors ${
            isDarkMode
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {loading ? 'Unlocking...' : 'Unlock Entry'}
        </button>
      </div>
    </div>
  );
}
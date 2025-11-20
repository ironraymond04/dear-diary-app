import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDiary } from '../context/DiaryContext';
import { useTheme } from '../context/ThemeContext';

export default function DiaryPage() {
  const navigate = useNavigate();
  const { addEntry } = useDiary();
  const { isDarkMode } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');

  const emotions = [
    'Happy',
    'Sad',
    'Excited',
    'Anxious',
    'Calm',
    'Angry',
    'Grateful',
    'Tired',
    'Hopeful',
    'Lonely',
    'Content',
    'Stressed',
    'Peaceful',
    'Frustrated',
    'Loved'
  ];

  const handleSave = () => {
    if (title.trim() && content.trim() && emotion.trim()) {
      addEntry({
        title,
        content,
        emotion
      });
      // Reset form
      setTitle('');
      setContent('');
      setEmotion('');
      // Navigate back to main page
      navigate('/main');
    }
  };

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/main')}
        className={`w-full text-left mb-6 text-2xl hover:opacity-70 transition-opacity ${isDarkMode ? 'text-white' : 'text-black'}`}
      >
        ←
      </button>

      {/* Title Input */}
      <div className="w-full max-w-md mb-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-pink-200 text-gray-900 placeholder-gray-900 text-center px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium"
        />
      </div>

      {/* Content Textarea */}
      <div className="w-full max-w-md mb-4">
        <textarea
          placeholder="Dear Diary,"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full bg-pink-200 text-gray-900 placeholder-gray-900 px-6 py-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
        />
      </div>

      {/* Emotion Dropdown */}
      <div className="mb-4">
        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          className="bg-purple-200 text-gray-900 px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none cursor-pointer font-medium"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Select emotion</option>
          {emotions.map((emo) => (
            <option key={emo} value={emo}>
              {emo}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!title.trim() || !content.trim() || !emotion.trim()}
        className={`w-full max-w-md font-medium py-4 rounded-full transition-colors ${
          title.trim() && content.trim() && emotion.trim()
            ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Save
      </button>
    </div>
  );
}
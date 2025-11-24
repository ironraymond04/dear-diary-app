export default function DefaultPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <img 
            src="/bg.jpg"
            alt="Dear Diary Logo" 
            className="w-50 h-50"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Dear Diary
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-12">
          Write your thoughts,<br />
          protect your peace
        </p>

        {/* Buttons */}
        <div className="space-y-4">
            <a href="/login" className="block">
              <button className="cursor-pointer w-full bg-indigo-500 hover:bg-indigo-600 text-gray-900 font-medium py-4 rounded-2xl transition-colors">
                Log in
              </button>
            </a>
          
            <a href="/signup" className="block">
              <button className="cursor-pointer w-full bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-medium py-4 rounded-2xl transition-colors">
                Sign up
              </button>
            </a>
        </div>
      </div>
    </div>
  );
}
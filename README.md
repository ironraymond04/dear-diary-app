# 📔 Dear Diary App

A personal journaling app to capture your thoughts and memories.

## 🌐 Live Demo

**Live Link:** [https://dear-diary-app.netlify.app/](https://dear-diary-app.netlify.app/)

*(Update this link after deployment)*

## ✨ Features

- 📝 Create and manage daily journal entries
- 💾 Offline support with PWA capabilities
- 📱 Installable on desktop and mobile devices
- 🎨 Clean and intuitive user interface
- 🔒 Local storage for privacy

## 🚀 PWA Features

- ✅ Installable on devices
- ✅ Offline functionality with Service Worker
- ✅ Fast loading with caching strategies
- ✅ Responsive design for all screen sizes
- ✅ Lighthouse PWA score: 80+

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Styling:** CSS3
- **PWA:** Service Worker, Web App Manifest
- **Deployment:** Netlify

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dear-diary-app.git
cd dear-diary-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🌍 Deployment Instructions

### Deploy to Netlify

1. Push your code to GitHub
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"
7. Update the live link in this README

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify via drag-and-drop

## 📱 Installing as PWA

### Desktop (Chrome/Edge)
1. Visit the live site
2. Click the install icon (⊕) in the address bar
3. Click "Install"

### Mobile (Android)
1. Visit the live site
2. Tap the menu (⋮)
3. Select "Add to Home screen"

### Mobile (iOS)
1. Visit the live site in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## 🧪 Testing PWA

Run Lighthouse audit in Chrome DevTools:
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Target score: 80+

## 📁 Project Structure

```
dear-diary-app/
├── public/
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── service-worker.js
├── netlify.toml
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Configuration Files

- **manifest.json** - PWA manifest configuration
- **service-worker.js** - Offline caching strategy
- **netlify.toml** - Netlify deployment configuration

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Your Name

---

⭐ Star this repo if you find it helpful!
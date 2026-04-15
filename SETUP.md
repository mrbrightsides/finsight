# 🛠 Local Setup Guide

Follow these steps to initialize the FinSight AI terminal on your local machine.

## Prerequisites
- **Node.js**: v18.0.0 or higher.
- **Browser**: Modern browser with ESM support (Chrome, Edge, Safari, Firefox).
- **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/).

## 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/mrbrightsides/finsight.git
cd finsight
npm install
```

## 2. Configuration
The application requires an API Key for the Gemini Engine. Create a `.env` file in the root directory:
```env
API_KEY=your_actual_api_key_here
```

## 3. Development
Start the Vite development server:
```bash
npm run dev
```
The app will typically be available at `http://localhost:5173`.

## 4. Building for Production
To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` folder, ready for deployment to platforms like Vercel or Netlify.

## ⚠️ Troubleshooting
- **429 Errors**: If you encounter rate limit errors, wait 60 seconds. The app includes exponential backoff logic, but high-frequency testing can hit free-tier limits.
- **Storage Issues**: If your profile state becomes corrupted during development, use the **Factory Reset** button in the Account Manager.

---
*Engineered for Hackonomics 2026.*

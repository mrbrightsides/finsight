# 🏛 FinSight AI: Technical Architecture

This document outlines the high-level architecture of FinSight AI, built for the **Hackonomics 2026** challenge.

## 1. Design Philosophy
FinSight AI follows a **Neural-Hybrid** pattern. It combines traditional deterministic financial calculations (standard math for yields, compound interest, and taxes) with non-deterministic AI reasoning (Gemini API) to provide context-aware insights.

## 2. Core Components

### 🧠 Intelligence Tier (`services/geminiService.ts`)
The central nervous system of the app. It orchestrates all calls to the Google Gemini API.
- **Grounding**: Uses `googleSearch` to verify market trends and stock news.
- **Reasoning**: Leverages `gemini-3-pro-preview` for complex strategic reports.
- **Real-time**: Uses `gemini-3-flash-preview` for chat and low-latency simulations.
- **Audio**: Implements `gemini-2.5-flash-preview-tts` for vocalizing advice.

### 💾 Persistence Tier (`services/storageService.ts`)
A lightweight, browser-native storage engine.
- Uses `localStorage` to persist `AppState`.
- Handles recurring transactions and profile management locally to minimize server overhead and maximize privacy.

### 🎨 Presentation Tier (React 19 + Tailwind CSS)
A high-fidelity, responsive UI designed for executive-level clarity.
- **Dashboard**: Aggregates local metrics and AI resilience audits.
- **Wealth Simulator**: Uses `Recharts` for high-performance vector rendering of wealth paths.
- **Concept Lab**: Uses persona-based framing to simplify economic jargon.

## 3. Data Flow
1. **User Input**: Captured via React controlled components.
2. **Local Sync**: Immediately saved to `localStorage` via the `storageService`.
3. **AI Request**: Contextual data (assets, goals, income) is bundled into a prompt and sent to Gemini.
4. **Augmentation**: Gemini performs grounding (if required) and returns structured JSON (enforced by `responseSchema`).
5. **UI Update**: The React state is updated, triggering beautiful, animated transitions for the user.

## 4. Security & Privacy
- **Zero-Backend**: All personal data stays in the user's browser `localStorage`.
- **API Security**: The `process.env.API_KEY` is handled securely at the infrastructure level.
- **Privacy**: No financial data is sent to external servers except for the transient AI prompt processing.

---
*Built for the Hackonomics 2026 Challenge.*

# 🔌 Third-Party API Integration

FinSight AI utilizes industry-leading AI models to provide high-fidelity financial intelligence.

## 1. Google Gemini API
The primary engine for FinSight AI is the Google Gemini API. We utilize several specific models for specialized tasks:

### Models in Use
- **`gemini-3-pro-preview`**: Used in the **AI Advisor** and **Portfolio Hub** for high-reasoning tasks and multi-step financial planning.
- **`gemini-3-flash-preview`**: Powering the **Concept Lab**, **Market Pulse**, and **Time Machine** for low-latency text generation.
- **`gemini-2.5-flash-preview-tts`**: Converting model output to spoken audio in the **AI Advisor** view.
- **`gemini-2.5-flash-image`**: (Optional) For visual interpretation of financial documents (future feature).

## 2. Grounding & Search
The **Market Pulse** and **Stock News** features utilize the `googleSearch` tool.
- **Mechanism**: The model performs a live search query before generating a response.
- **Verification**: We extract `groundingChunks` from the API response to provide users with direct links to source material (Verified Intelligence).

## 3. Safety & Filtering
We implement strict system instructions to ensure:
- **No Direct Financial Advice**: The AI identifies as an educational tool, not a certified financial advisor.
- **Content Safety**: All responses are filtered for harmful or malicious financial misinformation.

## 4. Rate Limits & Reliability
To ensure the app remains functional under heavy use, we have implemented:
- **Exponential Backoff**: Automatic retry logic for `429 Resource Exhausted` errors.
- **Structured Outputs**: Use of `responseSchema` to ensure AI returns valid JSON for programmatic UI updates.

---
*Transparency Document for Hackonomics 2026.*

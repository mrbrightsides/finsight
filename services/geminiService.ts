
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, Asset } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Utility to call Gemini API with exponential backoff for 429 errors
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Robust detection of 429 Rate Limit or Quota errors
      const errorMsg = error?.message?.toLowerCase() || "";
      const isRateLimit = 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('rate limit') || 
        errorMsg.includes('resource_exhausted') ||
        error?.status === 429;
      
      if (isRateLimit && i < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, 8s + random jitter
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1500;
        console.warn(`FinSight AI: Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const getMarketVitals = async () => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide a one-sentence high-level summary of the single most important global economic headline from today. No preamble.",
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text?.trim() || "Market connection stable. Grounding active.";
  });
};

export const getBondConceptExplanation = async (concept: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the bond-related concept of "${concept}" for a high school student interested in finance. Use a simple everyday analogy. Keep it under 100 words.`,
    });
    return response.text;
  });
};

export const analyzeBondStrategy = async (profile: UserProfile, bondData: any) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `Act as a Fixed Income Strategist for Hackonomics 2026.
    User Profile: Net Worth $${profile.totalBalance}, Current Bonds: ${profile.assets.filter(a => a.type === 'bond').length} positions.
    Active Simulation: ${JSON.stringify(bondData)}

    Provide:
    1. A simplified "Bond Teeter-Totter" analogy explaining the relationship between current market rates and this bond's price.
    2. A "Risk Rating" (AAA to D) for the simulated scenario.
    3. 3 "Bond Literacy Tips" regarding duration, credit spread, and default risk.
    4. A strategy recommendation (Hold, Sell, or Ladder).

    Return as a JSON object with specified fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analogy: { type: Type.STRING },
            riskRating: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
            durationImpact: { type: Type.STRING }
          },
          required: ["analogy", "riskRating", "tips", "recommendation", "durationImpact"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const simplifyConcept = async (concept: string, context: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the economic concept of "${concept}" using a simple analogy related to "${context}". Focus on financial literacy. Make it conversational and engaging for a beginner.`,
    });
    return response.text;
  });
};

export const runTimeMachine = async (profile: UserProfile, era: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const assetSummary = profile.assets.map(a => `${a.type}: $${a.balance}`).join(', ');
    const prompt = `Perform an "Economic Time Machine" simulation. 
    Era: ${era}
    User Assets: ${assetSummary}
    Monthly Income: $${profile.monthlyIncome}
    
    Explain:
    1. How these specific assets would have performed or been impacted during this era.
    2. A "Survival Score" (0-100).
    3. One historical lesson from this era that applies to the user today.
    
    Keep the tone immersive and historically accurate. Use Markdown.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  });
};

export const getStockNews = async (ticker: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Fetch the latest 3 critical news headlines and a brief sentiment analysis for stock ticker: "${ticker}". Focus on events from the last 7 days. Summarize each headline in one short sentence.`,
      config: { 
        tools: [{ googleSearch: {} }] 
      }
    });
    
    const text = response.text || "No news found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { 
      text, 
      sources: sources.filter(c => c.web).map(c => ({ title: c.web.title, uri: c.web.uri })) 
    };
  });
};

export const generateDailyQuiz = async (topic: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 3-question multiple choice quiz on the topic of "${topic}". Focus on practical financial literacy.
      Return a JSON object with a "questions" array. Each question should have "text", "options" (array of 4 strings), and "correctIndex" (0-3).`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.NUMBER }
                },
                required: ["text", "options", "correctIndex"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });
    return JSON.parse(response.text || '{"questions": []}');
  });
};

export const analyzeTaxImpact = async (profile: UserProfile) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const incomeSummary = profile.incomeStreams.map(i => `${i.name}: $${i.amount}/${i.frequency}`).join(', ');
    const assetSummary = profile.assets.map(a => 
      `${a.name} (Type: ${a.type}, Current Val: $${a.balance}, Cost Basis/Purchase Price: $${a.purchasePrice || 'Unknown'}, Qty: ${a.quantity || 1})`
    ).join(', ');

    const prompt = `Act as an educational Tax Architect for the Hackonomics 2026 challenge. 
    Analyze the following profile for tax efficiency.
    
    Annual Income Approx: $${profile.monthlyIncome * 12}
    Income Streams: ${incomeSummary}
    Assets: ${assetSummary}

    Provide:
    1. A "Tax Efficiency Score" (0-100).
    2. A "bucketAllocation" object categorizing total dollars into: Taxable, TaxDeferred, TaxExempt.
    3. 3-4 "Potential Deductions" or credits based on the profile.
    4. A dedicated "harvestingStrategy" field. If any stock assets are currently valued below their cost basis, identify them.
    5. "LocationOptimization": Check if high-yield assets (like Bonds) are in taxable vs deferred accounts and suggest improvements.

    Return as a JSON object with specified fields.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            bucketAllocation: {
              type: Type.OBJECT,
              properties: {
                taxable: { type: Type.NUMBER },
                deferred: { type: Type.NUMBER },
                exempt: { type: Type.NUMBER }
              },
              required: ["taxable", "deferred", "exempt"]
            },
            deductions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["name", "reason"]
              }
            },
            harvestingStrategy: { type: Type.STRING },
            locationOptimization: { type: Type.STRING },
            conceptExplanation: { type: Type.STRING },
            conceptName: { type: Type.STRING }
          },
          required: ["score", "verdict", "tips", "bucketAllocation", "deductions", "harvestingStrategy", "locationOptimization", "conceptExplanation", "conceptName"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const analyzeDeFiStrategy = async (profile: UserProfile) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const cryptoAssets = profile.assets.filter(a => a.type === 'crypto');
    const assetStr = cryptoAssets.map(a => `${a.name}: $${a.balance}`).join(', ');

    const prompt = `Act as a DeFi (Decentralized Finance) Protocol Specialist for Hackonomics 2026.
    Analyze the following user profile for DeFi potential:
    Net Worth: $${profile.totalBalance}
    Current Crypto Assets: ${assetStr || "None"}

    Provide strategies, risk analysis, and analogies. Return as JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  apyRange: { type: Type.STRING },
                  complexity: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["name", "apyRange", "complexity", "desc"]
              }
            },
            conceptName: { type: Type.STRING },
            conceptExplanation: { type: Type.STRING },
            safetyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskVerdict: { type: Type.STRING }
          },
          required: ["strategies", "conceptName", "conceptExplanation", "safetyTips", "riskVerdict"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const analyzeCashFlow = async (profile: UserProfile) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a financial analyst, perform a deep dive on this user's cash flow. 
      Income: $${profile.monthlyIncome}, Expenses: $${profile.monthlyExpenses}, Savings: $${profile.monthlySavings}.
      Goals: ${JSON.stringify(profile.goals)}.
      Return a JSON object with habits, opportunities, budgetTips, and adjustments.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const calculateFinancialHealth = async (profile: UserProfile) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const savingsAsset = profile.assets.filter(a => a.type === 'savings').reduce((sum, a) => sum + a.balance, 0);
    const debtAsset = Math.abs(profile.assets.filter(a => a.type === 'debt').reduce((sum, a) => sum + a.balance, 0));
    const emergencyFundMonths = profile.monthlyExpenses > 0 ? (savingsAsset / profile.monthlyExpenses) : 0;
    const dti = profile.monthlyIncome > 0 ? (debtAsset / (profile.monthlyIncome * 12)) : 0;
    
    const data = JSON.stringify({
      netWorth: profile.totalBalance,
      income: profile.monthlyIncome,
      expenses: profile.monthlyExpenses,
      savings: savingsAsset,
      debt: debtAsset,
      emergencyFundMonths: emergencyFundMonths.toFixed(1),
      dti: (dti * 100).toFixed(1) + '%',
      assets: profile.assets.map(a => ({ type: a.type, bal: a.balance }))
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a robust "Financial Resilience Audit" for this user. Return JSON with score, verdict, metrics, and insights.
      User data: ${data}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                emergencyFund: { type: Type.NUMBER },
                debtRatio: { type: Type.NUMBER },
                diversification: { type: Type.NUMBER }
              },
              required: ["emergencyFund", "debtRatio", "diversification"]
            },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "verdict", "metrics", "insights"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const analyzeDebtStrategy = async (asset: Asset, monthlyIncome: number) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze debt: ${asset.name}, Balance: ${asset.balance}, Rate: ${asset.interestRate}. Income: ${monthlyIncome}. Provide a 3-sentence Tactical Paydown Plan.`,
    });
    return response.text;
  });
};

export const analyzeWealthPath = async (details: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze wealth projection: ${details}. Pros/cons/strategy. Under 150 words.`,
    });
    return response.text;
  });
};

export const getFinancialAdvice = async (profile: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Provide 3 actionable financial improvement steps for: ${profile}`,
    });
    return response.text;
  });
};

export const getRebalanceSuggestions = async (profile: UserProfile) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const assetString = profile.assets.map(a => `${a.name} ($${a.balance}, Type: ${a.type})`).join(', ');
    const goalsString = profile.goals.map(g => `${g.name} (Target: $${g.target}, Current: $${g.current})`).join(', ');
    
    const prompt = `Act as a Senior Wealth Management Architect for Hackonomics 2026.
    Analyze the user's asset allocation and financial goals to provide a rebalancing strategy.
    Assets: ${assetString}
    Goals: ${goalsString}
    
    Critical Strategic Instructions:
    1. Evaluate Goal Proximity: Calculate the percentage completion for each goal.
    2. Locked-In Strategy: If any goal is >80% complete, strongly recommend moving funds from volatile assets (Crypto, Stocks) to capital-preservation assets (Savings, Bonds, Commodities) to ensure the goal is successfully met without market-driven erosion.
    3. Growth Strategy: If goals are far off (<50%), suggest growth-heavy rebalancing.
    
    Return a JSON object:
    {
      "rationale": "High-level strategy summary explicitly referencing goal proximity.",
      "suggestions": [
        { "from": "Asset Name", "to": "Asset Name", "amount": number, "reason": "Explanation citing goal risk or opportunity." }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rationale: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING },
                  to: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["from", "to", "amount", "reason"]
              }
            }
          },
          required: ["rationale", "suggestions"]
        }
      }
    });
    return JSON.parse(response.text || '{"rationale": "Strategic analysis pending.", "suggestions": []}');
  });
};

export const getMarketPulse = async (query: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Economic Intelligence Briefing: "${query}".`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources: sources.filter(c => c.web).map(c => ({ title: c.web.title, uri: c.web.uri })) };
  });
};

export const createAdvisorChat = (profile: UserProfile) => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: `You are 'Finny', lead AI Advisor for Hackonomics 2026. Help with financial literacy. User: ${profile.name}, NW: ${profile.totalBalance}.` },
  });
};

export const speakText = async (text: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak: ${text}` }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export const generateScenario = async (concept: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an interactive "What-If" scenario for the financial concept "${concept}".`,
    });
    return response.text;
  });
};

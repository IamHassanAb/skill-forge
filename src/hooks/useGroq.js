import { useState } from 'react';
import Groq from 'groq-sdk';

export default function useGroq(apiKey, systemPrompt) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // We maintain the identical signature so our React Components don't need changes
  const sendMessage = async (userText, imageBase64 = null, mimeType = null, keyOverride = null, skipHistory = false) => {
    if (!userText?.trim() && !imageBase64) return null;
    
    const effectiveKey = keyOverride || apiKey;
    if (!effectiveKey) {
      console.error("Groq API key is required.");
      return null;
    }

    setIsLoading(true);

    const userContent = imageBase64
      ? [
          { 
            type: "image_url", 
            image_url: { url: `data:${mimeType || 'image/png'};base64,${imageBase64}` } 
          },
          { 
            type: "text", 
            text: userText || "Please review this photo and give me specific improvement tips based on my current training stage and goal." 
          }
        ]
      : userText;

    const newUserTurn = { role: "user", content: userContent };
    
    // Only update history if not skipping
    const updatedHistory = skipHistory 
      ? [...conversationHistory, newUserTurn] 
      : [...conversationHistory, newUserTurn];
    
    // Actually, even if skipHistory is true, we need to SEND the current turn.
    // However, we shouldn't save it to the permanent state.
    if (!skipHistory) {
      setConversationHistory(prev => [...prev, newUserTurn]);
    }

    try {
      const groq = new Groq({ apiKey: effectiveKey, dangerouslyAllowBrowser: true });

      const messages = [
        { 
          role: "system", 
          content: skipHistory 
            ? "You are a data API. Respond precisely and ONLY with the requested JSON format." 
            : systemPrompt 
        },
        ...conversationHistory.map((msg, i) => {
          const content = msg.content || msg.text || "";
          return { 
            role: msg.role === 'model' ? 'assistant' : 'user', 
            content: content
          };
        }),
        { role: "user", content: userContent }
      ];

      console.log("PROCESSED MESSAGES FOR GROQ:", messages);

      const completion = await groq.chat.completions.create({
        messages,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
      });

      const modelText = completion.choices[0]?.message?.content || "";
      console.log("GROQ RESPONSE:", modelText);
      
      if (!skipHistory) {
        const newModelTurn = { role: "model", content: modelText };
        setConversationHistory(prev => [...prev, newModelTurn]);
      }

      setIsLoading(false);
      return modelText;

    } catch (error) {
      console.error("Groq SDK API Error:", error);
      setIsLoading(false);
      return null;
    }
  };

  const resetConversation = () => {
    setConversationHistory([]);
  };

  // We export sendMessage, isLoading, and resetConversation identically
  return { sendMessage, isLoading, resetConversation, conversationHistory };
}

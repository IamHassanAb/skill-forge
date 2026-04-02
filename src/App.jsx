import { useState } from 'react';
import { useSessionManager } from './core/sessionManager';
import { getTrainerPrompt } from './core/trainerController';
import { getConfidence } from './core/confidence';
import useGroq from './hooks/useGroq';
import APIKeyScreen from './components/APIKeyScreen';
import TrainerLayout from './components/TrainerLayout';

function App() {
  const [screen, setScreen] = useState("apikey");
  const [apiKey, setApiKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [stages, setStages] = useState([]);
  const [activeStage, setActiveStage] = useState(1);
  const [authError, setAuthError] = useState("");

  const { 
    sessionsCompleted, 
    currentSessionActive, 
    userGoal, 
    startSession, 
    completeSession, 
    adjustGoal 
  } = useSessionManager();

  const confidenceLevel = getConfidence(sessionsCompleted);
  const systemPrompt = getTrainerPrompt(currentSessionActive, userGoal, sessionsCompleted);

  const { sendMessage, isLoading, resetConversation } = useGroq(systemPrompt);

  const generateStudyPlan = async (key) => {
    // Explicitly seed the history behind the scenes 
    // We pass the 'key' directly because setApiKey is async
    const planPrompt = "Generate a 5-stage photography study plan for a complete beginner. Respond ONLY in raw JSON, no markdown, no backticks: { \"stages\": [ { \"id\": 1, \"title\": \"...\", \"description\": \"...\" } ] }";
    
    // Pass true as the 4th argument (skipHistory)
    const response = await sendMessage(planPrompt, null, null, true);
    
    if (response) {
      console.log("RAW STAGES RESPONSE:", response);
      try {
        const cleaned = response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
          
        const parsed = JSON.parse(cleaned);
        if (parsed?.stages) {
          setStages(parsed.stages);
        }
      } catch (err) {
        console.error("Failed to parse JSON plan:", err);
      }
    } else {
      throw new Error("Invalid API Key or connection failed.");
    }
  };

  const handleKeySubmit = async (key) => {
    setAuthError("");
    setApiKey(key);
    
    try {
      await generateStudyPlan(key);
      
      // Navigate to trainer only upon a successful API response
      setScreen("trainer");
      setMessages([{ 
        role: "model", 
        text: "Welcome to SkillForge 📸 I'm your personal photography trainer. I've built your 5-stage study plan — check the sidebar. First question: do you have a camera right now (phone counts), or are we starting with theory?" 
      }]);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSend = async (userText, imageBase64 = null, mimeType = null) => {
    if (!userText?.trim() && !imageBase64) return;
    if (isLoading) return;

    // Add user message with optional image preview
    setMessages(prev => [...prev, { 
      role: "user", 
      text: userText || "📷 Photo submitted for review",
      imagePreview: imageBase64 
        ? `data:${mimeType};base64,${imageBase64}` 
        : null
    }]);

    const response = await sendMessage(
      userText || "Please review this photo and give me specific improvement tips based on my current training stage and goal.",
      imageBase64,
      mimeType
    );

    if (response) {
      const isComplete = response.includes("[SESSION_COMPLETE]");
      const cleanResponse = response.replace("[SESSION_COMPLETE]", "").trim();

      setMessages(prev => [...prev, { role: "model", text: cleanResponse }]);
      
      // Manage Session Loop
      if (!currentSessionActive) {
        // AI just gave the lesson/task, we are now waiting on the user
        startSession();
      } else if (isComplete) {
        // AI evaluated the user's task and provided feedback
        completeSession();
        // Progress stage upon completion (1 session completed unlocks stage 2, etc.)
        setActiveStage(Math.min(sessionsCompleted + 2, 5));
      }
    }
  };

  const handleGoalChange = async (newGoal) => {
    adjustGoal(newGoal);
    setMessages(prev => [...prev, { role: "user", text: `My goal has been updated to: ${newGoal}` }]);
    
    const response = await sendMessage(`My goal has been updated to: ${newGoal}`);
    
    if (response) {
      setMessages(prev => [...prev, { role: "model", text: response }]);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0d0d0d] text-white">
      {screen === "apikey" ? (
        <APIKeyScreen 
          onKeySubmit={handleKeySubmit} 
          error={authError} 
          isLoading={isLoading} 
        />
      ) : (
        <TrainerLayout 
          sessionsCompleted={sessionsCompleted}
          confidenceLevel={confidenceLevel}
          userGoal={userGoal}
          stages={stages}
          activeStage={activeStage}
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onGoalChange={handleGoalChange}
        />
      )}
    </div>
  );
}

export default App;

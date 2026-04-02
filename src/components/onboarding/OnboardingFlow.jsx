import React, { useState } from 'react';
import useGroq from '../../hooks/useGroq';
import StepFocusAreas from './StepFocusAreas';
import StepContext from './StepContext';
import StepBaseline from './StepBaseline';
import StepLoading from './StepLoading';
import StepComplete from './StepComplete';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [focusAreas, setFocusAreas] = useState([]);
  const [context, setContext] = useState('');
  const [baselineText, setBaselineText] = useState('');
  const [stages, setStages] = useState([]);

  const { sendMessage } = useGroq('');
  const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  };


  const generateStudyPlan = async (areas, ctx) => {
    const prompt = `Generate a 5-stage communication and public speaking study plan for someone whose focus areas are: ${areas.join(', ')} and context is ${ctx}. Strictly follow the format: Respond ONLY in raw JSON, no markdown, no backticks: { "stages": [{ "id": 1, "title": "...", "description": "..." }] }`;

    const response = await sendMessage(prompt, null, null, true);

    if (response) {
      try {
        const cleaned = response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(cleaned);
        if (parsed?.stages) {
          return parsed.stages;
        }
      } catch (err) {
        console.error('Failed to parse study plan JSON:', err);
      }
    }
    return null;
  };

  const handleFocusAreasNext = (areas) => {
    setFocusAreas(areas);
    setStep(1);
  };

  const handleContextNext = (ctx) => {
    setContext(ctx);
    setStep(2);
  };

  const handleBaselineNext = async (text) => {
    setBaselineText(text);
    setStep(3);
    // await delay(10000);
    const generatedStages = await generateStudyPlan(focusAreas, context);
    if (generatedStages) {
      setStages(generatedStages);
    }
    setStep(4);
  };

  const handleBegin = () => {
    onComplete({ focusAreas, context, baselineText, stages });
  };

  switch (step) {
    case 0:
      return <StepFocusAreas onNext={handleFocusAreasNext} />;
    case 1:
      return (
        <StepContext
          onNext={handleContextNext}
          onBack={() => setStep(0)}
        />
      );
    case 2:
      return (
        <StepBaseline
          onNext={handleBaselineNext}
          onBack={() => setStep(1)}
        />
      );
    case 3:
      return <StepLoading />;
    case 4:
      return (
        <StepComplete
          stages={stages}
          focusAreas={focusAreas}
          context={context}
          onBegin={handleBegin}
        />
      );
    default:
      return null;
  }
};

export default OnboardingFlow;

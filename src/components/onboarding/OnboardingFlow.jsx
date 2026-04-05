import { useState, useEffect } from 'react';
import useGroq from '../../hooks/useGroq';
import parseGroqJSON from '../../utils/parseGroqJSON';
import { buildDiagnosticPrompt, buildStudyPlanPrompt } from '../../prompts/onboardingPrompts';
import StepFocusAreas from './StepFocusAreas';
import StepContext from './StepContext';
import StepBaseline from './StepBaseline';
import StepLoading from './StepLoading';
import StepComplete from './StepComplete';
import DiagnosticLoading from './DiagnosticLoading';
import DiagnosticResult from './DiagnosticResult';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [focusAreas, setFocusAreas] = useState([]);
  const [context, setContext] = useState('');
  const [baselineText, setBaselineText] = useState('');
  const [stages, setStages] = useState([]);
  const [diagnosticFindings, setDiagnosticFindings] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [animReady, setAnimReady] = useState(false);

  const { sendMessage } = useGroq('');

  // Advance from DiagnosticLoading only when both API and animation are done
  useEffect(() => {
    if (step === 3 && apiReady && animReady) {
      setStep(4);
    }
  }, [step, apiReady, animReady]);

  const generateDiagnostic = async (text) => {
    const prompt = buildDiagnosticPrompt(text);
    const response = await sendMessage(prompt, null, null, true);
    if (response) {
      const parsed = parseGroqJSON(response);
      if (parsed?.strengths) {
        setDiagnosticFindings(parsed);
      }
    }
    setApiReady(true);
  };

  const generateStudyPlan = async (areas, ctx, diagnostics) => {
    const prompt = buildStudyPlanPrompt(areas, ctx, diagnostics);
    const response = await sendMessage(prompt, null, null, true);
    if (response) {
      const parsed = parseGroqJSON(response);
      if (parsed?.stages) {
        return parsed.stages;
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

  const handleBaselineNext = (text) => {
    setBaselineText(text);
    setApiReady(false);
    setAnimReady(false);
    setStep(3);
    generateDiagnostic(text);
  };

  const handleDiagnosticContinue = async () => {
    setStep(5);
    const generatedStages = await generateStudyPlan(focusAreas, context, diagnosticFindings);
    if (generatedStages) {
      setStages(generatedStages);
    }
    setStep(6);
  };

  const handleBegin = () => {
    onComplete({ focusAreas, context, baselineText, stages, diagnosticFindings });
  };

  switch (step) {
    case 0:
      return <StepFocusAreas onNext={handleFocusAreasNext} />;
    case 1:
      return <StepContext onNext={handleContextNext} onBack={() => setStep(0)} />;
    case 2:
      return <StepBaseline onNext={handleBaselineNext} onBack={() => setStep(1)} />;
    case 3:
      return <DiagnosticLoading onComplete={() => setAnimReady(true)} />;
    case 4:
      return <DiagnosticResult diagnostic={diagnosticFindings || {}} onContinue={handleDiagnosticContinue} />;
    case 5:
      return <StepLoading />;
    case 6:
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

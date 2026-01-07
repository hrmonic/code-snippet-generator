import { ReactNode, useState } from 'react';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  canProceed?: () => boolean;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
}

export function Wizard({ steps, onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const canProceed = steps[currentStep]?.canProceed?.() ?? true;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="wizard-container">
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStep + 1} sur {steps.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Indicateurs d'étapes */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => goToStep(index)}
              className={`flex flex-col items-center flex-1 ${
                index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              disabled={index > currentStep}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index < currentStep
                    ? 'bg-primary-600 text-white'
                    : index === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Contenu de l'étape actuelle */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{steps[currentStep]?.title}</h3>
        {steps[currentStep]?.description && (
          <p className="text-gray-600 mb-6">{steps[currentStep]?.description}</p>
        )}
        <div>{steps[currentStep]?.component}</div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`btn-secondary px-6 py-2.5 ${
            isFirstStep ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`btn-primary px-6 py-2.5 flex items-center gap-2 ${
            !canProceed ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLastStep ? (
            <>
              Terminer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Suivant
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}


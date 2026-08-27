import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const WorkflowStepper = ({ currentStep, onStepClick }: WorkflowStepperProps) => {
  const steps = [
    { id: 1, label: 'Source Habitation' },
    { id: 2, label: 'Safety Screening' },
    { id: 3, label: 'Safe Candidates' },
    { id: 4, label: 'Optimization' },
    { id: 5, label: 'Recommended Site' },
    { id: 6, label: 'Final Plan' }
  ];

  return (
    <div className="flex items-center w-full bg-white px-8 py-4 rounded-xl border border-slate-200 shadow-sm mb-6 overflow-x-auto">
      {steps.map((step, idx) => {
        const isCompleted = step.id <= currentStep;
        const isCurrent = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <button 
              onClick={() => onStepClick(step.id)}
              disabled={step.id > currentStep + 1}
              className={`flex items-center gap-2 group whitespace-nowrap transition-colors ${
                step.id > currentStep + 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-punarvas-primary-blue' : 'text-punarvas-primary-blue/80'}`} />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              <span className={`text-sm font-semibold ${isCompleted ? 'text-punarvas-primary-blue' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </button>
            
            {idx < steps.length - 1 && (
              <div className="flex-1 min-w-[30px] max-w-[80px] mx-4 h-[1px] bg-slate-200" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOnboardingTour } from "./OnboardingTourProvider";

const DESKTOP_MIN_WIDTH = 1024;

export default function TourTooltip() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour, completeTour } =
    useOnboardingTour();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);
  const prevTargetRef = useRef<Element | null>(null);

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  // Position the tooltip next to the target element
  const reposition = useCallback(() => {
    if (!step) return;
    const target = document.querySelector(step.targetSelector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const tooltipH = tooltipRef.current?.offsetHeight || 200;

    let top = rect.top + rect.height / 2 - tooltipH / 2;
    // Clamp so tooltip stays on screen
    top = Math.max(12, Math.min(top, window.innerHeight - tooltipH - 12));

    setPos({ top, left: rect.right + 16 });
    setReady(true);
  }, [step]);

  // Highlight current target, remove from previous
  useEffect(() => {
    if (!isActive || !step) return;

    // Remove previous highlight
    if (prevTargetRef.current) {
      prevTargetRef.current.classList.remove("tour-highlight");
      (prevTargetRef.current as HTMLElement).style.removeProperty("z-index");
      (prevTargetRef.current as HTMLElement).style.removeProperty("position");
    }

    const target = document.querySelector(step.targetSelector);
    if (target) {
      target.classList.add("tour-highlight");
      (target as HTMLElement).style.setProperty("z-index", "45");
      (target as HTMLElement).style.setProperty("position", "relative");
      prevTargetRef.current = target;
    }

    reposition();

    return () => {
      // Cleanup on unmount
      if (prevTargetRef.current) {
        prevTargetRef.current.classList.remove("tour-highlight");
        (prevTargetRef.current as HTMLElement).style.removeProperty("z-index");
        (prevTargetRef.current as HTMLElement).style.removeProperty("position");
      }
    };
  }, [isActive, currentStep, step, reposition]);

  // Recalculate on resize, auto-dismiss if mobile
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        skipTour();
        return;
      }
      reposition();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isActive, reposition, skipTour]);

  if (!isActive || !step) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 z-40 transition-opacity"
        onClick={skipTour}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 animate-tour-fade-in ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: pos.top, left: pos.left }}
      >
        {/* Arrow pointing left */}
        <div
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid white",
          }}
        />

        {/* Step counter */}
        <p className="text-xs text-slate-400 mb-1.5">
          {currentStep + 1} of {steps.length}
        </p>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={isLastStep ? completeTour : nextStep}
              className="text-sm font-medium text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { TOUR_STEPS, type TourStep } from "./tour-steps";

const STORAGE_KEY = "meridian-tour-completed";
const DESKTOP_MIN_WIDTH = 1024;

interface TourContextValue {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const pathname = usePathname();

  // Auto-start on first dashboard visit (desktop only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    if (pathname !== "/dashboard") return;
    if (window.innerWidth < DESKTOP_MIN_WIDTH) return;

    const timer = setTimeout(() => setIsActive(true), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const dismiss = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TOUR_STEPS,
        startTour,
        nextStep,
        prevStep,
        skipTour: dismiss,
        completeTour: dismiss,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useOnboardingTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx)
    throw new Error("useOnboardingTour must be used within OnboardingTourProvider");
  return ctx;
}

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Gender = 'male' | 'female' | 'other' | '';

export type ProfileSetupDraft = {
  fullName: string;
  gender: Gender;
  /** ISO YYYY-MM-DD */
  dateOfBirth: string;
  city: string;
  area: string;
  qualification: string;
  isFresher: boolean;
  experienceYears: string;
  jobCategoryIds: string[];
  expectedSalary: string;
  resumeUri: string | null;
  resumeName: string | null;
  resumeSkipped: boolean;
};

const initialDraft: ProfileSetupDraft = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  city: '',
  area: '',
  qualification: '',
  isFresher: true,
  experienceYears: '',
  jobCategoryIds: [],
  expectedSalary: '',
  resumeUri: null,
  resumeName: null,
  resumeSkipped: false,
};

type ProfileSetupContextValue = {
  draft: ProfileSetupDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProfileSetupDraft>>;
  updateDraft: (patch: Partial<ProfileSetupDraft>) => void;
  resetDraft: () => void;
};

const ProfileSetupContext = createContext<ProfileSetupContextValue | null>(null);

export const ProfileSetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<ProfileSetupDraft>(initialDraft);

  const updateDraft = useCallback((patch: Partial<ProfileSetupDraft>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(initialDraft);
  }, []);

  const value = useMemo(
    () => ({ draft, setDraft, updateDraft, resetDraft }),
    [draft, updateDraft, resetDraft],
  );

  return <ProfileSetupContext.Provider value={value}>{children}</ProfileSetupContext.Provider>;
};

export function useProfileSetup() {
  const ctx = useContext(ProfileSetupContext);
  if (!ctx) {
    throw new Error('useProfileSetup must be used within ProfileSetupProvider');
  }
  return ctx;
}

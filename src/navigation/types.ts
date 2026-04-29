export type JobDetailParams = { jobId: string };

export type HomeStackParamList = {
  HomeFeed: undefined;
  JobDetail: JobDetailParams;
  Notifications: undefined;
  SearchHome: undefined;
  JobListing: { query?: string; filters?: any };
  SearchResults: { query: string };
  JobDetail: { jobId: string };
  CategoryJobs: { categoryId?: string; section?: string } | undefined;
};

export type SearchStackParamList = {
  SearchHome: undefined;
  JobListing: { query?: string; filters?: any } | undefined;
  JobDetail: JobDetailParams;
  JobCategories: undefined;
  CategoryJobs: { categoryId?: number; categoryName?: string } | undefined;
};

export type SavedStackParamList = {
  SavedJobs: undefined;
  JobDetail: JobDetailParams;
};

export type JobReelsStackParamList = {
  ReelsMain: undefined;
  SavedPost: undefined;
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  ProfilePersonalInfo: undefined;
  ProfileEducation: undefined;
  ProfileExperience: undefined;
  ProfileJobPreferences: undefined;
  ProfileResume: undefined;
  ProfileAccountSetting: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Applications: undefined;
  Saved: undefined;
  JobReels: undefined;
  Profile: undefined;
  SavedPost: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignIn: undefined;
  EmailLogin: undefined;
  OtpVerification: { phoneDigits: string };
  ProfileBasicInfo: undefined;
  ProfileLocation: undefined;
  ProfileEducation: undefined;
  ProfileExperience: undefined;
  ProfileJobPreferences: undefined;
  ProfileResume: undefined;
  Main: undefined;
};

export type RootStackParamList = AuthStackParamList;

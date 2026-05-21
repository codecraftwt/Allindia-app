export type JobDetailParams = { jobId: string };

export type HomeStackParamList = {
  HomeFeed: undefined;
  JobDetail: JobDetailParams;
  Notifications: undefined;
  SearchHome: undefined;
  JobListing: { query?: string; filters?: any; categoryName?: string };
  SearchResults: { query: string };
  JobCategories: undefined;
  CategoryJobs: { section?: string } | undefined;
  IndustryCategory: { categoryId: number; categoryName: string };
  Saved: undefined;
  LocationSelection: undefined;
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

export type ApplicationsStackParamList = {
  ApplicationsList: undefined;
  JobDetail: JobDetailParams;
};

export type JobReelsStackParamList = {
  ReelsMain: undefined;
  SavedPost: undefined;
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  ProfileDetails: undefined;
  ProfilePersonalInfo: undefined;
  ProfileEducation: undefined;
  ProfileExperience: undefined;
  ProfileJobPreferences: undefined;
  ProfileResume: undefined;
  ProfileAccountSetting: undefined;
  HelpAndSupport: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  Saved: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Applications: undefined;
  AllJobs: undefined;
  JobReels: undefined;
  Profile: undefined;
  SavedPost: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignIn: undefined;
  EmailLogin: undefined;
  ForgotPass: undefined;
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

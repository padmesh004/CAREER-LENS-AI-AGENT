export enum TargetRole {
  DATA_ANALYST = "Data Analyst",
  DATA_SCIENTIST = "Data Scientist",
  PYTHON_DEVELOPER = "Python Developer",
  SOFTWARE_DEVELOPER = "Software Developer",
  FRONTEND_DEVELOPER = "Frontend Developer",
  BACKEND_DEVELOPER = "Backend Developer",
  FULL_STACK_DEVELOPER = "Full Stack Developer",
  AI_ENGINEER = "AI Engineer",
  ML_ENGINEER = "ML Engineer",
  UI_UX_DESIGNER = "UI/UX Designer",
}

export interface ScoreCategory {
  score: number; // 0 to 100
  reason: string;
}

export interface ProjectReport {
  projectName: string;
  technologies: string[];
  strengths: string[];
  problems: string[];
  missingInformation: string[];
  recommendations: string[];
  improvedDescription: string;
}

export interface PortfolioReport {
  overallScore: number;
  categories: {
    firstImpression: ScoreCategory;
    contentQuality: ScoreCategory;
    projects: ScoreCategory;
    technicalQuality: ScoreCategory;
    uiUx: ScoreCategory;
    recruiterReadiness: ScoreCategory;
    roleAlignment: ScoreCategory;
    accessibility: ScoreCategory;
    seo: ScoreCategory;
  };
  strengths: string[];
  importantIssues: string[];
  quickWins: string[];
  projectAnalysis: ProjectReport[];
  roleAlignmentDetails: string;
  actionPlan: string[];
  sevenDayPlan: {
    day: string;
    focus: string;
    tasks: string[];
  }[];
}

export interface ResumeReport {
  overallScore: number;
  categories: {
    contentQuality: ScoreCategory;
    structure: ScoreCategory;
    skills: ScoreCategory;
    projects: ScoreCategory;
    experience: ScoreCategory;
    education: ScoreCategory;
    atsCompatibility: ScoreCategory;
    readability: ScoreCategory;
    roleAlignment: ScoreCategory;
  };
  strengths: string[];
  importantIssues: string[];
  quickWins: string[];
  missingInformation: string[];
  keywordSuggestions: string[];
  actionPlan: string[];
  improvedWording: {
    section: string;
    original: string;
    improved: string;
    benefit: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

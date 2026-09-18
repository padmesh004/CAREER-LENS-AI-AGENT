import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import PortfolioAnalyzerForm from "./components/PortfolioAnalyzerForm";
import ResumeAnalyzerForm from "./components/ResumeAnalyzerForm";
import PortfolioReportView from "./components/PortfolioReportView";
import ResumeReportView from "./components/ResumeReportView";
import { PortfolioReport, ResumeReport } from "./types";
import { ShieldCheck, Compass, Heart } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");

  // Analysis Result States
  const [isGlobalAnalyzing, setIsGlobalAnalyzing] = useState<boolean>(false);

  const [activePortfolioReport, setActivePortfolioReport] = useState<PortfolioReport | null>(null);
  const [portfolioOriginalContent, setPortfolioOriginalContent] = useState<string>("");
  const [portfolioTargetRole, setPortfolioTargetRole] = useState<string>("");
  const [portfolioSourceUrl, setPortfolioSourceUrl] = useState<string>("");

  const [activeResumeReport, setActiveResumeReport] = useState<ResumeReport | null>(null);
  const [resumeOriginalContent, setResumeOriginalContent] = useState<string>("");
  const [resumeTargetRole, setResumeTargetRole] = useState<string>("");
  const [resumeSourceFilename, setResumeSourceFilename] = useState<string>("");

  // Handler on successful portfolio review
  const handlePortfolioSuccess = (report: PortfolioReport, content: string, role: string, sourceUrl?: string) => {
    setActivePortfolioReport(report);
    setPortfolioOriginalContent(content);
    setPortfolioTargetRole(role);
    setPortfolioSourceUrl(sourceUrl || "");
  };

  // Handler on successful resume review
  const handleResumeSuccess = (report: ResumeReport, content: string, role: string, sourceFilename?: string) => {
    setActiveResumeReport(report);
    setResumeOriginalContent(content);
    setResumeTargetRole(role);
    setResumeSourceFilename(sourceFilename || "");
  };

  // Switch tabs helper
  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between text-[#3d2314] antialiased selection:bg-[#f4f0ea] selection:text-[#5c4033]">
      {/* Premium Header */}
      <Header currentTab={currentTab} setCurrentTab={navigateToTab} />

      {/* Main Container Content */}
      <main className="flex-grow">
        {currentTab === "home" && (
          <div className="animate-fade-in">
            <Hero 
              onSelectPortfolio={() => navigateToTab("portfolio")}
              onSelectResume={() => navigateToTab("resume")}
              onSelectHowItWorks={() => navigateToTab("how-it-works")}
            />
          </div>
        )}

        {currentTab === "portfolio" && (
          <div className="py-12 animate-fade-in">
            {activePortfolioReport ? (
              <PortfolioReportView 
                report={activePortfolioReport}
                originalContent={portfolioOriginalContent}
                targetRole={portfolioTargetRole}
                sourceUrl={portfolioSourceUrl}
                onReset={() => {
                  setActivePortfolioReport(null);
                  setPortfolioOriginalContent("");
                  setPortfolioTargetRole("");
                  setPortfolioSourceUrl("");
                }}
              />
            ) : (
              <PortfolioAnalyzerForm 
                onAnalysisSuccess={handlePortfolioSuccess} 
                isGlobalAnalyzing={isGlobalAnalyzing}
                setIsGlobalAnalyzing={setIsGlobalAnalyzing}
              />
            )}
          </div>
        )}

        {currentTab === "resume" && (
          <div className="py-12 animate-fade-in">
            {activeResumeReport ? (
              <ResumeReportView 
                report={activeResumeReport}
                originalContent={resumeOriginalContent}
                targetRole={resumeTargetRole}
                sourceFilename={resumeSourceFilename}
                onReset={() => {
                  setActiveResumeReport(null);
                  setResumeOriginalContent("");
                  setResumeTargetRole("");
                  setResumeSourceFilename("");
                }}
              />
            ) : (
              <ResumeAnalyzerForm 
                onAnalysisSuccess={handleResumeSuccess} 
                isGlobalAnalyzing={isGlobalAnalyzing}
                setIsGlobalAnalyzing={setIsGlobalAnalyzing}
              />
            )}
          </div>
        )}

        {currentTab === "how-it-works" && (
          <div className="animate-fade-in">
            <HowItWorks />
          </div>
        )}

        {currentTab === "about" && (
          <div className="animate-fade-in">
            <About />
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#fbfaf8] border-t border-[#e8d8c8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#5c4033] flex items-center justify-center text-[#faf9f6]">
                <Compass className="w-4.5 h-4.5 text-[#f5eedc]" />
              </div>
              <span className="font-bold text-lg text-[#3d2314] tracking-tight">
                CareerLens<span className="text-[#8c6239]">.AI</span>
              </span>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#705245]">
              <button onClick={() => navigateToTab("home")} className="hover:text-[#3d2314] transition-colors">Home</button>
              <button onClick={() => navigateToTab("portfolio")} className="hover:text-[#3d2314] transition-colors">Portfolio Analyzer</button>
              <button onClick={() => navigateToTab("resume")} className="hover:text-[#3d2314] transition-colors">Resume Analyzer</button>
              <button onClick={() => navigateToTab("how-it-works")} className="hover:text-[#3d2314] transition-colors">How It Works</button>
              <button onClick={() => navigateToTab("about")} className="hover:text-[#3d2314] transition-colors">About</button>
            </div>

            {/* Shield and Privacy */}
            <div className="flex items-center space-x-1.5 text-xs text-[#8c6239] font-semibold bg-[#f4f0ea] border border-[#e8d8c8] px-3.5 py-1.5 rounded-full shadow-sm select-none">
              <ShieldCheck className="w-4 h-4 text-[#8c6239]" />
              <span>Session Data Protected offline</span>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-[#e8d8c8]/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#705245]/80">
            <p>© {new Date().getFullYear()} CareerLens AI. All rights reserved.</p>
            <p className="flex items-center space-x-1">
              <span>Crafted in luxury warm brown & milk white style</span>
              <Heart className="w-3 h-3 text-[#8c6239] fill-[#8c6239]" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

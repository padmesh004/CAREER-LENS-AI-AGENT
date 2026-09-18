import React, { useState } from "react";
import { 
  Download, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen, 
  Calendar, 
  Code2, 
  Compass,
  ArrowRight,
  User,
  ExternalLink
} from "lucide-react";
import { PortfolioReport } from "../types";
import ChatAssistant from "./ChatAssistant";
import { exportPortfolioPDF } from "../utils/pdfGenerator";

interface PortfolioReportViewProps {
  report: PortfolioReport;
  originalContent: string;
  targetRole: string;
  onReset: () => void;
  sourceUrl?: string;
}

export default function PortfolioReportView({ report, originalContent, targetRole, onReset, sourceUrl }: PortfolioReportViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "projects" | "plan" | "assistant">("dashboard");
  const [isExporting, setIsExporting] = useState(false);

  // Trigger real PDF Download
  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      exportPortfolioPDF(report, targetRole, sourceUrl || (originalContent.startsWith("http") ? originalContent : undefined));
    } catch (err) {
      console.error("Failed to generate Portfolio PDF:", err);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  // Safe Category Extractor
  const categoriesMap = [
    { label: "First Impression", data: report.categories.firstImpression },
    { label: "Content Quality", data: report.categories.contentQuality },
    { label: "Projects Review", data: report.categories.projects },
    { label: "Technical Quality", data: report.categories.technicalQuality },
    { label: "UI/UX Assessment", data: report.categories.uiUx },
    { label: "Recruiter Readiness", data: report.categories.recruiterReadiness },
    { label: "Role Alignment", data: report.categories.roleAlignment },
    { label: "Accessibility", data: report.categories.accessibility },
    { label: "SEO Score", data: report.categories.seo },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs text-[#8c6239] font-bold uppercase tracking-widest">Analysis Results</span>
          <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight">Portfolio Diagnostic Report</h2>
          <p className="text-sm text-[#705245] mt-1">Targeting: <span className="font-semibold text-[#5c4033]">{targetRole}</span></p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
          <button
            id="download-portfolio-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white border border-[#e8d8c8] hover:bg-[#f4f0ea] text-[#5c4033] font-bold text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Generating PDF..." : "Download PDF Report"}</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#5c4033] hover:bg-[#3d2314] text-[#faf9f6] font-bold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Review</span>
          </button>
        </div>
      </div>

      {/* Main Stats Row / Dashboard Overview */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Circle Progress Score Card */}
        <div className="bg-[#fbfaf8] border border-[#e8d8c8] p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#8c6239]" />
          
          <h4 className="text-sm font-bold text-[#705245] mb-4 uppercase tracking-wider">Overall Review Score</h4>
          
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[#f4f0ea]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[#5c4033] transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * report.overallScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-[#3d2314]">{report.overallScore}</span>
              <span className="text-[10px] text-[#705245] font-bold uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-[#8c6239] font-bold px-3 py-1 bg-[#f4f0ea] border border-[#e8d8c8] rounded-full inline-flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Constructive AI Grade</span>
          </p>
        </div>

        {/* Strengths & Quick Wins summaries */}
        <div className="md:col-span-2 bg-[#fbfaf8] border border-[#e8d8c8] p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#d2b48c]" />
          
          <div>
            <h4 className="text-sm font-bold text-[#3d2314] mb-4 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4.5 h-4.5 text-[#8c6239]" />
              <span>Role Alignment & Executive Summary</span>
            </h4>
            <p className="text-sm text-[#705245] leading-relaxed mb-6">
              {report.roleAlignmentDetails || "No role alignment details provided."}
            </p>
          </div>

          {/* Core counts */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#e8d8c8]/50 text-center">
            <div>
              <p className="text-2xl font-black text-[#5c4033]">{report.strengths.length}</p>
              <p className="text-[10px] text-[#705245] font-bold uppercase">Strengths Scored</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#5c4033]">{report.importantIssues.length}</p>
              <p className="text-[10px] text-[#705245] font-bold uppercase">Key Gaps Found</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#5c4033]">{report.quickWins.length}</p>
              <p className="text-[10px] text-[#705245] font-bold uppercase">Quick Wins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local Tabs */}
      <div className="flex border-b border-[#e8d8c8] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "dashboard"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          Overall Score Cards
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "projects"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          Project Deep Dive ({report.projectAnalysis.length})
        </button>
        <button
          onClick={() => setActiveTab("plan")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "plan"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          7-Day Plan & Actions
        </button>
        <button
          onClick={() => setActiveTab("assistant")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "assistant"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          Live AI Coach
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* 1. Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Main Score Grids */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesMap.map((cat, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-[#e8d8c8] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-[#3d2314]">{cat.label}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      cat.data.score >= 80 ? "bg-green-100 text-green-800" : cat.data.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>
                      {cat.data.score}/100
                    </span>
                  </div>
                  
                  {/* Miniature linear progress meter */}
                  <div className="w-full bg-[#f4f0ea] h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-[#5c4033] h-full" 
                      style={{ width: `${cat.data.score}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-[#705245] leading-relaxed">
                    {cat.data.reason || "Not enough information to verify this category."}
                  </p>
                </div>
              ))}
            </div>

            {/* Strengths & Issue listings */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Strengths Card */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[#3d2314] mb-4 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
                  <span>Strengths Detected</span>
                </h4>
                <ul className="space-y-3.5">
                  {report.strengths.length > 0 ? (
                    report.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-[#705245] leading-relaxed flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-[#a08a75] italic">Not enough information to verify this.</p>
                  )}
                </ul>
              </div>

              {/* Critical Gaps Card */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[#3d2314] mb-4 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-3">
                  <AlertTriangle className="w-4.5 h-4.5 text-[#8c6239]" />
                  <span>Core Gaps & Issues</span>
                </h4>
                <ul className="space-y-3.5">
                  {report.importantIssues.length > 0 ? (
                    report.importantIssues.map((i, idx) => (
                      <li key={idx} className="text-xs text-[#705245] leading-relaxed flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8c6239] mt-1.5 shrink-0" />
                        <span>{i}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-green-700 italic">No critical layout or presentation gaps detected!</p>
                  )}
                </ul>
              </div>

              {/* Quick Wins Card */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[#3d2314] mb-4 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-3">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                  <span>Immediate Quick Wins</span>
                </h4>
                <ul className="space-y-3.5">
                  {report.quickWins.length > 0 ? (
                    report.quickWins.map((q, idx) => (
                      <li key={idx} className="text-xs text-[#705245] leading-relaxed flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-[#a08a75] italic">Not enough information to verify this.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. Projects Deep Dive Tab */}
        {activeTab === "projects" && (
          <div className="space-y-8 animate-fade-in">
            {report.projectAnalysis.length > 0 ? (
              report.projectAnalysis.map((p, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-[#e8d8c8] rounded-2xl overflow-hidden p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#5c4033]" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#3d2314]">{p.projectName || "Unnamed Technical Project"}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.technologies.map((t, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#f4f0ea] border border-[#e8d8c8] text-[10px] font-bold text-[#5c4033]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    {/* Key Strengths & Issues */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-green-700 block tracking-wider mb-1.5">Project Highlights</span>
                        <ul className="space-y-2">
                          {p.strengths.map((str, i) => (
                            <li key={i} className="text-xs text-[#705245] flex items-start space-x-1.5">
                              <span className="text-green-600 font-bold">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#8c6239] block tracking-wider mb-1.5">Identified Deficiencies</span>
                        <ul className="space-y-2">
                          {p.problems.map((prob, i) => (
                            <li key={i} className="text-xs text-[#705245] flex items-start space-x-1.5">
                              <span className="text-[#8c6239] font-bold">!</span>
                              <span>{prob}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Missing Info & Action Tips */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#3d2314] block tracking-wider mb-1.5">Missing Context Data</span>
                        <ul className="space-y-2">
                          {p.missingInformation.map((miss, i) => (
                            <li key={i} className="text-xs text-[#705245] flex items-start space-x-1.5">
                              <span className="text-[#a08a75] font-bold">•</span>
                              <span>{miss}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#8c6239] block tracking-wider mb-1.5">Actionable Coaching Recommendations</span>
                        <ul className="space-y-2">
                          {p.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-[#705245] flex items-start space-x-1.5">
                              <span className="text-amber-500 font-bold">★</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Refactored Text Description */}
                  {p.improvedDescription && p.improvedDescription !== "Not enough information to verify this" && (
                    <div className="mt-6 pt-6 border-t border-[#e8d8c8]/50 bg-[#faf9f6] p-5 rounded-xl border border-[#e8d8c8]/60">
                      <span className="text-[10px] font-bold uppercase text-[#3d2314] block tracking-wider mb-2">Optimized description (Using ONLY original facts)</span>
                      <p className="text-xs text-[#705245] leading-relaxed italic">
                        "{p.improvedDescription}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-[#705245] italic py-10">We couldn't detect distinct technical projects in the provided text. Use the AI Chat assistant to refine your descriptions.</p>
            )}
          </div>
        )}

        {/* 3. 7-Day Plan & Action Plan */}
        {activeTab === "plan" && (
          <div className="space-y-8 animate-fade-in">
            {/* Immediate Action checklist */}
            <div className="bg-white border border-[#e8d8c8] p-6 sm:p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-[#3d2314] mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#8c6239]" />
                <span>Primary Executive Action Items</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {report.actionPlan.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg border border-[#e8d8c8]/40 bg-[#fbfaf8]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#8c6239] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#705245] leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Calendar */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#3d2314] flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#8c6239]" />
                <span>7-Day Strategic Improvement Calendar</span>
              </h3>
              
              <div className="grid md:grid-cols-7 gap-4">
                {report.sevenDayPlan.map((day, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-[#e8d8c8] rounded-xl p-4 shadow-sm relative flex flex-col justify-between"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-[#d2b48c]" />
                    <div>
                      <div className="font-extrabold text-sm text-[#5c4033] mb-1">{day.day}</div>
                      <div className="text-[10px] font-bold uppercase text-[#8c6239] mb-3">{day.focus}</div>
                      
                      <div className="space-y-2">
                        {day.tasks.map((task, i) => (
                          <div key={i} className="text-[10px] text-[#705245] leading-relaxed flex items-start space-x-1">
                            <span>•</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Chat Assistant */}
        {activeTab === "assistant" && (
          <div className="animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <ChatAssistant 
                contextType="portfolio"
                contextContent={originalContent}
                targetRole={targetRole}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

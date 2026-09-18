import React, { useState } from "react";
import { 
  Download, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  BookOpen, 
  Code2, 
  Compass,
  ArrowRight
} from "lucide-react";
import { ResumeReport } from "../types";
import ChatAssistant from "./ChatAssistant";
import { exportResumePDF } from "../utils/pdfGenerator";

interface ResumeReportViewProps {
  report: ResumeReport;
  originalContent: string;
  targetRole: string;
  onReset: () => void;
  sourceFilename?: string;
}

export default function ResumeReportView({ report, originalContent, targetRole, onReset, sourceFilename }: ResumeReportViewProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "wording" | "keywords" | "assistant" >("dashboard");
  const [isExporting, setIsExporting] = useState(false);

  // Trigger real PDF Download
  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      exportResumePDF(report, targetRole, sourceFilename);
    } catch (err) {
      console.error("Failed to generate Resume PDF:", err);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  // Safe Category Extractor
  const categoriesMap = [
    { label: "Content Quality", data: report.categories.contentQuality },
    { label: "Structure & Layout", data: report.categories.structure },
    { label: "Skills Matching", data: report.categories.skills },
    { label: "Projects Impact", data: report.categories.projects },
    { label: "Work Experience", data: report.categories.experience },
    { label: "Education Context", data: report.categories.education },
    { label: "ATS Compatibility", data: report.categories.atsCompatibility },
    { label: "Readability Check", data: report.categories.readability },
    { label: "Role Alignment", data: report.categories.roleAlignment },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs text-[#8c6239] font-bold uppercase tracking-widest">Analysis Results</span>
          <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight">Resume Review Report</h2>
          <p className="text-sm text-[#705245] mt-1">Targeting: <span className="font-semibold text-[#5c4033]">{targetRole}</span></p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
          <button
            id="download-resume-pdf-btn"
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

      {/* Overview Stat Widgets */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Circle Progress Score Card */}
        <div className="bg-[#fbfaf8] border border-[#e8d8c8] p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#8c6239]" />
          
          <h4 className="text-sm font-bold text-[#705245] mb-4 uppercase tracking-wider">ATS Score Summary</h4>
          
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
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
            <span>Real ATS Algorithms Match</span>
          </p>
        </div>

        {/* Action summaries */}
        <div className="md:col-span-2 bg-[#fbfaf8] border border-[#e8d8c8] p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#d2b48c]" />
          
          <div>
            <h4 className="text-sm font-bold text-[#3d2314] mb-3 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4.5 h-4.5 text-[#8c6239]" />
              <span>ATS Alignment Summary</span>
            </h4>
            <p className="text-sm text-[#705245] leading-relaxed mb-6">
              This resume was audited against high-performing ATS screening criteria. We evaluated structure parsing efficiency, hard/soft skill densities, role-relevant keyword frequencies, and quantitative achievement formatting.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-6 border-t border-[#e8d8c8]/50 text-center">
            <div>
              <p className="text-xl font-black text-[#5c4033]">{report.strengths.length}</p>
              <p className="text-[9px] text-[#705245] font-bold uppercase">Strengths</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#5c4033]">{report.importantIssues.length}</p>
              <p className="text-[9px] text-[#705245] font-bold uppercase">Deficiencies</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#5c4033]">{report.quickWins.length}</p>
              <p className="text-[9px] text-[#705245] font-bold uppercase">Quick Wins</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#5c4033]">{report.missingInformation.length}</p>
              <p className="text-[9px] text-[#705245] font-bold uppercase">Missing Info</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8d8c8] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "dashboard"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          ATS Core Review
        </button>
        <button
          onClick={() => setActiveTab("wording")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "wording"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          Polished Bullet points ({report.improvedWording.length})
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === "keywords"
              ? "border-[#5c4033] text-[#3d2314] font-bold"
              : "border-transparent text-[#705245] hover:text-[#3d2314]"
          }`}
        >
          ATS Keywords suggestions
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

      {/* Panels */}
      <div>
        {/* 1. Core Review */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Category Score Grid */}
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

            {/* Quad Grid: Strengths, Issues, Wins, Missing Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Strengths */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#3d2314] mb-3 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Strengths</span>
                </h4>
                <ul className="space-y-2.5">
                  {report.strengths.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-[#705245] leading-relaxed flex items-start space-x-1.5">
                      <span className="w-1 bg-green-600 h-1 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Issues */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#3d2314] mb-3 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-2">
                  <AlertTriangle className="w-4 h-4 text-[#8c6239]" />
                  <span>Deficiencies</span>
                </h4>
                <ul className="space-y-2.5">
                  {report.importantIssues.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-[#705245] leading-relaxed flex items-start space-x-1.5">
                      <span className="w-1 bg-[#8c6239] h-1 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Wins */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#3d2314] mb-3 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Quick Wins</span>
                </h4>
                <ul className="space-y-2.5">
                  {report.quickWins.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-[#705245] leading-relaxed flex items-start space-x-1.5">
                      <span className="w-1 bg-amber-500 h-1 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Information */}
              <div className="bg-white border border-[#e8d8c8] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-[#3d2314] mb-3 flex items-center space-x-1.5 uppercase tracking-wider border-b border-[#e8d8c8] pb-2">
                  <BookOpen className="w-4 h-4 text-[#8c6239]" />
                  <span>Missing Details</span>
                </h4>
                <ul className="space-y-2.5">
                  {report.missingInformation.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-[#705245] leading-relaxed flex items-start space-x-1.5">
                      <span className="w-1 bg-[#a08a75] h-1 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-white border border-[#e8d8c8] rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#3d2314] mb-4 flex items-center space-x-1.5 uppercase tracking-wider">
                <Compass className="w-4.5 h-4.5 text-[#8c6239]" />
                <span>Executive Roadmap Checklist</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {report.actionPlan.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl border border-[#e8d8c8]/40 bg-[#fbfaf8]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#8c6239] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#705245] leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Polished Bullet points Tab */}
        {activeTab === "wording" && (
          <div className="space-y-6 animate-fade-in">
            {report.improvedWording.length > 0 ? (
              report.improvedWording.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-[#e8d8c8] rounded-2xl overflow-hidden shadow-sm relative p-6 sm:p-8"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#5c4033]" />
                  
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f4f0ea] border border-[#e8d8c8] text-[10px] font-bold text-[#5c4033] inline-block mb-3">
                    {item.section} Section
                  </span>

                  <div className="grid md:grid-cols-2 gap-6 mt-2">
                    {/* Original */}
                    <div className="p-4 rounded-xl border border-[#e8d8c8]/40 bg-red-50/20">
                      <span className="text-[9px] font-bold text-red-800 uppercase block tracking-wider mb-2">Original Phrasing</span>
                      <p className="text-xs text-[#705245] leading-relaxed italic">
                        "{item.original}"
                      </p>
                    </div>

                    {/* Improved */}
                    <div className="p-4 rounded-xl border border-green-200 bg-green-50/10">
                      <span className="text-[9px] font-bold text-green-800 uppercase block tracking-wider mb-2">Polished Phrasing (Using ONLY original facts)</span>
                      <p className="text-xs text-[#3d2314] font-semibold leading-relaxed">
                        "{item.improved}"
                      </p>
                    </div>
                  </div>

                  {/* Benefit */}
                  {item.benefit && (
                    <div className="mt-4 flex items-start space-x-2 bg-[#f4f0ea]/30 p-3 rounded-lg text-xs text-[#705245] border border-[#e8d8c8]/50">
                      <Sparkles className="w-4 h-4 text-[#8c6239] shrink-0 mt-0.5" />
                      <span><strong>Impact Benefit:</strong> {item.benefit}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-[#705245] italic py-10">Use the interactive AI chat coach to craft custom phrasing upgrades for your experience bullets.</p>
            )}
          </div>
        )}

        {/* 3. ATS Keywords suggestions */}
        {activeTab === "keywords" && (
          <div className="bg-white border border-[#e8d8c8] p-6 sm:p-8 rounded-2xl shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-[#3d2314] mb-3 flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-[#8c6239]" />
              <span>Recommended ATS-Boosting Search Terms</span>
            </h3>
            <p className="text-xs text-[#705245] leading-relaxed mb-6">
              Our AI compared your resume profile against recruiter keywords frequently scanned for **{targetRole}** pipelines. Integrating these missing context tags organically into your projects and experience bullets will maximize screening thresholds.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {report.keywordSuggestions.map((kw, idx) => (
                <div 
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-[#f4f0ea] border border-[#e8d8c8] hover:border-[#8c6239] text-xs font-semibold text-[#5c4033] shadow-inner transition-colors duration-200"
                >
                  {kw}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Chat Coach */}
        {activeTab === "assistant" && (
          <div className="animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <ChatAssistant 
                contextType="resume"
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

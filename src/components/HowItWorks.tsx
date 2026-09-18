import React from "react";
import { Search, Compass, Cpu, FileCheck, HelpCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Input & Source Submission",
      description: "Enter your portfolio URL, paste its contents, or upload your resume in PDF/DOCX/TXT format. Optionally specify your desired target job role.",
      icon: Search,
    },
    {
      num: "02",
      title: "Real-Time Parsing & Extraction",
      description: "Our backend scrapes and cleans portfolio web layouts or parses binary doc structures to extract high-fidelity text without collecting or storing personal profiles.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "Deep AI Analysis",
      description: "We orchestrate our Gemini-powered engine to evaluate structural layouts, accessibility, SEO, recruiter readability, ATS benchmarks, and core competency gaps.",
      icon: Compass,
    },
    {
      num: "04",
      title: "Interactive Report & Coach",
      description: "Get granular scores, a 7-day milestone checklist, and a secure chatbot loaded with your specific review context to brainstorm bullet rewrites and next steps.",
      icon: FileCheck,
    },
  ];

  return (
    <section className="bg-[#faf9f6] py-20 border-t border-[#e8d8c8]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#3d2314] tracking-tight mb-4">
            How CareerLens AI Works
          </h2>
          <p className="text-lg text-[#705245]">
            A reliable, transparent, full-stack review process designed to elevate your professional presentation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="bg-[#fbfaf8] border border-[#e8d8c8]/50 p-8 rounded-xl relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute top-4 right-4 text-4xl font-black text-[#e8d8c8]/60 select-none">
                  {step.num}
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-[#f4f0ea] border border-[#e8d8c8] flex items-center justify-center text-[#8c6239] mb-6">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-[#3d2314] mb-3">
                  {step.title}
                </h3>
                
                <p className="text-sm text-[#705245] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security / Confidentiality Guarantee */}
        <div className="mt-16 bg-[#f5eedc]/40 border border-[#e8d8c8] rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-12 h-12 rounded-full bg-[#faf9f6] flex items-center justify-center text-[#8c6239] shrink-0 shadow-sm border border-[#e8d8c8]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#3d2314]">Is my data safe and private?</h4>
            <p className="text-sm text-[#705245] mt-1">
              Absolutely. CareerLens AI does not require logins, accounts, or connections to social profiles. Your files and portfolio texts are parsed in-memory, processed directly via the Gemini API, and never persisted in database environments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

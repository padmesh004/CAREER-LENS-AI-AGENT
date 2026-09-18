import React, { useState } from "react";
import { Menu, X, Compass, Award, Shield, FileText, ChevronRight } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Header({ currentTab, setCurrentTab }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "portfolio", label: "Portfolio Analyzer" },
    { id: "resume", label: "Resume Analyzer" },
    { id: "how-it-works", label: "How It Works" },
    { id: "about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#e8d8c8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab("home")}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#5c4033] flex items-center justify-center text-[#faf9f6] shadow-md transition-transform duration-300 group-hover:rotate-12">
              <Compass className="w-5 h-5 text-[#f5eedc]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#3d2314]">
                CareerLens<span className="text-[#8c6239]">.AI</span>
              </span>
              <p className="text-[10px] text-[#8c6239] font-medium tracking-widest uppercase">Premium Review</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentTab === item.id
                    ? "bg-[#f4f0ea] text-[#3d2314] shadow-sm font-semibold"
                    : "text-[#705245] hover:text-[#3d2314] hover:bg-[#faf9f6]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Premium Badge */}
          <div className="hidden lg:flex items-center space-x-1 bg-[#f4f0ea] border border-[#e8d8c8] px-3 py-1 rounded-full text-xs font-semibold text-[#5c4033] shadow-inner select-none">
            <Award className="w-3.5 h-3.5 text-[#8c6239]" />
            <span>AI Powered</span>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#705245] hover:text-[#3d2314] hover:bg-[#f4f0ea] transition-colors focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#e8d8c8] bg-[#faf9f6] shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  currentTab === item.id
                    ? "bg-[#f4f0ea] text-[#3d2314] font-semibold"
                    : "text-[#705245] hover:bg-[#f4f0ea]/50 hover:text-[#3d2314]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </button>
            ))}
            <div className="mt-4 px-4 py-3 bg-[#f5eedc]/50 rounded-xl border border-[#e8d8c8] mx-2 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#8c6239]" />
              <span className="text-xs text-[#5c4033] font-medium">100% Secure & Confidential</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

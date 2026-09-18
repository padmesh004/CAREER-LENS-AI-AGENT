import { jsPDF } from "jspdf";
import { PortfolioReport, ResumeReport } from "../types";

/**
 * Sanitizes role string for clean, valid filenames
 */
export function sanitizeFilename(role: string): string {
  const cleaned = (role || "General_Tech")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  return cleaned || "General_Tech";
}

// Color Palette Definition (Warm Brown + Milk White)
const COLORS = {
  primaryDark: [61, 35, 20] as [number, number, number],     // #3d2314
  primaryBrown: [92, 64, 51] as [number, number, number],    // #5c4033
  accentTan: [140, 98, 57] as [number, number, number],      // #8c6239
  accentGold: [180, 130, 70] as [number, number, number],    // warm gold/bronze
  milkWhite: [250, 249, 246] as [number, number, number],    // #faf9f6
  creamBg: [244, 240, 234] as [number, number, number],      // #f4f0ea
  cardBorder: [232, 216, 200] as [number, number, number],   // #e8d8c8
  textDark: [61, 35, 20] as [number, number, number],        // #3d2314
  textMuted: [112, 82, 69] as [number, number, number],      // #705245
  successGreen: [46, 125, 50] as [number, number, number],   // #2e7d32
  warningAmber: [194, 98, 18] as [number, number, number],   // #c26212
  dangerRed: [180, 40, 30] as [number, number, number],      // #b4281e
  white: [255, 255, 255] as [number, number, number],
};

class PDFBuilder {
  doc: jsPDF;
  pageWidth: number = 210;
  pageHeight: number = 297;
  marginLeft: number = 16;
  marginRight: number = 16;
  marginTop: number = 20;
  marginBottom: number = 20;
  contentWidth: number;
  currentY: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.currentY = this.marginTop;
  }

  ensureSpace(neededHeight: number) {
    if (this.currentY + neededHeight > this.pageHeight - this.marginBottom) {
      this.doc.addPage();
      this.currentY = this.marginTop + 10;
      this.drawRunningHeader();
    }
  }

  drawRunningHeader() {
    this.doc.setFillColor(...COLORS.primaryBrown);
    this.doc.rect(this.marginLeft, 8, this.contentWidth, 1.2, "F");
    
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.accentTan);
    this.doc.text("CAREERLENS.AI", this.marginLeft, 14);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text("Professional AI Career & Portfolio Diagnostics", this.marginLeft + 32, 14);
  }

  drawReportHeader(title: string, subtitle: string, metaItems: { label: string; value: string }[]) {
    // Header Banner
    const bannerHeight = 36;
    this.doc.setFillColor(...COLORS.primaryDark);
    this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, bannerHeight, 3, 3, "F");

    // Brand accent line
    this.doc.setFillColor(...COLORS.accentGold);
    this.doc.rect(this.marginLeft + 4, this.currentY + 4, 3, bannerHeight - 8, "F");

    // Brand logo text
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...COLORS.milkWhite);
    this.doc.text("CareerLens", this.marginLeft + 12, this.currentY + 12);
    
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...COLORS.accentGold);
    this.doc.text(".AI", this.marginLeft + 44, this.currentY + 12);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(215, 200, 185);
    this.doc.text("Enterprise-Grade Diagnostic & Talent Audit", this.marginLeft + 56, this.currentY + 12);

    // Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(...COLORS.white);
    this.doc.text(title, this.marginLeft + 12, this.currentY + 22);

    // Subtitle
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(225, 215, 205);
    this.doc.text(subtitle, this.marginLeft + 12, this.currentY + 29);

    this.currentY += bannerHeight + 6;

    // Metadata bar (URL/Source, Target Role, Generated Date)
    const metaBoxHeight = 16;
    this.doc.setFillColor(...COLORS.creamBg);
    this.doc.setDrawColor(...COLORS.cardBorder);
    this.doc.setLineWidth(0.4);
    this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, metaBoxHeight, 2, 2, "FD");

    const colWidth = this.contentWidth / metaItems.length;
    metaItems.forEach((item, idx) => {
      const colX = this.marginLeft + idx * colWidth + 4;
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.accentTan);
      this.doc.text(item.label.toUpperCase(), colX, this.currentY + 6);

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...COLORS.textDark);
      // Truncate cleanly if too long for column
      const maxValWidth = colWidth - 8;
      let displayVal = item.value;
      if (this.doc.getTextWidth(displayVal) > maxValWidth) {
        while (displayVal.length > 4 && this.doc.getTextWidth(displayVal + "...") > maxValWidth) {
          displayVal = displayVal.slice(0, -1);
        }
        displayVal += "...";
      }
      this.doc.text(displayVal, colX, this.currentY + 12);
    });

    this.currentY += metaBoxHeight + 8;
  }

  drawScoreOverview(overallScore: number, scoreTitle: string, summaryHeading: string, summaryText: string) {
    this.ensureSpace(48);

    const boxHeight = 44;
    this.doc.setFillColor(...COLORS.milkWhite);
    this.doc.setDrawColor(...COLORS.cardBorder);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, boxHeight, 3, 3, "FD");

    // Top accent bar
    this.doc.setFillColor(...COLORS.primaryBrown);
    this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, 2, 1, 1, "F");

    // Left Score Column (Width: 50mm)
    const scoreBoxWidth = 50;
    this.doc.setFillColor(...COLORS.creamBg);
    this.doc.roundedRect(this.marginLeft + 4, this.currentY + 6, scoreBoxWidth, boxHeight - 10, 2, 2, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...COLORS.accentTan);
    this.doc.text(scoreTitle.toUpperCase(), this.marginLeft + 8, this.currentY + 14);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(26);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(`${overallScore}`, this.marginLeft + 8, this.currentY + 28);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text("/ 100", this.marginLeft + 8 + this.doc.getTextWidth(`${overallScore}`) + 2, this.currentY + 28);

    // Score status badge
    let statusText = "Excellent Alignment";
    let statusColor = COLORS.successGreen;
    if (overallScore < 60) {
      statusText = "Needs Comprehensive Optimization";
      statusColor = COLORS.dangerRed;
    } else if (overallScore < 75) {
      statusText = "Moderate Readiness (Action Advised)";
      statusColor = COLORS.warningAmber;
    } else if (overallScore < 88) {
      statusText = "Solid Competitive Baseline";
      statusColor = COLORS.accentTan;
    }

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...statusColor);
    this.doc.text(statusText, this.marginLeft + 8, this.currentY + 36);

    // Right Summary Column
    const summaryX = this.marginLeft + scoreBoxWidth + 8;
    const summaryWidth = this.contentWidth - scoreBoxWidth - 12;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(summaryHeading, summaryX, this.currentY + 12);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...COLORS.textMuted);
    const splitSummary = this.doc.splitTextToSize(summaryText, summaryWidth);
    this.doc.text(splitSummary.slice(0, 5), summaryX, this.currentY + 18);

    this.currentY += boxHeight + 8;
  }

  drawSectionHeading(title: string, iconMarker: string = "■") {
    this.ensureSpace(16);

    this.doc.setFillColor(...COLORS.primaryBrown);
    this.doc.rect(this.marginLeft, this.currentY + 1, 3.5, 9, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(title.toUpperCase(), this.marginLeft + 6, this.currentY + 8);

    this.doc.setDrawColor(...COLORS.cardBorder);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.marginLeft + 6 + this.doc.getTextWidth(title.toUpperCase()) + 4, this.currentY + 6, this.marginLeft + this.contentWidth, this.currentY + 6);

    this.currentY += 14;
  }

  drawCategoryGrid(categories: { name: string; score: number; reason: string }[]) {
    this.ensureSpace(40);
    const cardWidth = (this.contentWidth - 6) / 2;

    for (let i = 0; i < categories.length; i += 2) {
      const cat1 = categories[i];
      const cat2 = categories[i + 1];

      // Calculate heights needed
      const lines1 = this.doc.splitTextToSize(cat1.reason || "Audited against benchmark standards.", cardWidth - 12);
      const lines2 = cat2 ? this.doc.splitTextToSize(cat2.reason || "Audited against benchmark standards.", cardWidth - 12) : [];
      const maxLines = Math.max(lines1.length, lines2.length);
      const rowHeight = Math.max(26, 16 + maxLines * 4);

      this.ensureSpace(rowHeight + 4);

      // Render Cat 1
      this.renderCategoryCard(this.marginLeft, this.currentY, cardWidth, rowHeight, cat1, lines1);

      // Render Cat 2 if exists
      if (cat2) {
        this.renderCategoryCard(this.marginLeft + cardWidth + 6, this.currentY, cardWidth, rowHeight, cat2, lines2);
      }

      this.currentY += rowHeight + 4;
    }
    this.currentY += 4;
  }

  private renderCategoryCard(x: number, y: number, width: number, height: number, cat: { name: string; score: number; reason: string }, lines: string[]) {
    this.doc.setFillColor(...COLORS.milkWhite);
    this.doc.setDrawColor(...COLORS.cardBorder);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, y, width, height, 2, 2, "FD");

    // Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(cat.name, x + 4, y + 6);

    // Score badge
    const badgeText = `${cat.score}/100`;
    const badgeWidth = this.doc.getTextWidth(badgeText) + 6;
    let badgeBg = COLORS.creamBg;
    let badgeFg = COLORS.primaryBrown;
    if (cat.score >= 80) {
      badgeBg = [232, 245, 233];
      badgeFg = COLORS.successGreen;
    } else if (cat.score < 60) {
      badgeBg = [255, 235, 238];
      badgeFg = COLORS.dangerRed;
    }

    this.doc.setFillColor(...badgeBg);
    this.doc.roundedRect(x + width - badgeWidth - 4, y + 2, badgeWidth, 5.5, 1.5, 1.5, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7);
    this.doc.setTextColor(...badgeFg);
    this.doc.text(badgeText, x + width - badgeWidth - 1, y + 6);

    // Progress bar
    this.doc.setFillColor(...COLORS.creamBg);
    this.doc.roundedRect(x + 4, y + 9, width - 8, 1.6, 0.8, 0.8, "F");

    this.doc.setFillColor(...COLORS.primaryBrown);
    const progressWidth = Math.max(2, ((width - 8) * cat.score) / 100);
    this.doc.roundedRect(x + 4, y + 9, progressWidth, 1.6, 0.8, 0.8, "F");

    // Reason text
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(...COLORS.textMuted);
    this.doc.text(lines, x + 4, y + 14);
  }

  drawBulletList(title: string, items: string[], type: "success" | "warning" | "info" | "neutral" = "neutral") {
    if (!items || items.length === 0) return;

    this.ensureSpace(20);

    let symbol = "•";
    let iconColor = COLORS.primaryBrown;
    let boxBorder = COLORS.cardBorder;
    let boxFill = COLORS.milkWhite;

    if (type === "success") {
      symbol = "✓";
      iconColor = COLORS.successGreen;
    } else if (type === "warning") {
      symbol = "!";
      iconColor = COLORS.warningAmber;
    } else if (type === "info") {
      symbol = "★";
      iconColor = COLORS.accentTan;
    }

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(title, this.marginLeft, this.currentY + 4);
    this.currentY += 8;

    items.forEach((item) => {
      const splitLines = this.doc.splitTextToSize(item, this.contentWidth - 12);
      const itemHeight = Math.max(7, splitLines.length * 4.2 + 2);

      this.ensureSpace(itemHeight + 2);

      // Bullet symbol
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(...iconColor);
      this.doc.text(symbol, this.marginLeft + 2, this.currentY + 3.5);

      // Text
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(...COLORS.textDark);
      this.doc.text(splitLines, this.marginLeft + 8, this.currentY + 3.5);

      this.currentY += itemHeight;
    });

    this.currentY += 4;
  }

  drawKeywordsGrid(title: string, keywords: string[]) {
    if (!keywords || keywords.length === 0) return;

    this.ensureSpace(22);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...COLORS.primaryDark);
    this.doc.text(title, this.marginLeft, this.currentY + 4);
    this.currentY += 8;

    let currentX = this.marginLeft;
    const tagHeight = 6.5;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.5);

    keywords.forEach((kw) => {
      const textWidth = this.doc.getTextWidth(kw);
      const tagWidth = textWidth + 8;

      if (currentX + tagWidth > this.marginLeft + this.contentWidth) {
        currentX = this.marginLeft;
        this.currentY += tagHeight + 3;
        this.ensureSpace(tagHeight + 3);
      }

      this.doc.setFillColor(...COLORS.creamBg);
      this.doc.setDrawColor(...COLORS.cardBorder);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(currentX, this.currentY, tagWidth, tagHeight, 2, 2, "FD");

      this.doc.setTextColor(...COLORS.primaryBrown);
      this.doc.text(kw, currentX + 4, this.currentY + 4.5);

      currentX += tagWidth + 3;
    });

    this.currentY += tagHeight + 8;
  }

  drawProjectsSection(projects: PortfolioReport["projectAnalysis"]) {
    if (!projects || projects.length === 0) return;

    this.drawSectionHeading("Technical Project Deep Dive");

    projects.forEach((p, idx) => {
      this.ensureSpace(40);

      // Container for project
      const startY = this.currentY;
      
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(10.5);
      this.doc.setTextColor(...COLORS.primaryDark);
      this.doc.text(`${idx + 1}. ${p.projectName || "Technical Portfolio Project"}`, this.marginLeft + 4, this.currentY + 6);
      this.currentY += 10;

      // Tech Stack
      if (p.technologies && p.technologies.length > 0) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...COLORS.accentTan);
        this.doc.text("TECHNOLOGIES:", this.marginLeft + 4, this.currentY + 2);
        
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...COLORS.textDark);
        const techStr = p.technologies.join("  •  ");
        const splitTech = this.doc.splitTextToSize(techStr, this.contentWidth - 36);
        this.doc.text(splitTech, this.marginLeft + 34, this.currentY + 2);
        this.currentY += splitTech.length * 4.2 + 4;
      }

      // Strengths
      if (p.strengths && p.strengths.length > 0) {
        this.drawBulletList("Project Highlights & Positive Evidence:", p.strengths, "success");
      }

      // Deficiencies / Problems
      if (p.problems && p.problems.length > 0) {
        this.drawBulletList("Identified Deficiencies & Presentation Gaps:", p.problems, "warning");
      }

      // Missing Information
      if (p.missingInformation && p.missingInformation.length > 0) {
        this.drawBulletList("Missing Recruiter / Technical Context:", p.missingInformation, "neutral");
      }

      // Recommendations
      if (p.recommendations && p.recommendations.length > 0) {
        this.drawBulletList("Actionable Coaching Recommendations:", p.recommendations, "info");
      }

      // Improved Description
      if (p.improvedDescription && p.improvedDescription !== "Not enough information to verify this") {
        this.ensureSpace(24);
        const descLines = this.doc.splitTextToSize(`"${p.improvedDescription}"`, this.contentWidth - 16);
        const descBoxHeight = descLines.length * 4 + 10;

        this.doc.setFillColor(...COLORS.creamBg);
        this.doc.setDrawColor(...COLORS.cardBorder);
        this.doc.setLineWidth(0.3);
        this.doc.roundedRect(this.marginLeft + 4, this.currentY, this.contentWidth - 8, descBoxHeight, 2, 2, "FD");

        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...COLORS.accentTan);
        this.doc.text("OPTIMIZED PROJECT DESCRIPTION (FACTUAL RETENTION):", this.marginLeft + 8, this.currentY + 5);

        this.doc.setFont("helvetica", "italic");
        this.doc.setFontSize(8);
        this.doc.setTextColor(...COLORS.textDark);
        this.doc.text(descLines, this.marginLeft + 8, this.currentY + 10);

        this.currentY += descBoxHeight + 6;
      }

      // Bottom separator
      this.doc.setDrawColor(...COLORS.cardBorder);
      this.doc.setLineWidth(0.4);
      this.doc.line(this.marginLeft, this.currentY, this.marginLeft + this.contentWidth, this.currentY);
      this.currentY += 8;
    });
  }

  drawSevenDayPlan(plan: PortfolioReport["sevenDayPlan"], actionPlan: string[]) {
    this.drawSectionHeading("Strategic Improvement Action Plan");

    if (actionPlan && actionPlan.length > 0) {
      this.drawBulletList("Primary Executive Action Items:", actionPlan, "info");
      this.currentY += 4;
    }

    if (plan && plan.length > 0) {
      this.ensureSpace(20);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(10);
      this.doc.setTextColor(...COLORS.primaryDark);
      this.doc.text("7-Day Tactical Execution Roadmap:", this.marginLeft, this.currentY + 4);
      this.currentY += 8;

      plan.forEach((dayItem) => {
        this.ensureSpace(22);

        this.doc.setFillColor(...COLORS.milkWhite);
        this.doc.setDrawColor(...COLORS.cardBorder);
        this.doc.setLineWidth(0.3);
        
        const taskLinesList = dayItem.tasks.map(t => this.doc.splitTextToSize(`• ${t}`, this.contentWidth - 14));
        const totalLines = taskLinesList.reduce((acc, cur) => acc + cur.length, 0);
        const dayBoxHeight = Math.max(18, 12 + totalLines * 4);

        this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, dayBoxHeight, 2, 2, "FD");

        // Day label badge
        this.doc.setFillColor(...COLORS.primaryBrown);
        this.doc.roundedRect(this.marginLeft + 4, this.currentY + 3, 20, 5.5, 1, 1, "F");

        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...COLORS.milkWhite);
        this.doc.text(dayItem.day, this.marginLeft + 6, this.currentY + 7);

        // Focus label
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(8.5);
        this.doc.setTextColor(...COLORS.primaryDark);
        this.doc.text(`Focus: ${dayItem.focus}`, this.marginLeft + 28, this.currentY + 7);

        // Tasks
        let taskY = this.currentY + 12;
        dayItem.tasks.forEach((task) => {
          const lines = this.doc.splitTextToSize(`•  ${task}`, this.contentWidth - 14);
          this.doc.setFont("helvetica", "normal");
          this.doc.setFontSize(8);
          this.doc.setTextColor(...COLORS.textMuted);
          this.doc.text(lines, this.marginLeft + 6, taskY);
          taskY += lines.length * 4;
        });

        this.currentY += dayBoxHeight + 4;
      });
    }
  }

  drawImprovedWordingSection(improvedWording: ResumeReport["improvedWording"]) {
    if (!improvedWording || improvedWording.length === 0) return;

    this.drawSectionHeading("High-Impact Phrasing Upgrades (ATS Polished)");

    improvedWording.forEach((item, idx) => {
      this.ensureSpace(36);

      const origLines = this.doc.splitTextToSize(`"${item.original}"`, (this.contentWidth - 16) / 2);
      const impLines = this.doc.splitTextToSize(`"${item.improved}"`, (this.contentWidth - 16) / 2);
      const maxTextLines = Math.max(origLines.length, impLines.length);

      const benefitLines = item.benefit ? this.doc.splitTextToSize(`Strategic Benefit: ${item.benefit}`, this.contentWidth - 16) : [];
      const boxHeight = 16 + maxTextLines * 4 + (benefitLines.length > 0 ? benefitLines.length * 4 + 4 : 0);

      this.doc.setFillColor(...COLORS.milkWhite);
      this.doc.setDrawColor(...COLORS.cardBorder);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(this.marginLeft, this.currentY, this.contentWidth, boxHeight, 2, 2, "FD");

      // Section tag
      this.doc.setFillColor(...COLORS.creamBg);
      this.doc.roundedRect(this.marginLeft + 4, this.currentY + 3, 30, 5, 1, 1, "F");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(...COLORS.primaryBrown);
      this.doc.text(`${item.section.toUpperCase()} SECTION`, this.marginLeft + 6, this.currentY + 6.5);

      const colWidth = (this.contentWidth - 16) / 2;
      const col1X = this.marginLeft + 6;
      const col2X = this.marginLeft + 10 + colWidth;

      // Col 1: Original
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.dangerRed);
      this.doc.text("ORIGINAL PHRASING:", col1X, this.currentY + 12);

      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.textMuted);
      this.doc.text(origLines, col1X, this.currentY + 16);

      // Col 2: Polished
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.successGreen);
      this.doc.text("POLISHED (QUANTIFIED & ACTION-ORIENTED):", col2X, this.currentY + 12);

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.textDark);
      this.doc.text(impLines, col2X, this.currentY + 16);

      // Benefit
      if (benefitLines.length > 0) {
        const benefitY = this.currentY + 18 + maxTextLines * 4;
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...COLORS.accentTan);
        this.doc.text(benefitLines, col1X, benefitY);
      }

      this.currentY += boxHeight + 4;
    });
  }

  finalizeAndDownload(filename: string): Blob | void {
    // Add page numbers to all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      this.doc.setPage(p);

      // Bottom footer line
      this.doc.setDrawColor(...COLORS.cardBorder);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.marginLeft, this.pageHeight - 12, this.marginLeft + this.contentWidth, this.pageHeight - 12);

      // Footer branding
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...COLORS.textMuted);
      this.doc.text("CareerLens.AI • Confidential & Proprietary Talent Evaluation", this.marginLeft, this.pageHeight - 7);

      // Page numbers (Page X of Y)
      const pageStr = `Page ${p} of ${totalPages}`;
      const pageStrWidth = this.doc.getTextWidth(pageStr);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...COLORS.accentTan);
      this.doc.text(pageStr, this.marginLeft + this.contentWidth - pageStrWidth, this.pageHeight - 7);
    }

    // Generate real PDF blob with MIME type application/pdf
    const pdfBlob = this.doc.output("blob");

    if (typeof document === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      return pdfBlob;
    }

    // Download via Object URL
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return pdfBlob;
  }
}

/**
 * Generates and downloads the real Portfolio Review PDF
 */
export function exportPortfolioPDF(
  report: PortfolioReport,
  targetRole: string,
  sourceUrl?: string
) {
  const builder = new PDFBuilder();

  const roleClean = targetRole || "General Tech";
  const filename = `CareerLens_Portfolio_Review_${sanitizeFilename(roleClean)}.pdf`;

  // 1. Header
  builder.drawReportHeader(
    "PORTFOLIO REVIEW REPORT",
    "Comprehensive Technical, Recruiter & UI/UX Diagnostic Audit",
    [
      { label: "Target Role", value: roleClean },
      { label: "Source / URL", value: sourceUrl || "Submitted Portfolio Profile" },
      { label: "Audit Date", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
    ]
  );

  // 2. Overall Score & Summary
  builder.drawScoreOverview(
    report.overallScore,
    "Portfolio Overall Score",
    "Role Alignment & Executive Diagnostic Summary",
    report.roleAlignmentDetails || "Overall profile and projects evaluated against modern technical hiring benchmarks and portfolio criteria."
  );

  // 3. Category Breakdown
  builder.drawSectionHeading("Evaluation Criteria & Category Diagnostics");
  const categories = [
    { name: "UI/UX Assessment", score: report.categories?.uiUx?.score ?? 80, reason: report.categories?.uiUx?.reason ?? "Evaluated against modern UI/UX design standards." },
    { name: "Recruiter Readiness", score: report.categories?.recruiterReadiness?.score ?? 80, reason: report.categories?.recruiterReadiness?.reason ?? "Evaluated against recruiter screening best practices." },
    { name: "Role Alignment", score: report.categories?.roleAlignment?.score ?? 80, reason: report.categories?.roleAlignment?.reason ?? "Evaluated against target role competencies." },
    { name: "Technical Skills Quality", score: report.categories?.technicalQuality?.score ?? 80, reason: report.categories?.technicalQuality?.reason ?? "Evaluated against technical execution standards." },
    { name: "Projects Assessment", score: report.categories?.projects?.score ?? 80, reason: report.categories?.projects?.reason ?? "Evaluated project complexity and demonstration." },
    { name: "Accessibility Standard", score: report.categories?.accessibility?.score ?? 80, reason: report.categories?.accessibility?.reason ?? "Evaluated against web accessibility guidelines." },
    { name: "First Impression", score: report.categories?.firstImpression?.score ?? 80, reason: report.categories?.firstImpression?.reason ?? "Evaluated landing impact and clarity." },
    { name: "Content Quality", score: report.categories?.contentQuality?.score ?? 80, reason: report.categories?.contentQuality?.reason ?? "Evaluated depth, clarity, and tone." },
    { name: "Search & SEO Visibility", score: report.categories?.seo?.score ?? 80, reason: report.categories?.seo?.reason ?? "Evaluated discovery and technical metadata." },
  ];
  builder.drawCategoryGrid(categories);

  // 4. Strengths, Weaknesses, Quick Wins
  builder.drawSectionHeading("High-Level Diagnostic Findings");
  builder.drawBulletList("Verified Strengths & Positive Highlights:", report.strengths, "success");
  builder.drawBulletList("Critical Deficiencies & Areas of Concern:", report.importantIssues, "warning");
  builder.drawBulletList("Rapid High-ROI Quick Wins:", report.quickWins, "info");

  // 5. Technical Projects Deep Dive
  builder.drawProjectsSection(report.projectAnalysis);

  // 6. Action Plan & 7-Day Plan
  builder.drawSevenDayPlan(report.sevenDayPlan, report.actionPlan);

  // Download real PDF
  builder.finalizeAndDownload(filename);
}

/**
 * Generates and downloads the real Resume Review PDF
 */
export function exportResumePDF(
  report: ResumeReport,
  targetRole: string,
  sourceFilename?: string
) {
  const builder = new PDFBuilder();

  const roleClean = targetRole || "General Tech";
  const filename = `CareerLens_Resume_Review_${sanitizeFilename(roleClean)}.pdf`;

  // 1. Header
  builder.drawReportHeader(
    "RESUME REVIEW REPORT",
    "Applicant Tracking System (ATS) & Recruiter Screening Audit",
    [
      { label: "Target Role", value: roleClean },
      { label: "Resume Source", value: sourceFilename || "Uploaded Candidate Resume" },
      { label: "Audit Date", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
    ]
  );

  // 2. Overall ATS Score & Summary
  builder.drawScoreOverview(
    report.overallScore,
    "ATS Benchmark Score",
    "Applicant Tracking System (ATS) Alignment Summary",
    "Audited against top tier enterprise ATS screening parsers, hard/soft skill keyword density, quantitative accomplishment formatting, and recruitment screening thresholds."
  );

  // 3. Category Breakdown (Skills, Experience, Projects, ATS Compatibility, etc.)
  builder.drawSectionHeading("Core ATS & Recruiter Screening Dimensions");
  const categories = [
    { name: "Skills Analysis & Matching", score: report.categories?.skills?.score ?? 80, reason: report.categories?.skills?.reason ?? "Evaluated against required skill taxonomy." },
    { name: "Work Experience Impact", score: report.categories?.experience?.score ?? 80, reason: report.categories?.experience?.reason ?? "Evaluated accomplishment quantification and progression." },
    { name: "Projects Analysis & Scope", score: report.categories?.projects?.score ?? 80, reason: report.categories?.projects?.reason ?? "Evaluated technical depth and problem-solving scope." },
    { name: "ATS Parser Compatibility", score: report.categories?.atsCompatibility?.score ?? 80, reason: report.categories?.atsCompatibility?.reason ?? "Evaluated formatting, headers, and machine readability." },
    { name: "Role Alignment Score", score: report.categories?.roleAlignment?.score ?? 80, reason: report.categories?.roleAlignment?.reason ?? "Evaluated fit with target role benchmarks." },
    { name: "Readability & Scan Index", score: report.categories?.readability?.score ?? 80, reason: report.categories?.readability?.reason ?? "Evaluated visual hierarchy and recruiter 6-second scanability." },
    { name: "Content Quality & Depth", score: report.categories?.contentQuality?.score ?? 80, reason: report.categories?.contentQuality?.reason ?? "Evaluated professional tone, clarity, and active verbs." },
    { name: "Structure, Fonts & Layout", score: report.categories?.structure?.score ?? 80, reason: report.categories?.structure?.reason ?? "Evaluated section ordering, typography, and clean spacing." },
    { name: "Education & Certifications", score: report.categories?.education?.score ?? 80, reason: report.categories?.education?.reason ?? "Evaluated credentials, dates, and domain relevance." },
  ];
  builder.drawCategoryGrid(categories);

  // 4. Strengths, Deficiencies, Missing Skills, Quick Wins
  builder.drawSectionHeading("Screening Observations & Skill Gaps");
  builder.drawBulletList("Resume Strengths & Competitive Edges:", report.strengths, "success");
  builder.drawBulletList("Critical Deficiencies & Formatting Issues:", report.importantIssues, "warning");
  builder.drawBulletList("Missing Skills & Critical Context Gaps:", report.missingInformation, "warning");
  builder.drawBulletList("High-Impact Quick Wins:", report.quickWins, "info");

  // 5. Keywords Analysis
  builder.drawSectionHeading("Target Role Keyword Density & Search Terms");
  builder.drawKeywordsGrid("Recommended ATS-Boosting Context Keywords to Integrate:", report.keywordSuggestions);

  // 6. Improved Wording Recommendations
  builder.drawImprovedWordingSection(report.improvedWording);

  // 7. Strategic Action Plan / Executive Roadmap
  builder.drawSectionHeading("Strategic Action Plan & Execution Roadmap");
  builder.drawBulletList("Recommended Next Steps to Elevate Interview Callbacks:", report.actionPlan, "info");

  // Download real PDF
  builder.finalizeAndDownload(filename);
}

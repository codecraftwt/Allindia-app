/**
 * Resume Template HTML Generators
 * 
 * 4 distinct resume layout templates, each generating complete HTML for PDF export.
 * All templates support dynamic theme colors and all resume sections.
 */

export interface ResumeTemplateData {
  name: string;
  email: string;
  phone: string;
  city?: string;
  linkedin?: string;
  github?: string;
  targetJob: string;
  summary: string;
  careerObjective?: string;
  certifications?: string;
  languages?: string;
  achievements?: string;
  hobbies?: string;
  projects?: string;
  educationList: {
    degree: string;
    school: string;
    year?: string;
    gpa?: string;
  }[];
  experienceList: {
    designation: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    isFresher?: boolean;
    description?: string;
    bullets?: string[];
  }[];
  skills: string[];
}

export interface TemplateThemeColors {
  accent: string;
  textAccent: string;
  bg: string;
  accentLine: string;
}

export interface ResumeTemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: string; // short label
}

export const RESUME_TEMPLATES: ResumeTemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional single-column layout with clean dividers and elegant typography',
    icon: 'document-text-outline',
    preview: 'Classic',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Two-column design with colored sidebar for contact & skills',
    icon: 'grid-outline',
    preview: 'Modern',
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Full-width accent header with modern typography and icon sections',
    icon: 'color-palette-outline',
    preview: 'Creative',
  },
  {
    id: 'executive',
    name: 'Executive Compact',
    description: 'Dense single-page layout optimized for experienced professionals',
    icon: 'briefcase-outline',
    preview: 'Executive',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Escape HTML
// ─────────────────────────────────────────────────────────────────────────────
function esc(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionExists(val?: string | string[]): boolean {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  return val.trim().length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1: CLASSIC PROFESSIONAL
// ─────────────────────────────────────────────────────────────────────────────
export function generateClassicProfessionalHtml(
  data: ResumeTemplateData,
  theme: TemplateThemeColors,
): string {
  const contactParts: string[] = [];
  if (data.phone) contactParts.push(`📞 ${esc(data.phone)}`);
  if (data.email) contactParts.push(`✉️ ${esc(data.email)}`);
  if (data.city) contactParts.push(`📍 ${esc(data.city)}`);
  if (data.linkedin) contactParts.push(`🔗 ${esc(data.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}`);
  if (data.github) contactParts.push(`💻 ${esc(data.github.replace(/^https?:\/\/(www\.)?/, ''))}`);

  const experienceHtml = data.experienceList.map((exp, idx) => {
    const bullets = (exp.bullets && exp.bullets.length > 0)
      ? `<ul style="margin:4px 0 0 0;padding-left:18px;">${exp.bullets.map(b => `<li style="font-size:13px;color:#334155;line-height:1.7;margin-bottom:4px;">${esc(b)}</li>`).join('')}</ul>`
      : (exp.description ? `<p style="font-size:13px;color:#334155;line-height:1.7;margin:4px 0 0 0;">${esc(exp.description)}</p>` : '');

    const dateStr = exp.isFresher ? '' : (exp.startDate && exp.startDate !== 'N/A'
      ? `${esc(exp.startDate)} – ${exp.isCurrent ? 'Present' : esc(exp.endDate || '')}`
      : '');

    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:14px;color:#1e293b;">${esc(exp.designation)}${exp.company ? ` | ${esc(exp.company)}` : ''}${exp.location ? ` – ${esc(exp.location)}` : ''}</span>
          ${dateStr ? `<span style="font-size:12px;color:#64748b;white-space:nowrap;">${dateStr}</span>` : ''}
        </div>
        ${bullets}
      </div>`;
  }).join('');

  const educationHtml = data.educationList.map(edu => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;">
        <div>
          <span style="font-weight:700;font-size:14px;color:#1e293b;">${esc(edu.degree)}</span>
          ${edu.school ? `<span style="font-size:13px;color:#64748b;"> – ${esc(edu.school)}</span>` : ''}
        </div>
        <div style="text-align:right;">
          ${edu.year ? `<span style="font-size:12px;color:#64748b;">Class of ${esc(edu.year)}</span>` : ''}
          ${edu.gpa ? `<div style="font-size:12px;color:#64748b;">GPA: ${esc(edu.gpa)}</div>` : ''}
        </div>
      </div>
    </div>`).join('');

  const skillsHtml = data.skills.length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">${data.skills.map(s => `<span style="background:${theme.accent}12;color:${theme.textAccent};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid ${theme.accent}25;">${esc(s)}</span>`).join('')}</div>`
    : '';

  const optionalSection = (title: string, content?: string) => {
    if (!sectionExists(content)) return '';
    return `
      <div class="divider"></div>
      <h3 class="section-title">${title}</h3>
      <p class="body-text">${esc(content)}</p>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Resume – ${esc(data.name)}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:#f1f5f9; color:#334155; padding: 20px 0; }
    .resume { width:794px; min-height:1123px; background:#fff; margin:0 auto; padding:36px 40px; border-top:10px solid ${theme.accentLine}; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .header { text-align:center; margin-bottom:20px; }
    .name { font-size:28px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; }
    .job-title { font-size:15px; font-weight:600; color:${theme.textAccent}; margin-top:4px; text-transform:uppercase; letter-spacing:1px; }
    .contact-row { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; margin-top:10px; font-size:13px; color:#64748b; }
    .divider { height:1px; background:#e2e8f0; margin:16px 0; }
    .section-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:${theme.textAccent}; margin-bottom:10px; }
    .body-text { font-size:13.5px; line-height:1.7; color:#334155; }
    @media print { body { padding:0; background:#fff; } .resume { width:100%; min-height:auto; box-shadow:none; border-top:none; padding:20px 30px; } }
  </style>
</head>
<body>
  <div class="resume">
    <div class="header">
      <div class="name">${esc(data.name)}</div>
      ${data.targetJob ? `<div class="job-title">${esc(data.targetJob)}</div>` : ''}
      <div class="contact-row">${contactParts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
    
    <div class="divider"></div>
    
    ${sectionExists(data.summary) ? `
    <h3 class="section-title">Professional Summary</h3>
    <p class="body-text">${esc(data.summary)}</p>
    <div class="divider"></div>` : ''}
    
    ${data.experienceList.length > 0 ? `
    <h3 class="section-title">Work Experience</h3>
    ${experienceHtml}
    <div class="divider"></div>` : ''}
    
    ${data.educationList.length > 0 ? `
    <h3 class="section-title">Education</h3>
    ${educationHtml}
    <div class="divider"></div>` : ''}
    
    ${data.skills.length > 0 ? `
    <h3 class="section-title">Skills</h3>
    ${skillsHtml}` : ''}
    
    ${optionalSection('Career Objective', data.careerObjective)}
    ${optionalSection('Projects', data.projects)}
    ${optionalSection('Certifications', data.certifications)}
    ${optionalSection('Languages', data.languages)}
    ${optionalSection('Achievements', data.achievements)}
    ${optionalSection('Hobbies & Interests', data.hobbies)}
  </div>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2: MODERN MINIMAL (TWO-COLUMN SIDEBAR)
// ─────────────────────────────────────────────────────────────────────────────
export function generateModernMinimalHtml(
  data: ResumeTemplateData,
  theme: TemplateThemeColors,
): string {
  const sidebarItems: string[] = [];
  if (data.phone) sidebarItems.push(`<div class="sb-item">📞 ${esc(data.phone)}</div>`);
  if (data.email) sidebarItems.push(`<div class="sb-item">✉️ ${esc(data.email)}</div>`);
  if (data.city) sidebarItems.push(`<div class="sb-item">📍 ${esc(data.city)}</div>`);
  if (data.linkedin) sidebarItems.push(`<div class="sb-item">🔗 ${esc(data.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</div>`);
  if (data.github) sidebarItems.push(`<div class="sb-item">💻 ${esc(data.github.replace(/^https?:\/\/(www\.)?/, ''))}</div>`);

  const skillsHtml = data.skills.map(s => `<div class="skill-tag">${esc(s)}</div>`).join('');

  const experienceHtml = data.experienceList.map(exp => {
    const bullets = (exp.bullets && exp.bullets.length > 0)
      ? `<ul class="exp-bullets">${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
      : (exp.description ? `<p class="exp-desc">${esc(exp.description)}</p>` : '');

    const dateStr = exp.isFresher ? '' : (exp.startDate && exp.startDate !== 'N/A'
      ? `${esc(exp.startDate)} – ${exp.isCurrent ? 'Present' : esc(exp.endDate || '')}`
      : '');

    return `
      <div class="exp-block">
        <div class="exp-header">
          <strong>${esc(exp.designation)}${exp.company ? ` | ${esc(exp.company)}` : ''}</strong>
          ${dateStr ? `<span class="exp-date">${dateStr}</span>` : ''}
        </div>
        ${bullets}
      </div>`;
  }).join('');

  const educationHtml = data.educationList.map(edu => `
    <div class="edu-block">
      <strong>${esc(edu.degree)}</strong>
      ${edu.school ? `<div class="edu-school">${esc(edu.school)}</div>` : ''}
      ${edu.year ? `<div class="edu-year">Class of ${esc(edu.year)}</div>` : ''}
    </div>`).join('');

  const mainSection = (title: string, content?: string) => {
    if (!sectionExists(content)) return '';
    return `<div class="main-section"><h3>${title}</h3><p>${esc(content)}</p></div>`;
  };

  // Sidebar optional sections
  const sidebarSection = (title: string, content?: string) => {
    if (!sectionExists(content)) return '';
    return `<div class="sb-section"><h4>${title}</h4><div class="sb-content">${esc(content)}</div></div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Resume – ${esc(data.name)}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f1f5f9; color:#334155; padding: 20px 0; }
    .resume { display:flex; width:794px; min-height:1123px; background:#fff; margin:0 auto; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .sidebar { width:240px; background:${theme.accent}; color:#fff; padding:30px 20px; }
    .sidebar .name { font-size:22px; font-weight:800; margin-bottom:4px; color:#fff; }
    .sidebar .job-title { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; opacity:0.85; margin-bottom:20px; }
    .sb-section { margin-bottom:20px; }
    .sb-section h4 { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; opacity:0.7; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:4px; }
    .sb-item { font-size:12px; margin-bottom:6px; word-break:break-all; line-height:1.5; }
    .sb-content { font-size:12px; line-height:1.6; opacity:0.9; }
    .skill-tag { display:inline-block; background:rgba(255,255,255,0.15); padding:3px 10px; border-radius:12px; font-size:11px; margin:2px 4px 2px 0; font-weight:600; }
    .main { flex:1; padding:30px 28px; }
    .main-section { margin-bottom:20px; }
    .main-section h3 { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:${theme.textAccent}; margin-bottom:10px; border-bottom:2px solid ${theme.accent}; padding-bottom:4px; display:inline-block; }
    .main-section p { font-size:13.5px; line-height:1.7; color:#334155; }
    .exp-block { margin-bottom:14px; }
    .exp-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
    .exp-header strong { font-size:14px; color:#1e293b; }
    .exp-date { font-size:12px; color:#64748b; white-space:nowrap; }
    .exp-bullets { padding-left:18px; margin-top:4px; }
    .exp-bullets li { font-size:13px; color:#334155; line-height:1.7; margin-bottom:3px; }
    .exp-desc { font-size:13px; color:#334155; line-height:1.7; margin-top:4px; }
    .edu-block { margin-bottom:10px; }
    .edu-block strong { font-size:14px; color:#1e293b; }
    .edu-school { font-size:12px; color:#64748b; margin-top:2px; }
    .edu-year { font-size:11px; color:#94a3b8; }
    @media print { body { padding:0; background:#fff; } .resume { width:100%; min-height:auto; box-shadow:none; } .sidebar { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
  <div class="resume">
    <div class="sidebar">
      <div class="name">${esc(data.name)}</div>
      ${data.targetJob ? `<div class="job-title">${esc(data.targetJob)}</div>` : ''}
      
      <div class="sb-section">
        <h4>Contact</h4>
        ${sidebarItems.join('')}
      </div>
      
      ${data.skills.length > 0 ? `
      <div class="sb-section">
        <h4>Skills</h4>
        ${skillsHtml}
      </div>` : ''}
      
      ${sidebarSection('Languages', data.languages)}
      ${sidebarSection('Hobbies', data.hobbies)}
    </div>
    
    <div class="main">
      ${sectionExists(data.summary) ? `
      <div class="main-section">
        <h3>Professional Summary</h3>
        <p>${esc(data.summary)}</p>
      </div>` : ''}
      
      ${data.experienceList.length > 0 ? `
      <div class="main-section">
        <h3>Experience</h3>
        ${experienceHtml}
      </div>` : ''}
      
      ${data.educationList.length > 0 ? `
      <div class="main-section">
        <h3>Education</h3>
        ${educationHtml}
      </div>` : ''}
      
      ${mainSection('Career Objective', data.careerObjective)}
      ${mainSection('Projects', data.projects)}
      ${mainSection('Certifications', data.certifications)}
      ${mainSection('Achievements', data.achievements)}
    </div>
  </div>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3: CREATIVE BOLD
// ─────────────────────────────────────────────────────────────────────────────
export function generateCreativeBoldHtml(
  data: ResumeTemplateData,
  theme: TemplateThemeColors,
): string {
  const contactParts: string[] = [];
  if (data.phone) contactParts.push(esc(data.phone));
  if (data.email) contactParts.push(esc(data.email));
  if (data.city) contactParts.push(esc(data.city));
  if (data.linkedin) contactParts.push(esc(data.linkedin.replace(/^https?:\/\/(www\.)?/, '')));
  if (data.github) contactParts.push(esc(data.github.replace(/^https?:\/\/(www\.)?/, '')));

  const experienceHtml = data.experienceList.map(exp => {
    const bullets = (exp.bullets && exp.bullets.length > 0)
      ? `<ul class="bullets">${exp.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
      : (exp.description ? `<p class="desc">${esc(exp.description)}</p>` : '');

    const dateStr = exp.isFresher ? '' : (exp.startDate && exp.startDate !== 'N/A'
      ? `${esc(exp.startDate)} – ${exp.isCurrent ? 'Present' : esc(exp.endDate || '')}`
      : '');

    return `
      <div class="item">
        <div class="item-head">
          <div>
            <div class="item-title">${esc(exp.designation)}</div>
            ${exp.company ? `<div class="item-sub">${esc(exp.company)}${exp.location ? ` · ${esc(exp.location)}` : ''}</div>` : ''}
          </div>
          ${dateStr ? `<div class="item-date">${dateStr}</div>` : ''}
        </div>
        ${bullets}
      </div>`;
  }).join('');

  const educationHtml = data.educationList.map(edu => `
    <div class="item">
      <div class="item-head">
        <div>
          <div class="item-title">${esc(edu.degree)}</div>
          ${edu.school ? `<div class="item-sub">${esc(edu.school)}</div>` : ''}
        </div>
        ${edu.year ? `<div class="item-date">Class of ${esc(edu.year)}</div>` : ''}
      </div>
    </div>`).join('');

  const skillsHtml = data.skills.map(s =>
    `<span class="skill">${esc(s)}</span>`
  ).join('');

  const section = (icon: string, title: string, content?: string) => {
    if (!sectionExists(content)) return '';
    return `
      <div class="section">
        <div class="section-header"><span class="section-icon">${icon}</span><h3>${title}</h3></div>
        <p class="text">${esc(content)}</p>
      </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Resume – ${esc(data.name)}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f1f5f9; padding: 20px 0; }
    .resume-wrapper { width:794px; min-height:1123px; background:#fff; margin:0 auto; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden; }
    .hero { background:linear-gradient(135deg, ${theme.accent}, ${theme.textAccent}); color:#fff; padding:36px 40px 28px; position:relative; }
    .hero::after { content:''; position:absolute; bottom:0; left:0; right:0; height:6px; background:rgba(255,255,255,0.3); }
    .hero .name { font-size:30px; font-weight:900; letter-spacing:-0.5px; }
    .hero .title { font-size:14px; text-transform:uppercase; letter-spacing:2px; opacity:0.85; margin-top:4px; }
    .hero .contact { display:flex; flex-wrap:wrap; gap:16px; margin-top:14px; font-size:12px; opacity:0.9; }
    .body { padding:24px 40px 36px; }
    .section { margin-bottom:22px; }
    .section-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; border-bottom:2px solid ${theme.accent}20; padding-bottom:6px; }
    .section-header h3 { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${theme.textAccent}; }
    .section-icon { font-size:16px; }
    .text { font-size:13.5px; line-height:1.7; color:#334155; }
    .item { margin-bottom:14px; }
    .item-head { display:flex; justify-content:space-between; align-items:flex-start; }
    .item-title { font-size:14px; font-weight:700; color:#1e293b; }
    .item-sub { font-size:12px; color:#64748b; margin-top:2px; }
    .item-date { font-size:12px; color:#64748b; white-space:nowrap; }
    .bullets { padding-left:18px; margin-top:6px; }
    .bullets li { font-size:13px; color:#334155; line-height:1.7; margin-bottom:3px; }
    .desc { font-size:13px; color:#334155; line-height:1.7; margin-top:4px; }
    .skills-wrap { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
    .skill { display:inline-block; background:${theme.accent}12; color:${theme.textAccent}; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid ${theme.accent}30; }
    @media print { body { padding:0; background:#fff; } .resume-wrapper { width:100%; min-height:auto; box-shadow:none; } .hero { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
  <div class="resume-wrapper">
    <div class="hero">
    <div class="name">${esc(data.name)}</div>
    ${data.targetJob ? `<div class="title">${esc(data.targetJob)}</div>` : ''}
    <div class="contact">${contactParts.map(c => `<span>${c}</span>`).join(' · ')}</div>
  </div>
  
  <div class="body">
    ${sectionExists(data.summary) ? `
    <div class="section">
      <div class="section-header"><span class="section-icon">📋</span><h3>Summary</h3></div>
      <p class="text">${esc(data.summary)}</p>
    </div>` : ''}
    
    ${data.experienceList.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-icon">💼</span><h3>Experience</h3></div>
      ${experienceHtml}
    </div>` : ''}
    
    ${data.educationList.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-icon">🎓</span><h3>Education</h3></div>
      ${educationHtml}
    </div>` : ''}
    
    ${data.skills.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-icon">⚡</span><h3>Skills</h3></div>
      <div class="skills-wrap">${skillsHtml}</div>
    </div>` : ''}
    
    ${section('🎯', 'Career Objective', data.careerObjective)}
    ${section('💻', 'Projects', data.projects)}
    ${section('🏆', 'Certifications', data.certifications)}
    ${section('🗣️', 'Languages', data.languages)}
    ${section('🌟', 'Achievements', data.achievements)}
    ${section('🎨', 'Hobbies & Interests', data.hobbies)}
  </div>
  </div>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4: EXECUTIVE COMPACT
// ─────────────────────────────────────────────────────────────────────────────
export function generateExecutiveCompactHtml(
  data: ResumeTemplateData,
  theme: TemplateThemeColors,
): string {
  const contactParts: string[] = [];
  if (data.phone) contactParts.push(esc(data.phone));
  if (data.email) contactParts.push(esc(data.email));
  if (data.city) contactParts.push(esc(data.city));
  if (data.linkedin) contactParts.push(esc(data.linkedin.replace(/^https?:\/\/(www\.)?/, '')));
  if (data.github) contactParts.push(esc(data.github.replace(/^https?:\/\/(www\.)?/, '')));

  const experienceHtml = data.experienceList.map(exp => {
    const bullets = (exp.bullets && exp.bullets.length > 0)
      ? exp.bullets.map(b => `<span class="compact-bullet">• ${esc(b)}</span>`).join(' ')
      : (exp.description ? esc(exp.description) : '');

    const dateStr = exp.isFresher ? '' : (exp.startDate && exp.startDate !== 'N/A'
      ? `${esc(exp.startDate)} – ${exp.isCurrent ? 'Present' : esc(exp.endDate || '')}`
      : '');

    return `
      <tr>
        <td class="col-left"><strong>${esc(exp.designation)}</strong>${exp.company ? `, ${esc(exp.company)}` : ''}</td>
        <td class="col-right">${dateStr}</td>
      </tr>
      ${bullets ? `<tr><td colspan="2" class="detail-cell">${bullets}</td></tr>` : ''}`;
  }).join('');

  const educationHtml = data.educationList.map(edu => `
    <tr>
      <td class="col-left"><strong>${esc(edu.degree)}</strong>${edu.school ? ` – ${esc(edu.school)}` : ''}</td>
      <td class="col-right">${edu.year ? `${esc(edu.year)}` : ''}${edu.gpa ? ` | GPA: ${esc(edu.gpa)}` : ''}</td>
    </tr>`).join('');

  const skillsLine = data.skills.join(' · ');

  const compactSection = (title: string, content?: string) => {
    if (!sectionExists(content)) return '';
    return `
      <div class="sec">
        <div class="sec-title">${title}</div>
        <div class="sec-body">${esc(content)}</div>
      </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Resume – ${esc(data.name)}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f1f5f9; color:#1e293b; font-size:12px; line-height:1.5; padding: 20px 0; }
    .resume { width:794px; min-height:1123px; background:#fff; margin:0 auto; padding:20px 28px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .top-bar { border-bottom:3px solid ${theme.accent}; padding-bottom:10px; margin-bottom:12px; }
    .top-bar .name { font-size:24px; font-weight:900; color:#0f172a; display:inline; }
    .top-bar .pipe { color:${theme.accent}; margin:0 10px; font-size:20px; }
    .top-bar .title { font-size:14px; font-weight:600; color:${theme.textAccent}; display:inline; }
    .contact-line { font-size:11px; color:#64748b; margin-top:4px; }
    .contact-line span { margin-right:12px; }
    .sec { margin-bottom:10px; }
    .sec-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:${theme.textAccent}; border-bottom:1.5px solid ${theme.accent}30; padding-bottom:3px; margin-bottom:6px; }
    .sec-body { font-size:12px; line-height:1.6; color:#334155; }
    table { width:100%; border-collapse:collapse; }
    .col-left { font-size:12px; padding:3px 0; vertical-align:top; }
    .col-right { font-size:11px; color:#64748b; text-align:right; padding:3px 0; white-space:nowrap; vertical-align:top; }
    .detail-cell { font-size:11.5px; color:#475569; padding:0 0 6px 16px; line-height:1.6; }
    .compact-bullet { display:inline; }
    .skills-line { font-size:12px; color:#334155; }
    .two-col { display:flex; gap:20px; }
    .two-col > div { flex:1; }
    @media print { body { padding:0; background:#fff; } .resume { width:100%; min-height:auto; box-shadow:none; padding:16px 24px; } }
  </style>
</head>
<body>
  <div class="resume">
    <div class="top-bar">
      <span class="name">${esc(data.name)}</span>
      ${data.targetJob ? `<span class="pipe">|</span><span class="title">${esc(data.targetJob)}</span>` : ''}
      <div class="contact-line">${contactParts.map(c => `<span>${c}</span>`).join('')}</div>
    </div>
    
    ${sectionExists(data.summary) ? `
    <div class="sec">
      <div class="sec-title">Summary</div>
      <div class="sec-body">${esc(data.summary)}</div>
    </div>` : ''}
    
    ${data.experienceList.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Experience</div>
      <table>${experienceHtml}</table>
    </div>` : ''}
    
    ${data.educationList.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Education</div>
      <table>${educationHtml}</table>
    </div>` : ''}
    
    ${data.skills.length > 0 ? `
    <div class="sec">
      <div class="sec-title">Skills</div>
      <div class="skills-line">${esc(skillsLine)}</div>
    </div>` : ''}
    
    <div class="two-col">
      <div>
        ${compactSection('Career Objective', data.careerObjective)}
        ${compactSection('Projects', data.projects)}
        ${compactSection('Certifications', data.certifications)}
      </div>
      <div>
        ${compactSection('Languages', data.languages)}
        ${compactSection('Achievements', data.achievements)}
        ${compactSection('Hobbies', data.hobbies)}
      </div>
    </div>
  </div>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// MASTER GENERATOR: Pick template by ID
// ─────────────────────────────────────────────────────────────────────────────
export function generateResumeHtml(
  templateId: string,
  data: ResumeTemplateData,
  theme: TemplateThemeColors,
): string {
  switch (templateId) {
    case 'classic':
      return generateClassicProfessionalHtml(data, theme);
    case 'modern':
      return generateModernMinimalHtml(data, theme);
    case 'creative':
      return generateCreativeBoldHtml(data, theme);
    case 'executive':
      return generateExecutiveCompactHtml(data, theme);
    default:
      return generateClassicProfessionalHtml(data, theme);
  }
}

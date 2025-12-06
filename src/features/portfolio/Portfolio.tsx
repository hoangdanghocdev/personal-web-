import React from 'react';
import { 
  Briefcase, 
  BookOpen, 
  Star, 
  MapPin, 
  Phone,
  Mail,
  Award,
  Cpu,
  CheckCircle2,
  Calendar,
  Globe
} from 'lucide-react';

const Portfolio: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans text-slate-700 animate-fade-in">
      
      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
         
         <div className="relative z-10 text-center md:text-left">
             <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">HOANG NANG NGUYEN</h1>
             <p className="text-blue-200 text-lg md:text-xl font-medium tracking-wide mb-6">AUDIT & ASSURANCE ASSISTANT</p>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Calendar size={14}/> October 23rd, 2005</span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Phone size={14}/> (+84) 823328299</span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Mail size={14}/> nanghoang.work@gmail.com</span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><MapPin size={14}/> Ho Tung Mau Street, Tu Liem Precinct, Hanoi, Vietnam</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (30%) - INFO CARDS */}
          <div className="md:col-span-4 space-y-6">
              
              {/* OBJECTIVES */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                      <Star className="text-brand-600" size={20}/> OBJECTIVES
                  </h3>
                  <div className="space-y-4 text-sm">
                      <div>
                          <span className="block font-bold text-slate-800 mb-1">Short Objectives</span>
                          <p className="text-slate-600 leading-relaxed text-justify">Working as an official audit assistant at Deloitte for 2 years; Thriving in a dynamic, professional setting while contributing to diverse and inclusive workplace cultures; Achieving honors and awards for yearly best Deloitte's performers.</p>
                      </div>
                      <div>
                          <span className="block font-bold text-slate-800 mb-1">Long Objectives</span>
                          <p className="text-slate-600 leading-relaxed text-justify">Graduate with High-Distinction Bachelor's Degree in Accounting and Auditing; Qualify ACCA F5-F9 in 2 years.</p>
                      </div>
                  </div>
              </div>

              {/* SKILLS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                      <Cpu className="text-brand-600" size={20}/> SKILLS
                  </h3>
                  <div className="space-y-3 text-sm">
                      <div>
                          <span className="font-bold text-slate-800">English:</span> <span className="text-slate-600">Advanced level.</span>
                      </div>
                      <div>
                          <span className="font-bold text-slate-800">Computer tools:</span> <span className="text-slate-600">Microsoft Word, Microsoft Excel, Microsoft PowerPoint.</span>
                      </div>
                      <div>
                          <span className="font-bold text-slate-800">Design tools:</span> <span className="text-slate-600">Adobe Photoshop.</span>
                      </div>
                  </div>
              </div>

               {/* CERTIFICATIONS */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                      <Award className="text-brand-600" size={20}/> CERTIFICATIONS
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> EY & Microsoft - AI Skills Passports (2025)</li>
                      <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> SIBYC Recognition (2024)</li>
                      <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0"/> TEDx FTU Hanoi Recognition (2024)</li>
                  </ul>
              </div>

              {/* HONORS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                      <Award className="text-yellow-500" size={20}/> HONORS & AWARDS
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                      <li className="border-l-2 border-yellow-400 pl-3">
                          <strong className="block text-slate-800">HSGS, Outstanding Academic Achievement</strong>
                          <span className="text-xs text-slate-500">2020-2023</span>
                      </li>
                      <li className="border-l-2 border-yellow-400 pl-3">
                          <strong className="block text-slate-800">FTU Football Championship season 5</strong>
                          <span className="text-xs text-slate-500">Runners up</span>
                      </li>
                  </ul>
              </div>

          </div>

          {/* RIGHT COLUMN (70%) - MAIN CONTENT */}
          <div className="md:col-span-8 space-y-6">
              
              {/* WORK EXPERIENCE (FIXED TIMELINE) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-200 pb-2">
                      <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><Briefcase size={24}/></div>
                      WORK EXPERIENCE
                  </h2>

                  <div className="border-l-2 border-blue-100 ml-3 space-y-12">
                      
                      {/* Job 1: Ha An Trading */}
                      <div className="relative pl-8">
                          {/* Timeline Dot */}
                          <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-brand-600 shadow-sm"></span>
                          
                          {/* Header Job */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Ha An Trading Service Company Limited</h3>
                                  <p className="text-brand-600 font-medium text-sm mt-1">Part-time Operating Assistant</p>
                              </div>
                              <span className="mt-2 sm:mt-0 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100 whitespace-nowrap">
                                  2023/10 - Current
                              </span>
                          </div>

                          {/* Content Job */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-3 text-justify leading-relaxed shadow-sm hover:shadow-md transition-shadow">
                              <p>Supported business operations by performing inventory management tasks, including counting, classifying, and packing goods for shipment; prioritized orders based on deadlines and tracked progress to ensure timely delivery to customers.</p>
                              <p>Supported the information system by troubleshooting and resolving basic computer issues.</p>
                              
                              {/* Skills Tag */}
                              <div className="pt-2 mt-2 border-t border-slate-200">
                                  <p className="text-xs">
                                      <strong className="text-slate-800">Skills gained:</strong> Prepare proper working papers, Time management, Negotiate with clients, Problem-solving, Punctuality, Responsibility, Organization, and Plan.
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Job 2: SIBYC */}
                      <div className="relative pl-8">
                          {/* Timeline Dot */}
                          <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-brand-600 shadow-sm"></span>
                          
                          {/* Header Job */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Social Impact Business Youth Community (SIBYC)</h3>
                                  <p className="text-brand-600 font-medium text-sm mt-1">Head of External Affairs Department</p>
                              </div>
                              <span className="mt-2 sm:mt-0 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-100 whitespace-nowrap">
                                  2024/01 - 2024/12
                              </span>
                          </div>

                          {/* Content Job */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-3 text-justify leading-relaxed shadow-sm hover:shadow-md transition-shadow">
                              <p>Developed and proposed comprehensive plans and organizational strategies for community events with detailed cost analysis, while managing personnel allocation and team task progress to ensure successful execution and timely objective achievement.</p>
                              <p>Oversaw webinar speaker arrangements by compiling speaker lists, contacting speakers, and providing necessary support to ensure effective and engaging sessions.</p>
                              
                              {/* Skills Tag */}
                              <div className="pt-2 mt-2 border-t border-slate-200">
                                  <p className="text-xs">
                                      <strong className="text-slate-800">Skills gained:</strong> Team management, Organization, Planning, Interpersonal skills, Logical thinking, Problem-solving, and Email writing.
                                  </p>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>

              {/* EDUCATION */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><BookOpen size={24}/></div>
                      EDUCATION
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-slate-800">Foreign Trade University</h3>
                          <p className="text-xs text-brand-600 font-bold mb-2">2023/10 - Current</p>
                          <p className="text-sm text-slate-700 mb-1"><strong>Major:</strong> Accounting & Auditing</p>
                          <p className="text-sm text-slate-600">GPA: 3.59/4.0. <br/>Principles of Accounting: 4.0/4.0; Principles of Auditing: 4.0/4.0.</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                          <h3 className="font-bold text-slate-800">HUS High School for Gifted Students (HSGS)</h3>
                          <p className="text-xs text-brand-600 font-bold mb-2">2020/09 - 2023/05</p>
                          <p className="text-sm text-slate-700 mb-1"><strong>Major:</strong> Informatics</p>
                          <p className="text-sm text-slate-600">Learned programming language C, and design tools Adobe Photoshop.</p>
                      </div>
                  </div>
              </div>

              {/* ACTIVITIES */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><Globe size={24}/></div>
                      ACTIVITIES
                  </h2>
                  <div className="border-l-4 border-brand-200 pl-4 ml-2">
                      <div className="md:flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-800">TEDxFTU Hanoi</h3>
                          <span className="text-xs font-bold text-slate-500">2024/09 - 2024/12</span>
                      </div>
                      <p className="text-brand-600 font-medium text-sm mb-2">Member of Communication Department</p>
                      <p className="text-slate-600 text-sm leading-relaxed text-justify mb-3">
                          Assisted communication activities for events, including contacting press units and entertainment news outlets, engaging with communication ambassadors, and monitoring promotional results. Supported event organization by researching potential speakers, engaging with potential sponsors, and providing on-site assistance during events.
                      </p>
                      <p className="text-sm text-slate-500 italic">
                          <strong>Skills gained:</strong> Problem-solving, Teamwork, Punctuality, Responsibility, Interpersonal skills, Logical thinking, Organization, Planning.
                      </p>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Portfolio;
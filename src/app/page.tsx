"use client";

import { useState, useEffect, useRef } from "react";
import WaitlistForm from "@/components/WaitlistForm";
import { Sparkles, Calendar, BookOpen, AlertCircle, ArrowRight, Award, Shield, CheckCircle2, BarChart2, Check, HelpCircle, ChevronDown, Clock, Globe, Compass, Landmark, Brain, Calculator } from "lucide-react";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Cross-browser compatibility fallback for older browsers
    if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
      const allAnim = document.querySelectorAll(
        ".scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-up"
      );
      allAnim.forEach((el) => el.classList.add("in-view"));
      setIsInView(true);
      return;
    }

    // 1. Observer for showcase card
    const showcaseObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting); // Reversible!
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      showcaseObserver.observe(sectionRef.current);
    }

    // 2. Observer for general scroll entrance animations
    const animatedElements = document.querySelectorAll(
      ".scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-up"
    );
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view"); // Reversible scroll animation!
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    animatedElements.forEach((el) => scrollObserver.observe(el));

    return () => {
      showcaseObserver.disconnect();
      scrollObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Header Banner & Navigation */}
      <header className="header">
        <div className="nav-pill-container">
          <a href="#" className="logo">
            <img 
              src="/images/logo-icon.png" 
              alt="KyoPrep logo" 
              width="28" 
              height="28" 
              style={{ display: "block", borderRadius: "8px" }} 
            />
            <span className="logo-text" style={{ fontFamily: "var(--font-outfit)" }}>Kyo<span>Prep</span></span>
          </a>

          {/* Center Links */}
          <nav className="nav-links">
            <a href="#test-series" className="nav-link-item">Features</a>
            <a href="#test-series" className="nav-link-item">Test Series</a>
            <a href="#faq-section" className="nav-link-item">GK Portal</a>
            <a href="#faq-section" className="nav-link-item">FAQ</a>
          </nav>

          {/* Action Area */}
          <div className="nav-action-area">
            <div className="nav-divider"></div>
            <a href="#waitlist-section" className="btn nav-btn-lavender">Join Waitlist</a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-content">
              <h1 className="hero-title scroll-animate-left" style={{ fontFamily: "var(--font-lora)" }}>
                <span className="word-wrapper">
                  {"Tripura's Premier Online Prep Platform".split(" ").map((word, idx) => (
                    <span
                      key={idx}
                      className="word-animate"
                      style={{ animationDelay: `${0.06 * idx}s` }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
                <br />
                <span className="word-wrapper">
                  {"for".split(" ").map((word, idx) => (
                    <span
                      key={idx}
                      className="word-animate"
                      style={{ animationDelay: `${0.06 * (5 + idx)}s` }}
                    >
                      {word}
                    </span>
                  ))}
                  <span 
                    className="text-gradient"
                    style={{ animationDelay: "0.42s" }}
                  >
                    TPSC, JRBT & State Exams
                  </span>
                </span>
              </h1>
              <p className="hero-subtitle scroll-animate-left stagger-1">
                High-quality mock tests, chapter-wise practice series, and solved previous year papers mapped strictly to official Tripura recruitment syllabi.
              </p>
              <div className="hero-actions scroll-animate-left stagger-2">
                <a href="#waitlist-section" className="btn btn-primary">Join the Waitlist</a>
                <a href="#test-series" className="btn btn-tertiary">Explore Test Series</a>
              </div>
            </div>
            
            <div className="hero-visual scroll-animate-right stagger-3">
              <img 
                src="/images/student_desk_doodle.webp" 
                alt="Student studying on laptop at desk" 
                className="doodle-image"
                style={{ width: "100%", height: "auto", maxWidth: "450px", display: "block", margin: "0 auto" }}
              />
            </div>
          </div>
        </section>

        {/* Unified Showcase & Marquee Section */}
        <section ref={sectionRef} className={`showcase-marquee-wrapper ${isInView ? "in-view" : ""}`}>
          <div className="container">
            <div className="unified-card">
              
              {/* Part 1: Dark App Showcase Section */}
              <div className="app-showcase-dark">
                <div className="showcase-grid">
                  
                  {/* Left Column: Copy */}
                  <div className="showcase-content">
                    <div className="platform-pills">
                      <span className="platform-pill">Bilingual Mock Tests</span>
                      <span className="platform-pill">Chapter-wise Practice</span>
                      <span className="platform-pill">PYQ Archives</span>
                      <span className="platform-pill">Performance Analytics</span>
                    </div>
                    
                    <h2 className="showcase-title">
                      Master your syllabus, learn smarter, <br />
                      <span className="highlight-text">with state-aligned mocks</span>
                    </h2>
                    
                    <p className="showcase-subtitle">
                      State-aligned simulated exams, instant scorecard analysis, and detailed chapter-wise explanations mapped strictly to official Tripura recruitment patterns.
                    </p>
                    
                    <div className="showcase-actions">
                      <a href="#waitlist-section" className="btn btn-showcase-primary">
                        Join the Waitlist
                      </a>
                      <a href="#test-series" className="btn btn-showcase-secondary">
                        Explore Syllabus
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Phone Mockup & Wavy Badges */}
                  <div className="showcase-visual-container">
                    
                    {/* Wavy floating subject badges */}
                    <div className="showcase-badges-container">
                      <div className="floating-badge badge-gk">
                        <Globe className="badge-icon" size={18} />
                        <span>Tripura GK</span>
                      </div>

                      <div className="floating-badge badge-history hide-mobile">
                        <Landmark className="badge-icon" size={18} />
                        <span>History</span>
                      </div>

                      <div className="floating-badge badge-math">
                        <Calculator className="badge-icon" size={18} />
                        <span>Quants</span>
                      </div>

                      <div className="floating-badge badge-english">
                        <BookOpen className="badge-icon" size={18} />
                        <span>English</span>
                      </div>

                      <div className="floating-badge badge-polity hide-mobile">
                        <Shield className="badge-icon" size={18} />
                        <span>Polity</span>
                      </div>

                      <div className="floating-badge badge-geography hide-mobile">
                        <Compass className="badge-icon" size={18} />
                        <span>Geography</span>
                      </div>

                      <div className="floating-badge badge-reasoning">
                        <Brain className="badge-icon" size={18} />
                        <span>Reasoning</span>
                      </div>

                      <div className="floating-badge badge-current hide-mobile">
                        <Sparkles className="badge-icon" size={18} />
                        <span>Current Affairs</span>
                      </div>
                    </div>

                    {/* Phone Mockup */}
                    <div className="phone-mockup">
                      <div className="phone-speaker">
                        <span className="phone-camera-lens"></span>
                      </div>
                      <div className="phone-screen">
                        
                        {/* Mockup Header */}
                        <div className="phone-header">
                          <span className="phone-live-dot"></span>
                          <span className="phone-title">KyoPrep Quiz Engine</span>
                          <div className="phone-timer">
                            <Clock size={11} />
                            <span>45s</span>
                          </div>
                        </div>

                        {/* Mockup Body (Quiz Question) */}
                        <div className="phone-quiz-body">
                          <div className="quiz-category">TRIPURA GK • Q12</div>
                          <h4 className="quiz-question">Which landmark of Tripura is also known as the Lake Palace?</h4>
                          
                          <div className="quiz-options">
                            <div className="quiz-option correct">
                              <span>A. Neermahal</span>
                              <div className="option-check">✓</div>
                            </div>
                            <div className="quiz-option">
                              <span>B. Ujjayanta Palace</span>
                            </div>
                            <div className="quiz-option">
                              <span>C. Chabimura</span>
                            </div>
                            <div className="quiz-option">
                              <span>D. Unakoti</span>
                            </div>
                          </div>
                        </div>

                        {/* Mockup Footer */}
                        <div className="phone-footer">
                          <div className="quiz-status-row">
                            <span>Score: 850 pts</span>
                            <span>9/10 Correct</span>
                          </div>
                          <div className="phone-progress-bar">
                            <div className="phone-progress" style={{ width: "90%" }}></div>
                          </div>
                        </div>

                      </div>
                    </div>
                    
                  </div>
                  
                </div>
              </div>

              {/* Part 2: Green Marquee Section */}
              <div className="marquee-banner-section">

                
                <div className="marquee-banner-content">
                  <p className="marquee-banner-title">
                    Preparing aspirants for major Tripura state examinations
                  </p>
                  
                  <div className="exam-marquee-wrapper">
                    <div className="exam-marquee-content">
                      <span className="marquee-item">TPSC Combined Competitive</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">JRBT Group C (LDC)</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">JRBT Group D (MTS)</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">TRBT T-TET Paper I & II</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Police Constable</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Police SI</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Forest Guard & Forester</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">TSR (Tripura State Rifles)</span>
                      <span className="marquee-separator">•</span>
                      
                      {/* Duplicate for infinite loop */}
                      <span className="marquee-item">TPSC Combined Competitive</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">JRBT Group C (LDC)</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">JRBT Group D (MTS)</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">TRBT T-TET Paper I & II</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Police Constable</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Police SI</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">Tripura Forest Guard & Forester</span>
                      <span className="marquee-separator">•</span>
                      <span className="marquee-item">TSR (Tripura State Rifles)</span>
                      <span className="marquee-separator">•</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Test Series & Syllabus Catalog */}
        <section className="test-series-section" id="test-series">
          <div className="container">
            <div className="section-header scroll-animate-up">
              <h2 className="section-title" style={{ fontFamily: "var(--font-lora)" }}>
                Comprehensive Test Series Catalog
              </h2>
              <p className="section-subtitle">
                Master your syllabus with our structured, multi-tier practice engines.
              </p>
            </div>

            <div className="test-catalog-grid">
              {/* TPSC */}
              <div className="catalog-card scroll-animate-left stagger-1">
                <div className="catalog-badge">TPSC EXAMS</div>
                <h3 className="catalog-title" style={{ fontFamily: "var(--font-lora)" }}>TPSC Recruitment</h3>
                <p className="catalog-desc">Full mock series, topic sectionals, and Tripura-specific GK mapped strictly to the Prelims exam format.</p>
                <div className="catalog-exam-tags">
                  <span className="exam-tag">TCS / TPS Combined</span>
                  <span className="exam-tag">Junior Engineer (JE)</span>
                  <span className="exam-tag">Panchayat Executive Officer</span>
                  <span className="exam-tag">CDPO & Food SI</span>
                </div>
                <div className="catalog-meta">Mock Tests • PYQ Archives • Chapter Tests</div>
              </div>

              {/* JRBT */}
              <div className="catalog-card scroll-animate-right stagger-1">
                <div className="catalog-badge">JRBT EXAMS</div>
                <h3 className="catalog-title" style={{ fontFamily: "var(--font-lora)" }}>JRBT Group C & D</h3>
                <p className="catalog-desc">Specialized practice packages for Group C & D clerk, agriculture assistant, and multi-tasking posts.</p>
                <div className="catalog-exam-tags">
                  <span className="exam-tag">Lower Division Clerk (LDC)</span>
                  <span className="exam-tag">Agriculture Assistant</span>
                  <span className="exam-tag">Junior Operator</span>
                  <span className="exam-tag">MTS Group D Posts</span>
                </div>
                <div className="catalog-meta">Topic Wise Series • Full Length Papers</div>
              </div>

              {/* TRBT */}
              <div className="catalog-card scroll-animate-left stagger-2">
                <div className="catalog-badge">TRBT TEACHING</div>
                <h3 className="catalog-title" style={{ fontFamily: "var(--font-lora)" }}>TRBT Teachers Exam</h3>
                <p className="catalog-desc">Child Development, pedagogy, environmental studies, and language papers with detailed explanation keys.</p>
                <div className="catalog-exam-tags">
                  <span className="exam-tag">T-TET Paper I (I-V)</span>
                  <span className="exam-tag">T-TET Paper II (VI-VIII)</span>
                  <span className="exam-tag">Graduate Teacher (STGT)</span>
                  <span className="exam-tag">Post Graduate (STPGT)</span>
                </div>
                <div className="catalog-meta">Syllabus-Aligned Sectionals • PYQ Packs</div>
              </div>

              {/* POLICE & FOREST */}
              <div className="catalog-card scroll-animate-right stagger-2">
                <div className="catalog-badge">DEFENCE & FOREST</div>
                <h3 className="catalog-title" style={{ fontFamily: "var(--font-lora)" }}>Police, TSR & Forest Guard</h3>
                <p className="catalog-desc">Syllabus-specific papers for state police, state rifles, and forest guard, including mock qualifying language papers.</p>
                <div className="catalog-exam-tags">
                  <span className="exam-tag">Police Constable</span>
                  <span className="exam-tag">Sub-Inspector (SI)</span>
                  <span className="exam-tag">Tripura Forest Guard</span>
                  <span className="exam-tag">Forester & TSR Rifleman</span>
                </div>
                <div className="catalog-meta">Mock Practice • Subject Tests</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Study Flow / "How KyoPrep Works" Section (NEW VALUE PROPOSITION) */}
        <section className="how-it-works-section">
          <div className="container">
            <div className="section-header scroll-animate-up">
              <span className="pre-title">STUDY METHODOLOGY</span>
              <h2 className="section-title" style={{ fontFamily: "var(--font-lora)" }}>
                Your Structured Path to Success
              </h2>
              <p className="section-subtitle">
                How KyoPrep guides you step-by-step from initial syllabus review to clearing the cut-off.
              </p>
            </div>

            <div className="how-it-works-grid">
              {/* Step 1 */}
              <div className="step-card scroll-animate-left stagger-1">
                <div className="step-number-badge">1</div>
                <div className="step-icon-wrapper">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <h3 className="step-title" style={{ fontFamily: "var(--font-lora)" }}>Diagnose Your Level</h3>
                <p className="step-description">
                  Take a syllabus diagnostic mock test. Get an immediate analysis of your baseline score compared to historical cut-offs.
                </p>
              </div>

              {/* Step 2 */}
              <div className="step-card scroll-animate-up stagger-2">
                <div className="step-number-badge">2</div>
                <div className="step-icon-wrapper">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h3 className="step-title" style={{ fontFamily: "var(--font-lora)" }}>Practice Chapter-Wise</h3>
                <p className="step-description">
                  Target your weak areas with targeted chapter-wise quizzes. Read detailed explanations compiled by local educators.
                </p>
              </div>

              {/* Step 3 */}
              <div className="step-card scroll-animate-right stagger-3">
                <div className="step-number-badge">3</div>
                <div className="step-icon-wrapper">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="step-title" style={{ fontFamily: "var(--font-lora)" }}>Track Prep Velocity</h3>
                <p className="step-description">
                  Watch your daily practice metrics, accuracy curves, and syllabus coverage progress to know exactly when you're ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Value Propositions Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header scroll-animate-up">
              <h2 className="section-title" style={{ fontFamily: "var(--font-lora)" }}>
                Prep Features Built to Help You Clear
              </h2>
              <p className="section-subtitle">
                Advanced learning modules designed to help you prepare effectively for every recruitment drive.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card scroll-animate-left stagger-1">
                <div className="feature-icon-wrapper">
                  <BookOpen className="feature-icon" />
                </div>
                <h3 className="feature-title" style={{ fontFamily: "var(--font-lora)" }}>Tripura-Specific Mock Exams</h3>
                <p className="feature-text">
                  Practice with mock tests built specifically for TPSC, JRBT, and Tripura state exams, mapped strictly to official syllabi and patterns.
                </p>
              </div>

              <div className="feature-card scroll-animate-up stagger-2">
                <div className="feature-icon-wrapper">
                  <BarChart2 className="feature-icon" />
                </div>
                <h3 className="feature-title" style={{ fontFamily: "var(--font-lora)" }}>Smart Performance Tracker</h3>
                <p className="feature-text">
                  Identify weak areas down to chapters and sections. Get targeted study recommendations to boost your accuracy and speed.
                </p>
              </div>

              <div className="feature-card scroll-animate-right stagger-3">
                <div className="feature-icon-wrapper">
                  <Calendar className="feature-icon" />
                </div>
                <h3 className="feature-title" style={{ fontFamily: "var(--font-lora)" }}>Exam Notifications Tracker</h3>
                <p className="feature-text">
                  Stay updated with vacancy notifications, admit card release schedules, and application dates sourced directly from official websites.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Accordion FAQ Section (NEW) */}
        <section className="faq-section">
          <div className="container">
            <div className="section-header scroll-animate-up">
              <span className="pre-title">COMMON QUESTIONS</span>
              <h2 className="section-title" style={{ fontFamily: "var(--font-lora)" }}>
                Frequently Asked Questions
              </h2>
              <p className="section-subtitle">
                Got questions about our platform? We've got answers.
              </p>
            </div>

            <div className="faq-grid">
              <div className="faq-item scroll-animate-left stagger-1">
                <h3 className="faq-question" style={{ fontFamily: "var(--font-lora)" }}>
                  Is KyoPrep affiliated with the Government of Tripura?
                </h3>
                <p className="faq-answer">
                  No, KyoPrep is an independent educational platform built by educators. We are not affiliated with, endorsed by, or connected to TPSC, JRBT, TRBT, or any government body.
                </p>
              </div>

              <div className="faq-item scroll-animate-right stagger-2">
                <h3 className="faq-question" style={{ fontFamily: "var(--font-lora)" }}>
                  What makes KyoPrep different from other national test prep apps?
                </h3>
                <p className="faq-answer">
                  Unlike generic national platforms, KyoPrep is built from the ground up specifically for Tripura state-level recruitment exams. Every test, syllabus breakdown, and explanation is tailored to the exact requirements of TPSC, JRBT, TRBT, and local state boards.
                </p>
              </div>

              <div className="faq-item scroll-animate-left stagger-3">
                <h3 className="faq-question" style={{ fontFamily: "var(--font-lora)" }}>
                  Which exams will be available at launch?
                </h3>
                <p className="faq-answer">
                  We will prioritize JRBT Group C/D and TPSC Combined Competitive exams at launch. Forest Guard and T-TET mock exams will follow in the subsequent rollout phases.
                </p>
              </div>

              <div className="faq-item scroll-animate-right stagger-4">
                <h3 className="faq-question" style={{ fontFamily: "var(--font-lora)" }}>
                  How do I get notified when the platform launches?
                </h3>
                <p className="faq-answer">
                  Simply enter your name and email in the waitlist form below. We will send you updates and a direct invite link as soon as KyoPrep goes live.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Call To Action Section */}
        <section className="waitlist-section" id="waitlist-section">
          <div className="container waitlist-grid">
            <div className="waitlist-info-panel scroll-animate-left">
              <img 
                src="/images/student_floor_doodle.webp" 
                alt="Student studying with laptop on the floor" 
                className="doodle-image"
                style={{ width: "100%", height: "auto", maxWidth: "320px", display: "block", margin: "0 auto 24px auto" }}
              />
              <h2 style={{ fontFamily: "var(--font-lora)", fontSize: "2rem", marginBottom: "12px" }}>Join the KyoPrep Waitlist</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Be part of Tripura's dedicated prep platform. Get notified the exact moment we go live, secure your waitlist spot, and receive notifications for TPSC, JRBT, and state recruitment schedules.
              </p>
            </div>
            <div className="waitlist-form-panel scroll-animate-right stagger-2">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content-grid">
          {/* 1. Link Columns */}
          <div className="footer-columns">
            <div className="footer-column scroll-animate-left stagger-1">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact Us</a>
              <a href="#">Support</a>
            </div>
            <div className="footer-column scroll-animate-up stagger-2">
              <h4>Product</h4>
              <a href="#test-series">Test Series</a>
              <a href="#test-series">Practice Quizzes</a>
              <a href="#test-series">PYQ Archives</a>
              <a href="#waitlist-section">Waitlist</a>
            </div>
            <div className="footer-column scroll-animate-right stagger-3">
              <h4>Resources</h4>
              <a href="#">GK Portal</a>
              <a href="#">Exam Notifications</a>
              <a href="#">Syllabus Guide</a>
              <a href="#">Help Center</a>
            </div>
          </div>

          {/* 2. Massive Logo / Brand Name */}
          <div className="footer-brand-huge scroll-animate-up">
            <img src="/images/logo-icon.png" alt="KyoPrep logo" className="footer-huge-logo" />
            <span className="footer-huge-text" style={{ fontFamily: "var(--font-outfit)" }}>
              Kyo<span>Prep</span>
            </span>
          </div>

          {/* 3. Bottom Row */}
          <div className="footer-bottom-row">
            <div className="footer-bottom-left">
              <span>&copy; {new Date().getFullYear()} KyoPrep. All rights reserved.</span>
              <span className="footer-divider">•</span>
              <a href="#">Terms of Service</a>
              <span className="footer-divider">•</span>
              <a href="#">Privacy Policy</a>
              <span className="footer-divider">•</span>
              <a href="#">Refund Policy</a>
            </div>
            <div className="footer-social-links">
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </a>
            </div>
          </div>

          {/* Disclaimer at bottom */}
          <div className="footer-disclaimer">
            <p>
              Disclaimer: KyoPrep is an independent educational platform and is not affiliated with, authorized, or endorsed by the Government of Tripura, TPSC, JRBT, or TRBT.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

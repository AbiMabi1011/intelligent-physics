import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import teacherPic from '../assets/teacher.png';
import applomicLogo from '../assets/applomic.png';
import Footer from '../components/Footer';

// Dynamic Icon renderer to support both emojis and Lucide icons
const DynamicIcon = ({ name, className = "", size = 22 }) => {
    if (!name) return <Lucide.Sparkles className={className} size={size} />;
    const IconComponent = Lucide[name];
    if (IconComponent) {
        return <IconComponent className={className} size={size} />;
    }
    return <span className={className} style={{ fontSize: `${size}px`, lineHeight: 1 }}>{name}</span>;
};

// Reusable Scroll Reveal component using Intersection Observer
const ScrollReveal = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={ref}
            className={`transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// Hero Slogan Word Rotator
const SloganRotator = () => {
    const slogans = ["A/L PHYSICS", "CONCEPTUAL UNDERSTANDING", "ELITE RANKINGS", "INTUITIVE GRAPHICS"];
    const [idx, setIdx] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIdx(prev => (prev + 1) % slogans.length);
                setFade(true);
            }, 300);
        }, 3200);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className={`inline-block transition-all duration-300 transform ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'} text-[#C25E00]`}>
            {slogans[idx]}
        </span>
    );
};

/* ─── Static Data (All 11 Units & Full Previous Content) ─── */
const SYLLABUS_UNITS = [
  { topic: 'Measurement', icon: 'Ruler', desc: 'Physical quantities, SI units, scalars & vectors, errors and uncertainties.', subtopics: ['SI Units & Base Quantities', 'Dimensional Analysis', 'Errors & Uncertainties', 'Measuring Instruments', 'Vector Addition & Resolution'] },
  { topic: 'Mechanics', icon: 'Settings', desc: "Kinematics, Newton's Laws, momentum, work, energy, power and circular motion.", subtopics: ['Linear Kinematics & Projectiles', "Newton's Laws of Motion", 'Momentum & Impulse', 'Work, Energy & Power', 'Circular Motion & Rotational Dynamics'] },
  { topic: 'Oscillation & Waves', icon: 'Activity', desc: 'SHM, wave properties, sound, light, diffraction and interference.', subtopics: ['Simple Harmonic Motion', 'Transverse & Longitudinal Waves', 'Superposition & Interference', 'Sound Waves & Doppler Effect', 'Wave Optics & Polarization'] },
  { topic: 'Thermal Physics', icon: 'Thermometer', desc: 'Heat transfer, ideal gas laws, internal energy and first law of thermodynamics.', subtopics: ['Warmth & Temperature Scales', 'Thermal Expansion & Conduction', 'Kinetic Theory of Gases', 'First Law of Thermodynamics', 'Heat Engines & Efficiency'] },
  { topic: 'Gravitational Field', icon: 'Globe', desc: "Newton's law of gravitation, gravitational potential and satellite motion.", subtopics: ["Newton's Law of Gravitation", 'Gravitational Field Strength (g)', 'Gravitational Potential', 'Satellite Motion & Escape Velocity'] },
  { topic: 'Electric Field', icon: 'Zap', desc: "Coulomb's law, electric potential, capacitance and energy in electric fields.", subtopics: ["Coulomb's Law", 'Electric Field Intensity', 'Electric Potential & Equipotentials', 'Capacitors in Series & Parallel', 'Energy Stored in Capacitors'] },
  { topic: 'Magnetic Field', icon: 'Magnet', desc: 'Magnetic flux density, force on conductors, electromagnetic induction.', subtopics: ['Magnetic Field of Currents', 'Force on Charge in Magnetic Fields', 'Electromagnetic Induction & Lenz\'s Law', 'Self & Mutual Inductance', 'Transformers & Generator Principle'] },
  { topic: 'Current Electricity', icon: 'Cpu', desc: "Ohm's law, resistance, EMF, Kirchhoff's laws and AC circuits.", subtopics: ["Ohm's Law & Resistivity", "Kirchhoff's Laws", 'Potentiometer & Wheatstone Bridge', 'Internal Resistance & Maximum Power', 'Alternating Current (AC) Circuits'] },
  { topic: 'Electronics', icon: 'Tv', desc: 'Semiconductors, logic gates and op-amps.', subtopics: ['Intrinsic & Extrinsic Semiconductors', 'PN Junction Diodes & Rectification', 'Bipolar Junction Transistors', 'Operational Amplifiers (Op-Amps)', 'Digital Logic Gates'] },
  { topic: 'Mechanical Properties', icon: 'Box', desc: "Stress, strain, Young's modulus, elasticity and fluid pressure.", subtopics: ['Stress, Strain & Hooke\'s Law', 'Young\'s Modulus', 'Elastic Potential Energy', 'Fluid Pressure & Archimedes\' Principle', 'Viscosity & Surface Tension'] },
  { topic: 'Matter & Radiation', icon: 'Radio', desc: 'Photoelectric effect, atomic structure, nuclear reactions and radioactive decay.', subtopics: ['Photoelectric Effect', 'X-Rays & Line Spectra', 'Wave-Particle Duality', 'Radioactivity & Half-life', 'Nuclear Fission & Fusion'] },
];

const LMS_FEATURES = [
  { icon: 'BookOpen', title: 'Solved Past Paper Bank', desc: 'Full archive of G.C.E. A/L past papers categorized by unit, accompanied by grading schemes and examiner notes.' },
  { icon: 'Award', title: 'Adaptive Physics Quizzes', desc: 'Evaluations that gauge your understanding of complex topics and help identify specific knowledge gaps.' },
  { icon: 'Video', title: 'Full HD Class Recordings', desc: 'Every lecture is archived in 1080p high definition, with timestamped sections for easy revision.' },
  { icon: 'Activity', title: 'Live Result Analytics', desc: 'Grades, performance metrics, and comparison stats are delivered instantly to your profile after assessments.' },
  { icon: 'Bell', title: 'Real-Time Batch Notices', desc: 'Instant desktop notices for new lecture notes, timetable updates, and upcoming exam dates.' },
  { icon: 'Trophy', title: 'Leaderboards & Rankings', desc: 'Compete constructively with peer batches, earn rank points, and track your weekly status.' },
];

const STATS_DATA = [
  { value: '1,200+', label: 'ACTIVE STUDENTS' },
  { value: '500+', label: 'SOLVED PAPERS' },
  { value: '300+', label: 'LECTURE VIDEOS' },
  { value: '94%', label: 'PASS RATE (A/B)' },
];

const BATCHES = [
  {
    name: 'A/L 2026 Theory',
    status: 'Enrolling Now',
    seatsLeft: '14 seats remaining',
    schedule: 'Thursdays · 4:00 PM - 7:00 PM',
    description: 'Perfect for students starting their A/Ls. Covers syllabus units from basic measurements to current electricity.',
    features: ['100% Comprehensive coverage', 'Weekly adaptive assessments', 'Hardcopy study packs mailed', 'Personalized tutor support'],
  },
  {
    name: 'A/L 2025 Revision',
    status: 'Fast Filling',
    seatsLeft: '8 seats remaining',
    schedule: 'Sundays · 8:30 AM - 1:30 PM',
    description: 'High-intensity session focused on solving complex problems, past papers, and structural question strategies.',
    features: ['Full syllabus summarization', '500+ Past paper analysis', 'Full syllabus mock exams', 'Speed development strategies'],
  },
  {
    name: 'A/L 2025 Theory',
    status: 'Completed / Archive Access',
    seatsLeft: 'Video Access Only',
    schedule: 'Tuesdays · 4:00 PM - 7:00 PM',
    description: 'All core modules are archived. Available for students who want to self-pace through the entire curriculum.',
    features: ['All recorded lectures archive', 'Full past paper repository', 'Online chapter quizzes', 'Instant auto-grading'],
  }
];

const TESTIMONIALS = [
  { 
    quote: 'Intelligent Physics completely transformed my approach to mechanics and field theory. The adaptive quizzes and recorded sessions helped me secure my A/L island rank!', 
    name: 'Sanduni Perera', 
    result: 'Island Rank 12 — G.C.E. A/L Physics' 
  },
  { 
    quote: 'The structured coverages of thermal physics and oscillation are top-tier. I went from a C to a solid A in my school term tests!', 
    name: 'Amal Rodrigo', 
    result: 'District Rank 3 — Gampaha' 
  },
  { 
    quote: 'Best digital platform for Sri Lankan A/L students. The live results database and prompt video uploads make self-studying incredibly easy.', 
    name: 'Fathima Ruzna', 
    result: 'A/L 2025 Theory Batch' 
  }
];

const FAQS = [
  { q: 'Who is Intelligent Physics designed for?', a: 'Sri Lankan A-Level Physics students following the national Sinhala or English medium syllabus, from first-year theory batches to exam-year crash revision classes.' },
  { q: 'How do I join a batch and access the Learning Hub?', a: 'Click the "Learning Hub" button, sign up for a student profile, select your target exam batch, and await instant credentials once your student enrollment is validated.' },
  { q: 'Can I watch classes if I miss the live sessions?', a: 'Yes. All live lessons are recorded in 1080p HD and uploaded to the platform within 6 hours, complete with navigation timeline tags so you can jump to specific concepts.' },
  { q: 'How does the adaptive quiz system help me learn?', a: 'Our system tracks your quiz responses. If you struggle with a specific sub-topic like Rotational Dynamics, the quiz prioritizes simple mechanical concepts first and scales up as your speed and accuracy improve.' },
  { q: 'How are results and answers processed?', a: 'Students submit answers via the Learning Hub. Assessment marks, correct answers, step-by-step explanations, and your rank in the batch are available immediately.' }
];

const FALLBACK_SLIDES = [
  { id: 's1', badge: 'PHYSICS ACADEMY', title: 'SRI LANKA PREMIER LMS PORTAL', subtitle: 'Covering the entire advanced level national curriculum in Sinhala and English mediums.', image_url: '' },
  { id: 's2', badge: 'ENROLLMENT OPEN', title: 'THEORY & REVISION BATCHES', subtitle: 'Live lectures, weekly assessments, and interactive grading reports are now active.', image_url: '' },
  { id: 's3', badge: 'FREE STUDY GUIDES', title: 'DOWNLOAD PAST PAPERS', subtitle: 'Archive repository containing structural essay papers and marking guides.', image_url: '' },
];

const IMG = url => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

export default function HomePage() {
  const navigate = useNavigate();

  /* ─── State Hooks ─── */
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [homeStats, setHomeStats] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-play slides timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Dynamic Content & Filter States
  const [teacher, setTeacher] = useState(null);
  const [syllabusList, setSyllabusList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedSyllabusIndex, setExpandedSyllabusIndex] = useState(null);
  const [syllabusSearch, setSyllabusSearch] = useState('');

  /* ─── Fetch Home Data ─── */
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/sliders`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/announcements`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-stats`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/teacher-profile`).then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_URL}/syllabus-units`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/lms-features`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-batches`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-testimonials`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-faqs`).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([sliders, ann, stats, teacherProf, syllabus, features, batches, testimonials, faqs]) => {
        const activeSliders = (sliders || []).filter(s => s.is_active !== false && s.is_active !== 0 && s.is_active !== '0').sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        setSlides(activeSliders.length > 0 ? activeSliders : FALLBACK_SLIDES);
        setAnnouncements(ann || []);
        setHomeStats((stats || []).filter(s => s.is_active !== false && s.is_active !== 0));

        setTeacher(teacherProf);
        setSyllabusList((syllabus || []).sort((a, b) => a.order_index - b.order_index));
        setFeaturesList((features || []).sort((a, b) => a.order_index - b.order_index));
        setBatchesList((batches || []).sort((a, b) => a.order_index - b.order_index));
        setTestimonialsList((testimonials || []).sort((a, b) => a.order_index - b.order_index));
        setFaqsList((faqs || []).sort((a, b) => a.order_index - b.order_index));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const showStats = homeStats.length > 0 ? homeStats.map(s => ({ value: s.value, label: s.label?.toUpperCase() })) : STATS_DATA;
  const showSyllabus = syllabusList.length > 0 ? syllabusList : SYLLABUS_UNITS;
  const showFeatures = featuresList.length > 0 ? featuresList : LMS_FEATURES;
  const showBatches = batchesList.length > 0 ? batchesList : BATCHES;
  const showTestimonials = testimonialsList.length > 0 ? testimonialsList : TESTIMONIALS;
  const showFaqs = faqsList.length > 0 ? faqsList : FAQS;

  const fallbackTeacher = {
    name: "Mr. R. Raakulan",
    title: "LEAD LECTURER",
    credentials: "B.Sc. Physics · University of Jaffna",
    bio_text: "Physics Teacher at New Science Hall (Tamil and English Medium classes). A dedicated tutor for Advanced Level Physics students with a proven record of helping 75% of students pass while sparking a genuine interest in learning.",
    mediums: "Tamil and English Medium classes"
  };
  const activeTeacher = teacher || fallbackTeacher;
  const teacherImgSrc = activeTeacher.image_url ? IMG(activeTeacher.image_url) : teacherPic;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const getSubtopics = (unit) => {
    if (unit.subtopics) return unit.subtopics;
    if (unit.subtopics_json) {
      try { return JSON.parse(unit.subtopics_json); } catch { return []; }
    }
    if (unit.features) return unit.features;
    if (unit.features_json) {
      try { return JSON.parse(unit.features_json); } catch { return []; }
    }
    return [];
  };

  /* ─── Syllabus Search filtering ─── */
  const filteredSyllabus = showSyllabus.filter(unit => {
    const q = syllabusSearch.toLowerCase();
    const subtopics = getSubtopics(unit);
    return (unit.topic || '').toLowerCase().includes(q) || subtopics.some(s => (s || '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-[#F8F9FA] text-[#0F172A] min-h-screen font-sans antialiased selection:bg-[#2563EB] selection:text-white">
      
      {/* ─── Top Navigation Bar (Sleek Dark Theme for High Logo Visibility) ─── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080E21]/95 backdrop-blur-md shadow-xl border-b border-slate-800/80 py-3.5' : 'bg-[#080E21] border-b border-slate-800 py-4.5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-[#0F172A] p-0.5 shadow-md shrink-0 group-hover:border-blue-500 transition-colors">
              <img src={logo} alt="IP" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none uppercase">INTELLIGENT PHYSICS</span>
              <span className="text-[9px] font-extrabold text-blue-400 tracking-widest uppercase mt-0.5">A/L PHYSICS ACADEMY</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <button onClick={() => scrollTo('announcements')} className="hover:text-white transition-colors cursor-pointer">ANNOUNCEMENTS</button>
            <button onClick={() => scrollTo('syllabus')} className="hover:text-white transition-colors cursor-pointer">SYLLABUS</button>
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer">FEATURES</button>
            <button onClick={() => scrollTo('batches')} className="hover:text-white transition-colors cursor-pointer">BATCHES</button>
          </nav>

          {/* Action CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => navigate('/knowledge-hub')}
              className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer"
            >
              KNOWLEDGE HUB
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/40 cursor-pointer"
            >
              LEARNING HUB
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            {menuOpen ? <Lucide.X size={20} /> : <Lucide.Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#080E21] border-b border-slate-800 px-6 py-5 flex flex-col gap-3 shadow-2xl">
            <button onClick={() => scrollTo('announcements')} className="text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white py-1">ANNOUNCEMENTS</button>
            <button onClick={() => scrollTo('syllabus')} className="text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white py-1">SYLLABUS</button>
            <button onClick={() => scrollTo('features')} className="text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white py-1">FEATURES</button>
            <button onClick={() => scrollTo('batches')} className="text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white py-1">BATCHES</button>
            <button 
              onClick={() => { navigate('/knowledge-hub'); setMenuOpen(false); }}
              className="w-full py-3 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-widest rounded-md text-center shadow-md mt-2"
            >
              KNOWLEDGE HUB
            </button>
            <button 
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
              className="w-full py-3 bg-[#2563EB] text-white text-xs font-bold uppercase tracking-widest rounded-md text-center shadow-md"
            >
              LEARNING HUB
            </button>
          </div>
        )}
      </header>

      {/* ─── Hero Section (Single Master Unified Card Box) ─── */}
      <section className="pt-20 sm:pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto bg-[#FDFBF7] border border-[#EBE5D9] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Teacher & Portal Info */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              
              {/* Trust Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FDF3E7] border border-[#FADDBB] text-[#C25E00] text-[10px] font-black uppercase tracking-wider mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>★ 1,200+ A/L SRI LANKAN STUDENTS TRUST US</span>
              </div>

              {/* Lecturer Info */}
              <div className="flex items-center gap-4 mb-5">
                <img 
                  src={teacherImgSrc} 
                  alt={activeTeacher.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0" 
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {activeTeacher.name}
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C25E00] block mt-0.5">
                    {activeTeacher.title || 'LEAD LECTURER'}
                  </span>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {activeTeacher.credentials || 'B.Sc. Physics - University of Jaffna'}
                  </p>
                  {activeTeacher.mediums && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">({activeTeacher.mediums})</span>
                  )}
                </div>
              </div>

              {/* Highlight Concept Quote Card */}
              <div className="bg-white border-l-4 border-[#C25E00] border-y border-r border-slate-200/70 p-4 rounded-r-xl shadow-xs">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Redefine how you learn <span className="font-extrabold text-[#C25E00]"><SloganRotator /></span>. {activeTeacher.bio_text}
                </p>
              </div>

            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-[#C25E00] hover:bg-[#A85000] text-white text-xs font-extrabold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                ENTER STUDENT PORTAL 🎓 <span>›</span>
              </button>
              <button 
                onClick={() => scrollTo('batches')}
                className="px-6 py-3 bg-transparent hover:bg-slate-100/60 text-slate-700 border border-slate-300 text-xs font-extrabold uppercase tracking-widest rounded-full transition-all cursor-pointer"
              >
                VIEW BATCH OFFERS
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Hero Slider Showcase (Narrower Width, Taller Height) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
              {slides.length > 0 && (
                <div className="space-y-3">
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-700/60 bg-black/40 shadow-lg relative group flex items-center justify-center">
                    {slides[currentSlide]?.image_url ? (
                      <img 
                        src={IMG(slides[currentSlide].image_url)} 
                        alt={slides[currentSlide]?.title || 'Hero Banner'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                        <Lucide.Layers className="w-10 h-10 text-blue-500/60 mb-2" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{slides[currentSlide]?.title || 'INTELLIGENT PHYSICS'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider inline-block">
                      {slides[currentSlide]?.badge || 'DIGITAL LMS PLATFORM'}
                    </span>
                    {slides.length > 1 && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {currentSlide + 1} / {slides.length}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold uppercase text-white tracking-tight leading-snug">{slides[currentSlide]?.title}</h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-1">{slides[currentSlide]?.subtitle}</p>
                </div>
              )}

              {/* Slider Controls & Pagination */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3">
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlide === idx ? 'w-6 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-1.5 bg-slate-700 hover:bg-slate-500'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {slides.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                        title="Previous Banner"
                      >
                        <Lucide.ChevronLeft size={14} />
                      </button>
                      <button 
                        onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                        title="Next Banner"
                      >
                        <Lucide.ChevronRight size={14} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-[10px] font-bold text-white uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    LAUNCH PORTAL
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── Hero Stat Banner (Full Width Dark Strip) ─── */}
      <section className="bg-[#080E21] text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {showStats.map((st, i) => (
            <div key={i} className={`flex flex-col items-center ${i > 0 ? 'pt-4 md:pt-0' : ''}`}>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">{st.value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── News & Updates Section ─── */}
      <section id="announcements" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📢</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 uppercase tracking-tight">NEWS & UPDATES</h2>
            </div>
            <button onClick={() => scrollTo('announcements')} className="text-xs font-bold text-[#2563EB] hover:underline uppercase tracking-wider cursor-pointer">
              VIEW ALL
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <Lucide.BellOff size={32} className="text-slate-400 mb-3" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">NO ANNOUNCEMENTS YET</h3>
              <p className="text-xs text-slate-500 mt-1">Class notices and updates will be displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((ann, idx) => (
                <div key={ann.id || idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest block mb-2">{ann.created_at?.slice(0, 10)}</span>
                  <h3 className="text-base font-extrabold text-slate-900 uppercase mb-2">{ann.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── A/L National Syllabus Section with Search Filter ─── */}
      <section id="syllabus" className="py-20 px-6 bg-slate-100/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">A/L NATIONAL SYLLABUS</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Full Unit Coverage for Sinhala &amp; English Mediums.</p>
            </div>

            <div className="w-full md:max-w-xs relative">
              <input 
                type="text" 
                placeholder="Search topics (e.g. Waves)..." 
                value={syllabusSearch}
                onChange={e => setSyllabusSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-400 text-xs font-bold text-slate-900 pl-4 pr-10 py-3 rounded-xl outline-none shadow-xs transition-all"
              />
              <Lucide.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyllabus.map((unit, idx) => {
              const subtopics = getSubtopics(unit);
              const isExpanded = expandedSyllabusIndex === idx;

              return (
                <div 
                  key={unit.id || unit.topic || idx} 
                  onClick={() => setExpandedSyllabusIndex(isExpanded ? null : idx)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
                        <DynamicIcon name={unit.icon || 'BookOpen'} size={20} />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">{unit.topic}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{unit.desc}</p>
                    
                    {isExpanded && subtopics.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Key Breakdown:</span>
                        {subtopics.map(st => (
                          <div key={st} className="text-slate-700 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[10px] font-black text-[#2563EB] uppercase tracking-wider">
                    <span>{subtopics.length > 0 ? `${subtopics.length} KEY TOPICS` : '9 OUT OF 9 TOPICS'}</span>
                    <span>{isExpanded ? 'Collapse ▲' : 'Explore Subtopics →'}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── LMS Features Section ─── */}
      <section id="features" className="py-20 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">REVOLUTIONARY LMS FEATURES</h2>
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Built for rigorous academic environments, providing the tools needed for deep comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {showFeatures.map((ft, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-5">
                  <DynamicIcon name={ft.icon} size={22} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight mb-2.5">{ft.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{ft.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Choose Your Target Batch Year ─── */}
      <section id="batches" className="py-20 px-6 bg-slate-100/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">CHOOSE YOUR TARGET BATCH YEAR</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {showBatches.map((bt, idx) => {
              const features = getSubtopics(bt);
              return (
                <div key={bt.id || idx} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight mb-3">{bt.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">{bt.description}</p>

                    {features.length > 0 && (
                      <div className="border-t border-slate-100 my-4 pt-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Includes:</span>
                        <ul className="space-y-2">
                          {features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      REQUEST PORTAL ENROLLMENT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Stories From Our High Achievers (Testimonials) ─── */}
      <section className="py-20 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">STORIES FROM OUR HIGH ACHIEVERS</h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs max-w-4xl">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium italic mb-6">
              "{(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).quote}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  — {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).author || (showTestimonials[activeTestimonial] || showTestimonials[0] || {}).name}
                </h4>
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest block mt-0.5">
                  {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).school || (showTestimonials[activeTestimonial] || showTestimonials[0] || {}).result}
                </span>
              </div>
              <div className="flex gap-1.5">
                {showTestimonials.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeTestimonial === i ? 'bg-[#2563EB] w-6' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Direct WhatsApp & Email Support Desk Card ─── */}
      <section className="py-16 px-6 bg-slate-100/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h3 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Need Direct Support?</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
              Our support team is available for registration queries, portal access verification, and technical assistance.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
            <a 
              href="https://wa.me/94754536737" 
              target="_blank" 
              rel="noreferrer" 
              className="flex-1 p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-blue-400 transition-all shadow-xs"
            >
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">WhatsApp</h4>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Start Chat →</span>
              </div>
            </a>
            <a 
              href="mailto:intelligentphysics02@gmail.com" 
              className="flex-1 p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-blue-400 transition-all shadow-xs"
            >
              <span className="text-2xl">📧</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">Email Desk</h4>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Write Email →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="py-20 px-6 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">FAQ</h2>
          </div>

          <div className="space-y-4 max-w-4xl">
            {showFaqs.map((faq, idx) => (
              <FaqAccordion key={idx} q={faq.q || faq.question} a={faq.a || faq.answer} />
            ))}
          </div>

        </div>
      </section>

      {/* ─── Dark Luxury Footer ─── */}
      <footer className="bg-[#080E21] text-white py-12 border-t border-slate-800 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 p-0.5">
              <img src={logo} alt="IP" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight uppercase block">INTELLIGENT PHYSICS</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Intelligent Physics Premium LMS</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            <a href="https://wa.me/94754536737" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WHATSAPP SUPPORT</a>
            <a href="mailto:intelligentphysics02@gmail.com" className="hover:text-white transition-colors">EMAIL DESK</a>
            <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
          </div>

          {/* Official Powered by Applomic badge */}
          <a
            href="https://applomic.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-800 bg-[#070b13] hover:border-slate-700 hover:bg-[#0a0f1b] transition-all no-underline"
          >
            <div className="w-6 h-6 rounded-md overflow-hidden bg-white/5 p-0.5 flex items-center justify-center shrink-0">
              <img src={applomicLogo} alt="Applomic" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-400 transition-colors">Powered by</span>
              <span className="text-[14px] font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-all">
                Applomic
              </span>
            </div>
          </a>
        </div>
      </footer>

    </div>
  );
}

/* ─── Accordion Component ─── */
function FaqAccordion({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex items-center justify-between font-extrabold text-xs text-slate-800 uppercase tracking-wider cursor-pointer hover:bg-slate-50"
      >
        <span>▶ {q}</span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? 'rotate-90 text-[#2563EB]' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100">
          {a}
        </div>
      )}
    </div>
  );
}

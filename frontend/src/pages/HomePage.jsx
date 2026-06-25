import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import teacherPic from '../assets/teacher.png';
import Footer from '../components/Footer';

/* ─── Static Data ─── */
const SYLLABUS = [
  { topic: 'Measurement', icon: '📏', desc: 'Physical quantities, SI units, scalars & vectors, errors and uncertainties.', subtopics: ['SI Units & Base Quantities', 'Dimensional Analysis', 'Errors & Uncertainties', 'Measuring Instruments', 'Vector Addition & Resolution'], color: 'border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5' },
  { topic: 'Mechanics', icon: '⚙️', desc: "Kinematics, Newton's Laws, momentum, work, energy, power and circular motion.", subtopics: ['Linear Kinematics & Projectiles', "Newton's Laws of Motion", 'Momentum & Impulse', 'Work, Energy & Power', 'Circular Motion & Rotational Dynamics'], color: 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:shadow-indigo-500/5' },
  { topic: 'Oscillation & Waves', icon: '〰️', desc: 'SHM, wave properties, sound, light, diffraction and interference.', subtopics: ['Simple Harmonic Motion', 'Transverse & Longitudinal Waves', 'Superposition & Interference', 'Sound Waves & Doppler Effect', 'Wave Optics & Polarization'], color: 'border-cyan-200 bg-cyan-50/20 hover:border-cyan-400 hover:shadow-cyan-500/5' },
  { topic: 'Thermal Physics', icon: '🌡️', desc: 'Heat transfer, ideal gas laws, internal energy and first law of thermodynamics.', subtopics: ['Warmth & Temperature Scales', 'Thermal Expansion & Conduction', 'Kinetic Theory of Gases', 'First Law of Thermodynamics', 'Heat Engines & Efficiency'], color: 'border-rose-200 bg-rose-50/20 hover:border-rose-400 hover:shadow-rose-500/5' },
  { topic: 'Gravitational Field', icon: '🪐', desc: "Newton's law of gravitation, gravitational potential and satellite motion.", subtopics: ["Newton's Law of Gravitation", 'Gravitational Field Strength (g)', 'Gravitational Potential', 'Satellite Motion & Escape Velocity'], color: 'border-purple-200 bg-purple-50/20 hover:border-purple-400 hover:shadow-purple-500/5' },
  { topic: 'Electric Field', icon: '⚡', desc: "Coulomb's law, electric potential, capacitance and energy in electric fields.", subtopics: ["Coulomb's Law", 'Electric Field Intensity', 'Electric Potential & Equipotentials', 'Capacitors in Series & Parallel', 'Energy Stored in Capacitors'], color: 'border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-amber-500/5' },
  { topic: 'Magnetic Field', icon: '🧲', desc: 'Magnetic flux density, force on conductors, electromagnetic induction.', subtopics: ['Magnetic Field of Currents', 'Force on Charge in Magnetic Fields', 'Electromagnetic Induction & Lenz\'s Law', 'Self & Mutual Inductance', 'Transformers & Generator Principle'], color: 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 hover:shadow-emerald-500/5' },
  { topic: 'Current Electricity', icon: '🔌', desc: "Ohm's law, resistance, EMF, Kirchhoff's laws and AC circuits.", subtopics: ["Ohm's Law & Resistivity", "Kirchhoff's Laws", 'Potentiometer & Wheatstone Bridge', 'Internal Resistance & Maximum Power', 'Alternating Current (AC) Circuits'], color: 'border-teal-200 bg-teal-50/20 hover:border-teal-400 hover:shadow-teal-500/5' },
  { topic: 'Electronics', icon: '💡', desc: 'Semiconductors, logic gates and op-amps.', subtopics: ['Intrinsic & Extrinsic Semiconductors', 'PN Junction Diodes & Rectification', 'Bipolar Junction Transistors', 'Operational Amplifiers (Op-Amps)', 'Digital Logic Gates'], color: 'border-orange-200 bg-orange-50/20 hover:border-orange-400 hover:shadow-orange-500/5' },
  { topic: 'Mechanical Properties', icon: '🔩', desc: "Stress, strain, Young's modulus, elasticity and fluid pressure.", subtopics: ['Stress, Strain & Hooke\'s Law', 'Young\'s Modulus', 'Elastic Potential Energy', 'Fluid Pressure & Archimedes\' Principle', 'Viscosity & Surface Tension'], color: 'border-sky-200 bg-sky-50/20 hover:border-sky-400 hover:shadow-sky-500/5' },
  { topic: 'Matter & Radiation', icon: '☢️', desc: 'Photoelectric effect, atomic structure, nuclear reactions and radioactive decay.', subtopics: ['Photoelectric Effect', 'X-Rays & Line Spectra', 'Wave-Particle Duality', 'Radioactivity & Half-life', 'Nuclear Fission & Fusion'], color: 'border-violet-200 bg-violet-50/20 hover:border-violet-400 hover:shadow-violet-500/5' },
];

const FEATURES = [
  { icon: '📚', title: 'Solved Past Paper Bank', desc: 'Full archive of G.C.E. A/L past papers categorized by unit, accompanied by grading schemes and examiner notes.', color: 'border-blue-200 bg-blue-50/30 hover:border-blue-400' },
  { icon: '🧩', title: 'Adaptive Physics Quizzes', desc: 'Evaluations that gauge your understanding of complex topics and help identify specific knowledge gaps.', color: 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400' },
  { icon: '🎬', title: 'Full HD Class Recordings', desc: 'Every lecture is archived in 1080p high definition, with timestamped sections for easy revision.', color: 'border-cyan-200 bg-cyan-50/30 hover:border-cyan-400' },
  { icon: '📊', title: 'Live Result Analytics', desc: 'Grades, performance metrics, and comparison stats are delivered instantly to your profile after assessments.', color: 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400' },
  { icon: '📢', title: 'Real-Time Batch Notices', desc: 'Instant desktop notices for new lecture notes, timetable updates, and upcoming exam dates.', color: 'border-amber-200 bg-amber-50/30 hover:border-amber-400' },
  { icon: '🏆', title: 'Leaderboards & Rankings', desc: 'Compete constructively with peer batches, earn rank points, and track your weekly status.', color: 'border-rose-200 bg-rose-50/30 hover:border-rose-400' },
];

const FALLBACK_STATS = [
  { value: '1,200+', label: 'Active Students', icon: '🎓', bg: 'bg-blue-50/70 border-blue-150 text-blue-600 shadow-blue-500/5' },
  { value: '500+', label: 'Solved Papers', icon: '📄', bg: 'bg-indigo-50/70 border-indigo-150 text-indigo-600 shadow-indigo-500/5' },
  { value: '300+', label: 'Lecture Videos', icon: '🎥', bg: 'bg-cyan-50/70 border-cyan-150 text-cyan-600 shadow-cyan-500/5' },
  { value: '94%', label: 'Pass Rate (A/B)', icon: '✅', bg: 'bg-emerald-50/70 border-emerald-150 text-emerald-600 shadow-emerald-500/5' },
];

const FAQS = [
  { q: 'Who is Intelligent Physics designed for?', a: 'Sri Lankan A-Level Physics students following the national Sinhala or English medium syllabus, from first-year theory batches to exam-year crash revision classes.' },
  { q: 'How do I join a batch and access the Learning Hub?', a: 'Click the "Learning Hub" button, sign up for a student profile, select your target exam batch, and await instant credentials once your student enrollment is validated.' },
  { q: 'Can I watch classes if I miss the live sessions?', a: 'Yes. All live lessons are recorded in 1080p HD and uploaded to the platform within 6 hours, complete with navigation timeline tags so you can jump to specific concepts.' },
  { q: 'How does the adaptive quiz system help me learn?', a: 'Our system tracks your quiz responses. If you struggle with a specific sub-topic like Rotational Dynamics, the quiz prioritizes simple mechanical concepts first and scales up as your speed and accuracy improve.' },
  { q: 'How are results and answers processed?', a: 'Students submit answers via the Learning Hub. Assessment marks, correct answers, step-by-step explanations, and your rank in the batch are available immediately.' }
];

const BATCHES = [
  {
    name: 'A/L 2026 Theory',
    status: 'Enrolling Now',
    seatsLeft: '14 seats remaining',
    schedule: 'Thursdays · 4:00 PM - 7:00 PM',
    description: 'Perfect for students starting their A/Ls. Covers syllabus units from basic measurements to current electricity.',
    features: ['100% Comprehensive coverage', 'Weekly adaptive assessments', 'Hardcopy study packs mailed', 'Personalized tutor support'],
    color: 'border-blue-200 bg-blue-50/10 hover:border-blue-400'
  },
  {
    name: 'A/L 2025 Revision',
    status: 'Fast Filling',
    seatsLeft: '8 seats remaining',
    schedule: 'Sundays · 8:30 AM - 1:30 PM',
    description: 'High-intensity session focused on solving complex problems, past papers, and structural question strategies.',
    features: ['Full syllabus summarization', '500+ Past paper analysis', 'Full syllabus mock exams', 'Speed development strategies'],
    color: 'border-indigo-200 bg-indigo-50/10 hover:border-indigo-400'
  },
  {
    name: 'A/L 2025 Theory',
    status: 'Completed / Archive Access',
    seatsLeft: 'Video Access Only',
    schedule: 'Tuesdays · 4:00 PM - 7:00 PM',
    description: 'All core modules are archived. Available for students who want to self-pace through the entire curriculum.',
    features: ['All recorded lectures archive', 'Full past paper repository', 'Online chapter quizzes', 'Instant auto-grading'],
    color: 'border-teal-200 bg-teal-50/10 hover:border-teal-400'
  }
];

const TESTIMONIALS = [
  { quote: 'Intelligent Physics completely transformed my approach to mechanics and field theory. The adaptive quizzes and recorded sessions helped me secure my A/L island rank!', name: 'Sanduni Perera', result: 'Island Rank 12 — G.C.E. A/L Physics' },
  { quote: 'The structured coverages of thermal physics and oscillation are top-tier. I went from a C to a solid A in my school term tests!', name: 'Amal Rodrigo', result: 'District Rank 3 — Gampaha' },
  { quote: 'Best digital platform for Sri Lankan A/L students. The live results database and prompt video uploads make self-studying incredibly easy.', name: 'Fathima Ruzna', result: 'A/L 2025 Theory Batch' }
];

const FALLBACK_LEFT = [
  { id: 'f1', badge: '🔥 Enrollment Open', title: 'A/L 2026 Batch Registration', description: 'Secure your virtual seat today for comprehensive theory coverages.', cta_text: 'Enroll Now', cta_link: '/login', gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)' },
  { id: 'f2', badge: '📄 Reference Bank', title: 'Solved Past Papers Vault', description: 'Instant, free downloads of physics model questions and marks schemes.', cta_text: 'Browse Papers', cta_link: '/knowledge-hub', gradient: 'linear-gradient(135deg,#0d9488,#059669)' },
];

const FALLBACK_RIGHT = [
  { id: 'f3', badge: '🏆 Island Top Ranks', title: 'Proven Academic Results', description: 'Our custom portals guide students to elite district-wide scores.', cta_text: 'See Rankings', cta_link: '#testimonials', gradient: 'linear-gradient(135deg,#7c3aed,#db2777)' },
  { id: 'f4', badge: '💡 Free Trial Lesson', title: 'Watch a Free Demo Class', description: 'Experience the digital features before completing registration.', cta_text: 'Try Demo', cta_link: '/login', gradient: 'linear-gradient(135deg,#f97316,#ef4444)' },
];

const FALLBACK_SLIDES = [
  { id: 's1', badge: '🌌 Digital LMS Platform', title: 'Sri Lanka\'s Premier Physics LMS Portal', subtitle: 'Covering the entire advanced level national curriculum Sinhala and English mediums.', button_text: 'Launch Portal', button_link: '/login', gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)' },
  { id: 's2', badge: '🔥 Enrollment Open', title: 'Theory & Revision Batch Registration', subtitle: 'Live lectures, weekly assessments, and interactive grading reports are now active.', button_text: 'Secure a Seat', button_link: '/login', gradient: 'linear-gradient(135deg,#0f172a,#1e293b)' },
  { id: 's3', badge: '📄 Free Study Guides', title: 'Download Physics Past Papers', subtitle: 'Archive repository containing structural essay papers and marking guides.', button_text: 'Browse Library', button_link: '/knowledge-hub', gradient: 'linear-gradient(135deg,#0d9488,#0f766e)' },
];

const IMG = url => (!url ? '' : url.startsWith('/') ? `${API_URL}${url}` : url);

export default function HomePage() {
  const navigate = useNavigate();

  /* ─── State Hooks ─── */
  const [slides, setSlides] = useState([]);
  const [homeAds, setHomeAds] = useState([]);
  const [homeStats, setHomeStats] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Interactive Syllabus Search/Filter
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [expandedSyllabusIndex, setExpandedSyllabusIndex] = useState(null);

  // Testimonial State
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // New CMS Content States
  const [teacher, setTeacher] = useState(null);
  const [syllabusList, setSyllabusList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [faqsList, setFaqsList] = useState([]);

  /* ─── Fetch Home Data ─── */
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/sliders`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-ads`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-stats`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/teacher-profile`).then(r => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_URL}/syllabus-units`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/lms-features`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-batches`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-testimonials`).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/home-faqs`).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([sliders, ads, stats, teacherProf, syllabus, features, batches, testimonials, faqs]) => {
        const activeSliders = (sliders || []).filter(s => s.is_active).sort((a, b) => a.order_index - b.order_index);
        setSlides(activeSliders.length > 0 ? activeSliders : FALLBACK_SLIDES);
        setHomeAds((ads || []).filter(a => a.is_active));
        setHomeStats((stats || []).filter(s => s.is_active));

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

  const showStats = homeStats.length > 0 ? homeStats : FALLBACK_STATS;
  const showSyllabus = syllabusList.length > 0 ? syllabusList : SYLLABUS;
  const showFeatures = featuresList.length > 0 ? featuresList : FEATURES;
  const showBatches = batchesList.length > 0 ? batchesList : BATCHES;
  const showTestimonials = testimonialsList.length > 0 ? testimonialsList : TESTIMONIALS;
  const showFaqs = faqsList.length > 0 ? faqsList : FAQS;

  const fallbackTeacher = {
    name: "Mr. R. Raakulan",
    title: "Lead Lecturer",
    credentials: "B.Sc. Physics · University of Jaffna",
    bio_text: "Physics Teacher at New Science Hall (Tamil and English Medium classes). A dedicated tutor for Advanced Level Physics students with a proven record of helping 75% of students pass while sparking a genuine interest in learning. Zoom Webinar classes and interactive sessions have received exceptional feedback from both students and parents.",
    image_url: "",
    mediums: "Tamil and English Medium class"
  };
  const activeTeacher = teacher || fallbackTeacher;
  const teacherImgSrc = activeTeacher.image_url ? IMG(activeTeacher.image_url) : teacherPic;

  // Process Advertisement grid (High Priority Promo section)
  const leftAds = homeAds.filter(a => a.position === 'left');
  const rightAds = homeAds.filter(a => a.position === 'right');
  const allAdsList = [
    ...(leftAds.length > 0 ? leftAds : FALLBACK_LEFT),
    ...(rightAds.length > 0 ? rightAds : FALLBACK_RIGHT)
  ];

  /* ─── Scroll Events ─── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ─── Auto Testimonial slider ─── */
  useEffect(() => {
    if (showTestimonials.length <= 1) return;
    const t = setInterval(() => {
      setActiveTestimonial(idx => (idx + 1) % showTestimonials.length);
    }, 8000);
    return () => clearInterval(t);
  }, [showTestimonials]);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  /* ─── Syllabus Helper Functions ─── */
  const getSubtopics = (unit) => {
    if (unit.subtopics) return unit.subtopics;
    if (unit.subtopics_json) {
      try {
        return JSON.parse(unit.subtopics_json);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  /* ─── Syllabus Search filtering ─── */
  const filteredSyllabus = showSyllabus.filter(unit => {
    const q = syllabusSearch.toLowerCase();
    const subtopics = getSubtopics(unit);
    return unit.topic.toLowerCase().includes(q) || subtopics.some(s => s.toLowerCase().includes(q));
  });

  const goLink = link => {
    if (!link) return;
    if (link.startsWith('/')) navigate(link);
    else if (link.startsWith('#')) document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.open(link, '_blank');
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-650 selection:text-white antialiased">
      {/* ─── Ultra-Premium Core Styles & Animations ─── */}
      <style>{`
        body { 
          background-color: #f8fafc !important; 
          color: #0f172a !important; 
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { 
          background: #cbd5e1; 
          border-radius: 99px; 
          border: 2.5px solid #f1f5f9; 
          transition: background 0.3s;
        }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Premium hover lifts and sweeps */
        .glass-card-premium {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(226, 232, 240, 0.7);
          box-shadow: 0 4px 30px rgba(15, 23, 42, 0.015), 0 1px 3px rgba(0, 0, 0, 0.01);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-premium:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(0, 0, 0, 0.01);
        }

        /* Ambient Glow animations */
        @keyframes ambientLight {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.15); }
        }
        .animate-glow-spot {
          animation: ambientLight 12s infinite ease-in-out;
        }
      `}</style>

      {/* ─── Premium Light Glassmorphic Header ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3.5 shadow-sm shadow-slate-100/50' : 'bg-transparent py-7'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Intelligent Physics Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-blue-600">
              Intelligent Physics
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-base">
            <button onClick={() => scrollTo('promotions')} className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Promotions</button>
            <button onClick={() => scrollTo('lms-features')} className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollTo('syllabus')} className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Syllabus</button>
            <button onClick={() => scrollTo('batches')} className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Batches</button>
            <button onClick={() => navigate('/knowledge-hub')} className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Knowledge Hub</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-7 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 hover:opacity-95 text-white text-base font-extrabold rounded-xl transition-all duration-350 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2">
                Student Portal <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Hamburger button */}
          <button className="md:hidden text-slate-700 hover:text-slate-900" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            <button onClick={() => scrollTo('promotions')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 font-bold text-base">Promotions</button>
            <button onClick={() => scrollTo('lms-features')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 font-bold text-base">Features</button>
            <button onClick={() => scrollTo('syllabus')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 font-bold text-base">Syllabus</button>
            <button onClick={() => scrollTo('batches')} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 font-bold text-base">Batches</button>
            <button onClick={() => { navigate('/knowledge-hub'); setMenuOpen(false); }} className="text-left py-2 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 font-bold text-base">Knowledge Hub</button>
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 text-center font-bold text-white rounded-xl text-base">Student Portal →</button>
          </div>
        )}
      </nav>

      {/* ─── Hero Section with Mesh Glow Backgrounds ─── */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-white border-b border-slate-200/50">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-indigo-300/5 blur-[120px] rounded-full pointer-events-none animate-glow-spot" />
        <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue-500/8 via-cyan-500/5 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow-spot" style={{ animationDelay: '-4s' }} />
        
        {/* Soft, clean line grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-indigo-50/90 border border-indigo-100 text-sm font-extrabold text-indigo-800 mb-6 shadow-sm backdrop-blur-md">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              <span>1,248 Sri Lankan Students Online</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900">
              Welcome to <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800">
                Intelligent Physics
              </span>
            </h1>

            {/* Teacher Intro Block - Metallic Glassmorphic Profile Card */}
            <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-7 bg-gradient-to-tr from-white via-indigo-50/20 to-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-100/40 backdrop-blur-xl text-left w-full max-w-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <img 
                  src={teacherImgSrc} 
                  alt={activeTeacher.name} 
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-slate-250 shadow-md bg-slate-100" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-sm font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-md self-start">{activeTeacher.title}</span>
                <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">{activeTeacher.name}</h3>
                <span className="text-sm font-bold text-slate-500 leading-tight">{activeTeacher.credentials}</span>
                {activeTeacher.mediums && (
                  <span className="text-xs font-bold text-slate-400 italic">({activeTeacher.mediums})</span>
                )}
                <p className="text-base text-slate-600 leading-relaxed font-sans mt-2">
                  {activeTeacher.bio_text}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <button onClick={() => navigate('/login')} className="px-9 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl transition-all duration-300 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 text-base">
                Enter Student Portal 🎓
              </button>
              <button onClick={() => scrollTo('promotions')} className="px-9 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 hover:border-slate-350 font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-md text-base">
                View Batch Offers
              </button>
            </div>

          </div>

          {/* Larger Announcement Slider on the Right */}
          <div className="lg:col-span-5 flex justify-center items-center w-full relative">
            <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />
            
            {/* The Image Slider Component */}
            {loaded && slides.length > 0 ? (
              <HeroCardSlider slides={slides} navigate={navigate} />
            ) : (
              <div className="w-full h-[480px] max-w-[560px] rounded-3xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-2xl">
                <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── Stats Banner Section ─── */}
      <section className="py-14 bg-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {showStats.map((s, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-white border border-slate-200/70 rounded-2xl shadow-md relative group overflow-hidden">
                <div className="text-4xl mb-2">{s.icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{s.value}</div>
                <div className="text-base text-slate-500 font-bold uppercase tracking-wider text-center mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Promotions & Announcements Section (High Priority Ads) ─── */}
      <section id="promotions" className="py-24 bg-slate-50 relative border-b border-slate-200/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none animate-glow-spot" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-650 text-sm font-extrabold tracking-widest uppercase px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm">Special Bulletins</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-950">
              Latest Promotions & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Announcements</span>
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Important alerts and registration links. Stay up to date with new batches, demo resources, and enrollment opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {allAdsList.map((ad, index) => {
              const imgSrc = ad.image_url?.startsWith('/') ? `${API_URL}${ad.image_url}` : ad.image_url;
              return (
                <div 
                  key={ad.id || index}
                  className="rounded-3xl p-9 text-white flex flex-col justify-between shadow-xl shadow-slate-200/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden group"
                  style={{ background: ad.gradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                >
                  {/* Subtle sweep overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
                  
                  <div>
                    {imgSrc && (
                      <div className="mb-6 rounded-2xl overflow-hidden h-44 border border-white/10 shadow-md">
                        <img src={imgSrc} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                    )}
                    
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-extrabold uppercase tracking-wider mb-4">
                      {ad.badge || 'Alert'}
                    </span>
                    
                    <h3 className="text-2xl sm:text-3xl font-black leading-snug tracking-tight mb-4 drop-shadow-md">
                      {ad.title}
                    </h3>
                    
                    <p className="text-base text-white/90 leading-relaxed font-sans mb-6">
                      {ad.description}
                    </p>
                  </div>

                  {ad.cta_text && (
                    <button 
                      onClick={() => goLink(ad.cta_link)}
                      className="w-full sm:w-auto px-7 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-base rounded-xl shadow-lg transition-all duration-200 text-center cursor-pointer relative z-10 self-start"
                    >
                      {ad.cta_text}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── LMS Features Section with Unique Color Themes ─── */}
      <section id="lms-features" className="py-24 bg-white border-b border-slate-200/50 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-650 text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm">Digital Platform</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-950">
              LMS Features & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Student Tools</span>
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Our custom learning management system has been constructed specifically for G.C.E. Advanced Level Physics. Here are the core tools available immediately upon login:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showFeatures.map((f, idx) => (
              <div 
                key={f.id || idx}
                className={`glass-card-premium rounded-3xl p-7 border ${f.color} shadow-sm relative group`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2.5 transition-colors">{f.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed font-sans">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Curriculum Syllabus catalog with Search and Unique Colors ─── */}
      <section id="syllabus" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <span className="text-blue-600 text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-sm">A/L National Syllabus</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-950">
                Syllabus Unit <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Coverage</span>
              </h2>
            </div>
            
            {/* Real-time search */}
            <div className="w-full md:max-w-xs relative">
              <input 
                type="text" 
                placeholder="Search physics topics (e.g. Waves)..." 
                value={syllabusSearch}
                onChange={e => setSyllabusSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 text-base px-4 py-3.5 rounded-2xl outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyllabus.map((s, index) => {
              const isExpanded = expandedSyllabusIndex === index;
              const subtopics = getSubtopics(s);

              return (
                <div 
                  key={s.id || s.topic}
                  onClick={() => setExpandedSyllabusIndex(isExpanded ? null : index)}
                  className={`p-6 border rounded-3xl transition-all duration-300 cursor-pointer shadow-sm relative group ${s.color} ${isExpanded ? 'ring-1 ring-indigo-500/35 shadow-md' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl group-hover:scale-105 transition-transform">{s.icon}</span>
                    <h3 className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-indigo-650 transition-colors">{s.topic}</h3>
                  </div>

                  <p className="text-base text-slate-600 leading-relaxed font-sans mt-3">
                    {s.desc}
                  </p>

                  {/* Subtopics Checklist Panel */}
                  <div className={`transition-all duration-350 overflow-hidden ${isExpanded ? 'max-h-[300px] mt-6 pt-4 border-t border-slate-200/50' : 'max-h-0'}`}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-3">Syllabus Breakdown</span>
                    <ul className="flex flex-col gap-2.5">
                      {subtopics.map(sub => (
                        <li key={sub} className="flex items-center gap-2.5 text-base text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 group-hover:text-slate-650">
                    <span>{subtopics.length} Key Subtopics</span>
                    <span className="text-indigo-650 font-extrabold">{isExpanded ? 'Collapse' : 'Explore Subtopics →'}</span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Batch schedules & pricing ─── */}
      <section id="batches" className="py-24 bg-white border-t border-slate-200/50 relative">
        <div className="max-w-7xl mx-auto px-6">

          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-600 text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 bg-indigo-50/80 rounded-full border border-indigo-100/50 shadow-sm">Class Enrollments</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-950">
              Choose Your Target <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Batch Year</span>
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Course materials, hardcopy revision packs, and digital credentials are included in every program.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {showBatches.map((b, idx) => {
              const features = getSubtopics(b); // Safe dynamic/static inclusions
              return (
                <div 
                  key={b.id || idx}
                  className={`border rounded-3xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative group min-h-[500px] ${b.color}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <span className="text-sm font-extrabold uppercase px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-600">{b.status}</span>
                      <span className="text-sm font-bold text-amber-600">{b.seats_left || b.seatsLeft}</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-650 transition-colors">{b.name}</h3>
                    <div className="text-base text-indigo-600 font-bold font-mono mt-2 flex items-center gap-1.5">
                      <span>📅</span> {b.schedule}
                    </div>

                    <p className="text-base text-slate-600 leading-relaxed font-sans mt-4">
                      {b.description}
                    </p>

                    <div className="border-t border-slate-200/80 my-6 pt-6">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Course Inclusion Items</span>
                      <ul className="flex flex-col gap-3">
                        {features.map(f => (
                          <li key={f} className="flex items-center gap-2.5 text-base text-slate-700">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={() => goLink(b.enroll_link || '/login')}
                    className="w-full py-3.5 mt-8 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-500 text-slate-700 text-base font-extrabold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Request Portal Enrollment
                  </button>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Student Reviews Testimonials ─── */}
      <section id="testimonials" className="py-24 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-600 text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm">Success Records</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-950">
              Stories from Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">High Achievers</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 relative shadow-lg shadow-slate-200/30 text-center">
            
            <div className="absolute top-6 left-6 text-7xl font-serif text-slate-100 opacity-80 pointer-events-none select-none">“</div>
            
            <div className="text-amber-500 text-xl mb-6">★★★★★</div>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 leading-relaxed italic font-medium px-4">
              "{(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).quote}"
            </p>

            <h4 className="mt-8 font-extrabold text-slate-900 text-lg leading-tight">
              {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).name}
            </h4>
            <span className="text-base text-indigo-600 font-bold uppercase tracking-wider block mt-1.5">
              {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).result}
            </span>

            {/* Slider Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {showTestimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-200 ${activeTestimonial === index ? 'bg-indigo-600 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ─── FAQ Accordions & WhatsApp support ─── */}
      <section className="py-24 bg-white border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left FAQ */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <span className="text-indigo-600 text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 bg-indigo-50/80 rounded-full border border-indigo-100/50 shadow-sm">Common Inquiries</span>
                <h2 className="text-3xl font-black tracking-tight mt-4 text-slate-950">Frequently Asked Questions</h2>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                {showFaqs.map((faq, idx) => {
                  const q = faq.question || faq.q;
                  const a = faq.answer || faq.a;
                  return <FaqItem key={idx} q={q} a={a} />;
                })}
              </div>
            </div>

            {/* Right WhatsApp cards */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Instant Support Desk</span>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">Need direct help?</h3>
              <p className="text-base text-slate-600 leading-relaxed font-sans">
                Our support team is available 24/7. Connect with us on WhatsApp or write us an email if you have specific registration errors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <a 
                  href="https://wa.me/94000000000" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-350 rounded-2xl text-left transition-all flex items-center gap-3 group decoration-transparent shadow-sm"
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">WhatsApp Helpline</h4>
                    <span className="text-xs text-slate-400 mt-1 block group-hover:text-emerald-500 transition-colors">Start Chat →</span>
                  </div>
                </a>

                <a 
                  href="mailto:info@intelligentphysics.lk" 
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-350 rounded-2xl text-left transition-all flex items-center gap-3 group decoration-transparent shadow-sm"
                >
                  <span className="text-2xl">📧</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">Email Support</h4>
                    <span className="text-xs text-slate-400 mt-1 block group-hover:text-indigo-500 transition-colors">Write Email →</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ─── Slider Component ─── */
function HeroCardSlider({ slides, navigate }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef(null);

  const go = useCallback(n => {
    setFading(true);
    setTimeout(() => {
      setIdx(n);
      setFading(false);
    }, 250);
  }, []);

  const next = useCallback(() => go((idx + 1) % slides.length), [idx, go, slides.length]);
  const prev = useCallback(() => go((idx - 1 + slides.length) % slides.length), [idx, go, slides.length]);

  useEffect(() => {
    timer.current = setInterval(next, 6000);
    return () => clearInterval(timer.current);
  }, [next]);

  const reset = () => {
    clearInterval(timer.current);
    timer.current = setInterval(next, 6000);
  };

  const currentSlide = slides[idx];
  const hasImage = !!currentSlide.image_url;

  return (
    <div className="w-full h-[480px] max-w-[560px] rounded-3xl relative overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-900 flex flex-col justify-between p-10 text-white group">
      
      {/* Background Graphic or Image */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: fading ? 0.35 : 1,
          ...(hasImage 
            ? { backgroundImage: `url(${IMG(currentSlide.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: currentSlide.gradient || 'linear-gradient(135deg,#1e3a8a,#3b82f6)' })
        }}
      />
      {hasImage && <div className="absolute inset-0 bg-slate-950/70" />}
      
      {/* Subtle Matrix grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Slide Content */}
      <div className="relative z-10 flex flex-col items-start gap-4">
        <span className="px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-extrabold tracking-widest uppercase">
          {currentSlide.badge || 'LMS Notice'}
        </span>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight mt-2 drop-shadow-md">
          {currentSlide.title}
        </h3>
        <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed font-sans max-w-md mt-2">
          {currentSlide.subtitle}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between w-full mt-6">
        {currentSlide.button_text ? (
          <button 
            onClick={() => goLink(currentSlide.button_link)}
            className="px-7 py-3 bg-white text-slate-900 font-extrabold text-base rounded-xl shadow-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {currentSlide.button_text}
          </button>
        ) : (
          <div />
        )}

        {/* Indicators Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => { go(i); reset(); }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${idx === i ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => { prev(); reset(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
          >
            ‹
          </button>
          <button 
            onClick={() => { next(); reset(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
          >
            ›
          </button>
        </>
      )}

    </div>
  );
}

/* ─── Reusable Accordion Item ─── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-colors shadow-sm">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4.5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 cursor-pointer"
      >
        <span className="font-extrabold text-lg text-slate-800 leading-snug">{q}</span>
        <span className={`text-slate-450 text-lg transition-transform duration-250 ${open ? 'rotate-180 text-indigo-650' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'}`}>
        <p className="p-6 text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {a}
        </p>
      </div>
    </div>
  );
}

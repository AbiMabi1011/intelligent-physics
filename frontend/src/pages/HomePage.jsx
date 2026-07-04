import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { API_URL } from '../config';
import logo from '../assets/logo.jpeg';
import teacherPic from '../assets/teacher.png';
import Footer from '../components/Footer';

// Dynamic Icon renderer to support both emojis and Lucide icons
const DynamicIcon = ({ name, className = "", size = 24 }) => {
    if (!name) return null;
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
            className={`transition-all duration-[900ms] cubic-bezier(0.16, 1, 0.3, 1) ${visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-[2px]'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// Interactive 3D Tilt Card wrapper — split-layer so buttons always receive clicks correctly
const TiltCard = ({ children, className = "" }) => {
    const outerRef = useRef(null);
    const innerRef = useRef(null);

    const handleMouseMove = (e) => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) return;
        const rect = outer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        // Subtle tilt — divisor 22 keeps it gentle and non-disruptive
        const angleX = (yc - y) / 22;
        const angleY = (x - xc) / 22;

        inner.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.015, 1.015, 1.015)`;
        inner.style.boxShadow = `0 25px 50px -12px rgba(99, 102, 241, 0.15)`;
    };

    const handleMouseLeave = () => {
        const inner = innerRef.current;
        if (!inner) return;
        inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        inner.style.boxShadow = 'none';
    };

    // On any mousedown anywhere in the card, snap tilt back to flat
    // so the button hit-area is exactly where it visually appears
    const handleMouseDown = () => {
        const inner = innerRef.current;
        if (!inner) return;
        inner.style.transition = 'none';
        inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        inner.style.boxShadow = 'none';
    };

    const handleMouseUp = () => {
        const inner = innerRef.current;
        if (!inner) return;
        inner.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
    };

    return (
        // Outer: full pointer-events, no transform (so click hit-areas are always accurate)
        <div
            ref={outerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className={`${className}`}
        >
            {/* Inner: receives the visual 3D tilt — pointer-events pass through to children */}
            <div
                ref={innerRef}
                style={{ transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out' }}
                className="w-full h-full origin-center"
            >
                {children}
            </div>
        </div>
    );
};



// Morphing Liquid Flow Canvas for Hero background
const HeroLiquidCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frameId;

        let w = canvas.width = canvas.offsetWidth;
        let h = canvas.height = canvas.offsetHeight;

        const handleResize = () => {
            if (!canvas) return;
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        // Fluid waves state
        let time = 0;
        
        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Draw morphing background waves resembling quantum mechanical probability fields
            ctx.lineWidth = 1.5;
            
            const wavesCount = 4;
            const waveGradients = [
                'rgba(99, 102, 241, 0.04)',
                'rgba(59, 130, 246, 0.035)',
                'rgba(6, 182, 212, 0.03)',
                'rgba(168, 85, 247, 0.02)'
            ];

            for (let k = 0; k < wavesCount; k++) {
                ctx.strokeStyle = waveGradients[k];
                ctx.beginPath();
                
                const waveHeight = 80 + k * 20;
                const speed = 0.005 + k * 0.002;
                const freq = 0.003 - k * 0.0005;

                for (let x = 0; x < w; x++) {
                    const y = h * 0.6 + Math.sin(x * freq + time * speed) * waveHeight * Math.cos(x * 0.001 + time * 0.001);
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw floating quantum nodes
            time += 1.5;
            frameId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" 
        />
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
        <span className={`inline-block transition-all duration-300 transform ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'} text-[#656CFF]`}>
            {slogans[idx]}
        </span>
    );
};

/* ─── Fallback Static Data ─── */
const SYLLABUS = [
  { topic: 'Measurement', icon: 'Ruler', desc: 'Physical quantities, SI units, scalars & vectors, errors and uncertainties.', subtopics: ['SI Units & Base Quantities', 'Dimensional Analysis', 'Errors & Uncertainties', 'Measuring Instruments', 'Vector Addition & Resolution'], color: 'border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-blue-500/5' },
  { topic: 'Mechanics', icon: 'Settings', desc: "Kinematics, Newton's Laws, momentum, work, energy, power and circular motion.", subtopics: ['Linear Kinematics & Projectiles', "Newton's Laws of Motion", 'Momentum & Impulse', 'Work, Energy & Power', 'Circular Motion & Rotational Dynamics'], color: 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:shadow-indigo-500/5' },
  { topic: 'Oscillation & Waves', icon: 'Activity', desc: 'SHM, wave properties, sound, light, diffraction and interference.', subtopics: ['Simple Harmonic Motion', 'Transverse & Longitudinal Waves', 'Superposition & Interference', 'Sound Waves & Doppler Effect', 'Wave Optics & Polarization'], color: 'border-cyan-200 bg-cyan-50/20 hover:border-cyan-400 hover:shadow-cyan-500/5' },
  { topic: 'Thermal Physics', icon: 'Thermometer', desc: 'Heat transfer, ideal gas laws, internal energy and first law of thermodynamics.', subtopics: ['Warmth & Temperature Scales', 'Thermal Expansion & Conduction', 'Kinetic Theory of Gases', 'First Law of Thermodynamics', 'Heat Engines & Efficiency'], color: 'border-rose-200 bg-rose-50/20 hover:border-rose-400 hover:shadow-rose-500/5' },
  { topic: 'Gravitational Field', icon: 'Globe', desc: "Newton's law of gravitation, gravitational potential and satellite motion.", subtopics: ["Newton's Law of Gravitation", 'Gravitational Field Strength (g)', 'Gravitational Potential', 'Satellite Motion & Escape Velocity'], color: 'border-purple-200 bg-purple-50/20 hover:border-purple-400 hover:shadow-purple-500/5' },
  { topic: 'Electric Field', icon: 'Zap', desc: "Coulomb's law, electric potential, capacitance and energy in electric fields.", subtopics: ["Coulomb's Law", 'Electric Field Intensity', 'Electric Potential & Equipotentials', 'Capacitors in Series & Parallel', 'Energy Stored in Capacitors'], color: 'border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-amber-500/5' },
  { topic: 'Magnetic Field', icon: 'Magnet', desc: 'Magnetic flux density, force on conductors, electromagnetic induction.', subtopics: ['Magnetic Field of Currents', 'Force on Charge in Magnetic Fields', 'Electromagnetic Induction & Lenz\'s Law', 'Self & Mutual Inductance', 'Transformers & Generator Principle'], color: 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 hover:shadow-emerald-500/5' },
  { topic: 'Current Electricity', icon: 'Cpu', desc: "Ohm's law, resistance, EMF, Kirchhoff's laws and AC circuits.", subtopics: ["Ohm's Law & Resistivity", "Kirchhoff's Laws", 'Potentiometer & Wheatstone Bridge', 'Internal Resistance & Maximum Power', 'Alternating Current (AC) Circuits'], color: 'border-teal-200 bg-teal-50/20 hover:border-teal-400 hover:shadow-teal-500/5' },
  { topic: 'Electronics', icon: 'Tv', desc: 'Semiconductors, logic gates and op-amps.', subtopics: ['Intrinsic & Extrinsic Semiconductors', 'PN Junction Diodes & Rectification', 'Bipolar Junction Transistors', 'Operational Amplifiers (Op-Amps)', 'Digital Logic Gates'], color: 'border-orange-200 bg-orange-50/20 hover:border-orange-400 hover:shadow-orange-500/5' },
  { topic: 'Mechanical Properties', icon: 'Box', desc: "Stress, strain, Young's modulus, elasticity and fluid pressure.", subtopics: ['Stress, Strain & Hooke\'s Law', 'Young\'s Modulus', 'Elastic Potential Energy', 'Fluid Pressure & Archimedes\' Principle', 'Viscosity & Surface Tension'], color: 'border-sky-200 bg-sky-50/20 hover:border-sky-400 hover:shadow-sky-500/5' },
  { topic: 'Matter & Radiation', icon: 'Radio', desc: 'Photoelectric effect, atomic structure, nuclear reactions and radioactive decay.', subtopics: ['Photoelectric Effect', 'X-Rays & Line Spectra', 'Wave-Particle Duality', 'Radioactivity & Half-life', 'Nuclear Fission & Fusion'], color: 'border-violet-200 bg-violet-50/20 hover:border-violet-400 hover:shadow-violet-500/5' },
];

const FEATURES = [
  { icon: 'BookOpen', title: 'Solved Past Paper Bank', desc: 'Full archive of G.C.E. A/L past papers categorized by unit, accompanied by grading schemes and examiner notes.', color: 'border-blue-200 bg-blue-50/30 hover:border-blue-400' },
  { icon: 'Award', title: 'Adaptive Physics Quizzes', desc: 'Evaluations that gauge your understanding of complex topics and help identify specific knowledge gaps.', color: 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400' },
  { icon: 'Video', title: 'Full HD Class Recordings', desc: 'Every lecture is archived in 1080p high definition, with timestamped sections for easy revision.', color: 'border-cyan-200 bg-cyan-50/30 hover:border-cyan-400' },
  { icon: 'Activity', title: 'Live Result Analytics', desc: 'Grades, performance metrics, and comparison stats are delivered instantly to your profile after assessments.', color: 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400' },
  { icon: 'Bell', title: 'Real-Time Batch Notices', desc: 'Instant desktop notices for new lecture notes, timetable updates, and upcoming exam dates.', color: 'border-amber-200 bg-amber-50/30 hover:border-amber-400' },
  { icon: 'Trophy', title: 'Leaderboards & Rankings', desc: 'Compete constructively with peer batches, earn rank points, and track your weekly status.', color: 'border-rose-200 bg-rose-50/30 hover:border-rose-400' },
];

const FALLBACK_STATS = [
  { value: '1,200+', label: 'Active Students', icon: 'GraduationCap', color: '#3b82f6', bg: 'bg-blue-50/70 border-blue-150 text-blue-600 shadow-blue-500/5' },
  { value: '500+', label: 'Solved Papers', icon: 'FileText', color: '#6366f1', bg: 'bg-indigo-50/70 border-indigo-150 text-indigo-600 shadow-indigo-500/5' },
  { value: '300+', label: 'Lecture Videos', icon: 'Video', color: '#06b6d4', bg: 'bg-cyan-50/70 border-cyan-150 text-cyan-600 shadow-cyan-500/5' },
  { value: '94%', label: 'Pass Rate (A/B)', icon: 'CheckCircle', color: '#10b981', bg: 'bg-emerald-50/70 border-emerald-150 text-emerald-600 shadow-emerald-500/5' },
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
  { id: 'f3', badge: '🏆 Island Top Ranks', title: 'Proven Academic Results', description: 'Our portals guide students to elite district-wide scores.', cta_text: 'See Rankings', cta_link: '#testimonials', gradient: 'linear-gradient(135deg,#7c3aed,#db2777)' },
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
    bio_text: "Physics Teacher at New Science Hall (Tamil and English Medium classes). A dedicated tutor for Advanced Level Physics students with a proven record of helping 75% of students pass while sparking a genuine interest in learning.",
    image_url: "",
    mediums: "Tamil and English Medium classes"
  };
  const activeTeacher = teacher || fallbackTeacher;
  const teacherImgSrc = activeTeacher.image_url ? IMG(activeTeacher.image_url) : teacherPic;

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
    if (unit.features) return unit.features;
    if (unit.features_json) {
      try {
        return JSON.parse(unit.features_json);
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
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-650 selection:text-white antialiased relative">
      
      {/* ─── Core Styles & Custom Transitions ─── */}
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
        ::-webkit-scrollbar-thumb:hover { background: #6366f1; }

        .glass-card-premium {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(226, 232, 240, 0.7);
          box-shadow: 0 4px 30px rgba(15, 23, 42, 0.015), 0 1px 3px rgba(0, 0, 0, 0.01);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-premium:hover {
          transform: translateY(-6px);
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(99, 102, 241, 0.45);
          box-shadow: 0 25px 45px -15px rgba(99, 102, 241, 0.12), 0 4px 10px rgba(99, 102, 241, 0.02);
        }

        .hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 35px -10px rgba(99, 102, 241, 0.1);
        }

        @keyframes ambientLight {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.15); }
        }
        .animate-glow-spot {
          animation: ambientLight 12s infinite ease-in-out;
        }
        
        /* Sweep reflection animation on primary CTA buttons */
        .btn-shine-sweep {
          position: relative;
          overflow: hidden;
        }
        .btn-shine-sweep::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(30deg);
          transition: none;
        }
        .btn-shine-sweep:hover::after {
          left: 150%;
          transition: all 0.8s ease-in-out;
        }
      `}</style>

      {/* Global Glowing Mesh Orbs (Light Mode) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-[#656CFF]/4 blur-[140px] rounded-full pointer-events-none z-0 animate-glow-spot" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[40%] bg-[#06b6d4]/3 blur-[140px] rounded-full pointer-events-none z-0 animate-glow-spot" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[50%] bg-[#a855f7]/3 blur-[150px] rounded-full pointer-events-none z-0 animate-glow-spot" style={{ animationDelay: '-8s' }} />

      {/* ─── Premium Sticky Light Navigation Header ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 py-3.5 shadow-sm shadow-slate-100/50' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#656CFF] via-[#a855f7] to-[#06b6d4] p-0.5 shadow-lg shadow-[#656CFF]/20 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Intelligent Physics Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-650 to-blue-600 uppercase italic">
              Intelligent <span className="text-[#656CFF]">Physics</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-black text-xs uppercase tracking-widest text-slate-655">
            <button onClick={() => scrollTo('promotions')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Promotions</button>
            <button onClick={() => scrollTo('demo-sandbox')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Sandbox</button>
            <button onClick={() => scrollTo('lms-features')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollTo('syllabus')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Syllabus</button>
            <button onClick={() => scrollTo('batches')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Batches</button>
            <button onClick={() => navigate('/knowledge-hub')} className="hover:text-[#656CFF] transition-colors cursor-pointer">Knowledge Hub</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-7 py-3 bg-gradient-to-r from-[#656CFF] to-[#545bd9] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#656CFF]/20 hover:shadow-[#656CFF]/35 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group btn-shine-sweep">
              <span className="relative z-10 flex items-center gap-2">
                Portal Login <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
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
          <div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
            <button onClick={() => scrollTo('promotions')} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Promotions</button>
            <button onClick={() => scrollTo('demo-sandbox')} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Sandbox</button>
            <button onClick={() => scrollTo('lms-features')} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Features</button>
            <button onClick={() => scrollTo('syllabus')} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Syllabus</button>
            <button onClick={() => scrollTo('batches')} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Batches</button>
            <button onClick={() => { navigate('/knowledge-hub'); setMenuOpen(false); }} className="text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-[#656CFF] font-black text-xs uppercase tracking-wider">Knowledge Hub</button>
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="w-full py-4 bg-gradient-to-r from-[#656CFF] to-[#545bd9] text-center font-black uppercase text-xs tracking-widest text-white rounded-xl">Portal Login →</button>
          </div>
        )}
      </nav>

      {/* ─── Hero Section with Dynamic Morphing Wave Canvas ─── */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/20 via-white to-transparent">
        
        {/* Dynamic morphing probability waves canvas background (Ramotion style) */}
        <HeroLiquidCanvas />
        
        {/* Soft, clean line grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f103_1px,transparent_1px),linear-gradient(to_bottom,#6366f103_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white border border-slate-200/60 text-[10px] font-black uppercase tracking-widest text-slate-800 mb-6 shadow-sm hover:scale-105 transition-all duration-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span>1,248 Sri Lankan Students Online</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight leading-[1.08] text-slate-900 uppercase italic">
              Redefine how you learn <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#656CFF] via-[#a855f7] to-indigo-850 underline decoration-wavy decoration-[#656CFF] underline-offset-8">
                <SloganRotator />
              </span>
            </h1>

            {/* Teacher Intro Block - Metallic Glassmorphic Profile Card */}
            <div className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-7 bg-white/90 border border-slate-200 rounded-3xl shadow-xl shadow-slate-100/40 backdrop-blur-xl text-left w-full max-w-xl relative overflow-hidden group hover:border-[#656CFF]/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#656CFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#656CFF] to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <img 
                  src={teacherImgSrc} 
                  alt={activeTeacher.name} 
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-slate-250 shadow-md bg-slate-50 group-hover:scale-102 transition-all duration-500" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#656CFF] bg-[#656CFF]/10 border border-[#656CFF]/20 px-3.5 py-1.5 rounded-md self-start">{activeTeacher.title}</span>
                <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight italic">{activeTeacher.name}</h3>
                <span className="text-xs font-bold text-slate-500 leading-tight">{activeTeacher.credentials}</span>
                {activeTeacher.mediums && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">({activeTeacher.mediums})</span>
                )}
                <p className="text-xs text-slate-655 leading-relaxed font-semibold mt-2">
                  {activeTeacher.bio_text}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <button onClick={() => navigate('/login')} className="px-9 py-4 bg-[#656CFF] hover:bg-[#545bd9] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-[#656CFF]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 btn-shine-sweep">
                Enter Student Portal 🎓
              </button>
              <button onClick={() => scrollTo('promotions')} className="px-9 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 hover:border-slate-350 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0">
                View Batch Offers
              </button>
            </div>

          </div>

          {/* Slider Component on the Right */}
          <div className="lg:col-span-5 flex justify-center items-center w-full relative">
            <div className="absolute w-[350px] h-[350px] bg-[#656CFF]/5 blur-[90px] rounded-full pointer-events-none animate-pulse" />
            {loaded && slides.length > 0 ? (
              <HeroCardSlider slides={slides} navigate={navigate} />
            ) : (
              <div className="w-full aspect-[246/310] max-w-[440px] rounded-3xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-2xl">
                <Lucide.Loader2 size={32} className="animate-spin text-white" />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── Stats Banner Section with Staggered Reveal ─── */}
      <section className="py-16 relative border-t border-b border-slate-200/50 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {showStats.map((s, index) => (
              <ScrollReveal key={index} delay={index * 150}>
                <div className="flex flex-col items-center p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative group overflow-hidden hover:border-[#656CFF]/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#656CFF]/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="h-12 w-12 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <DynamicIcon name={s.icon} size={22} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{s.value}</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider text-center mt-2.5">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Concept Sandbox Playground and portal preview ─── */}
      <section id="demo-sandbox" className="py-28 relative border-b border-slate-200/30 overflow-hidden">
        
        {/* Stripe-style horizontal grids */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm animate-pulse">Interactive Learning Preview</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                Concept-First <span className="text-[#656CFF]">Graphical Simulators</span>
              </h2>
              <p className="mt-4 text-slate-500 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                Experience the custom graphical modules designed to simplify Sri Lankan G.C.E. A/L derivations. Drag controls to modulate vector projections and waves instantly.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-16">
            {/* Real Wave / Vector Simulator Sandbox - no tilt so sliders work freely */}
            <ScrollReveal delay={200}>
              <PhysicsSandbox />
            </ScrollReveal>

            {/* LMS Student Portal Dashboard Showcase mock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-8">
              <div className="lg:col-span-5 text-center lg:text-left flex flex-col gap-5">
                <ScrollReveal delay={100}>
                  <span className="text-purple-600 text-[10px] font-black uppercase tracking-widest bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-md self-center lg:self-start">Next-Gen LMS Portal</span>
                  <h3 className="text-3xl font-black text-slate-900 uppercase italic leading-tight mt-3">Adaptive Quiz and <br />Lecture Archives</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Our advanced students login into a personalized dashboard where they access real-time results analytics, leaderboards, G.C.E. A/L past paper vaults, and 1080p high definition class streams.
                  </p>
                  <div className="flex justify-center lg:justify-start mt-2">
                    <button onClick={() => navigate('/login')} className="px-6 py-3 bg-[#656CFF] hover:bg-[#545bd9] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md btn-shine-sweep flex items-center gap-2">
                      Enter Portal Preview <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
              <div className="lg:col-span-7">
                <ScrollReveal delay={300}>
                  <PortalMockPreview />
                </ScrollReveal>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* ─── Promotions & Announcements Section (High Priority Ads) ─── */}
      <section id="promotions" className="py-24 relative border-b border-slate-200/30">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm">Special Bulletins</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                Latest Promotions & <span className="text-[#656CFF]">Announcements</span>
              </h2>
              <p className="mt-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Stay up to date with new batches, demo resources, and enrollment opportunities
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {allAdsList.map((ad, index) => {
              const imgSrc = ad.image_url?.startsWith('/') ? `${API_URL}${ad.image_url}` : ad.image_url;
              return (
                <ScrollReveal key={ad.id || index} delay={index * 200}>
                  <TiltCard className="h-full">
                    <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-md relative flex flex-col justify-between p-8 md:p-10 group hover:border-[#656CFF]/45 h-full">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/10 to-transparent group-hover:via-[#656CFF]/30 transition-all duration-700" />
                      
                      {imgSrc && (
                        <div className="mb-6 w-full h-48 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-50">
                          <img src={imgSrc} alt={ad.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" />
                        </div>
                      )}

                      <div className="space-y-4">
                        <span className="px-3.5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 inline-block">
                          {ad.badge}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase italic">{ad.title}</h3>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                          {ad.description}
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => goLink(ad.cta_link)}
                          className="px-6 py-3 bg-[#656CFF] hover:bg-[#545bd9] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#656CFF]/10 active:scale-95 btn-shine-sweep"
                        >
                          {ad.cta_text || 'Learn More'}
                        </button>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Bulletin ID: AD-0{index + 1}
                        </span>
                      </div>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Syllabus Unit Catalog with Search ─── */}
      <section id="syllabus" className="py-24 relative border-b border-slate-200/30 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
              <div>
                <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm">A/L National Syllabus</span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                  Syllabus Unit <span className="text-[#656CFF]">Coverage</span>
                </h2>
              </div>
              
              <div className="w-full md:max-w-xs relative">
                <input 
                  type="text" 
                  placeholder="Search topics (e.g. Waves)..." 
                  value={syllabusSearch}
                  onChange={e => setSyllabusSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#656CFF]/50 text-xs font-bold text-slate-900 px-5 py-4 rounded-xl outline-none shadow-sm transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-[#656CFF]/5"
                />
                <Lucide.Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyllabus.map((s, index) => {
              const isExpanded = expandedSyllabusIndex === index;
              const subtopics = getSubtopics(s);

              return (
                <ScrollReveal key={s.id || s.topic} delay={(index % 3) * 150}>
                  <TiltCard>
                    <div 
                      onClick={() => setExpandedSyllabusIndex(isExpanded ? null : index)}
                      className={`p-6 rounded-[2rem] border bg-white border-slate-200 transition-all duration-350 cursor-pointer shadow-sm relative group hover:border-[#656CFF]/45 ${isExpanded ? 'ring-1 ring-[#656CFF]/30 border-[#656CFF]/30 bg-slate-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-[#656CFF]/10 border border-[#656CFF]/20 flex items-center justify-center text-[#656CFF] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-305">
                          <DynamicIcon name={s.icon} size={18} />
                        </div>
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-tight group-hover:text-[#656CFF] transition-colors">{s.topic}</h3>
                      </div>

                      <p className="text-xs text-slate-605 mt-4 leading-relaxed font-semibold">
                        {s.desc}
                      </p>

                      <div className={`transition-all duration-350 overflow-hidden ${isExpanded ? 'max-h-[300px] mt-6 pt-4 border-t border-slate-150' : 'max-h-0'}`}>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-3.5">Syllabus Breakdown</span>
                        <ul className="flex flex-col gap-2">
                          {subtopics.map(sub => (
                            <li key={sub} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold hover:text-[#656CFF] transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#656CFF] shrink-0" />
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] font-black text-slate-550 group-hover:text-slate-700">
                        <span>{subtopics.length} Key Subtopics</span>
                        <span className="text-[#656CFF] uppercase tracking-wider">{isExpanded ? 'Collapse' : 'Explore Subtopics →'}</span>
                      </div>

                    </div>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── LMS Features Section ─── */}
      <section id="lms-features" className="py-24 relative border-b border-slate-200/30 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm">Interactive Tools</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                Revolutionary <span className="text-[#656CFF]">LMS Features</span>
              </h2>
              <p className="mt-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                A comprehensive system built specifically to tackle Advanced Level Physics classes
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showFeatures.map((f, index) => (
              <ScrollReveal key={index} delay={(index % 3) * 150}>
                <TiltCard>
                  <div className="p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm relative group hover:border-[#656CFF]/45 h-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/10 to-transparent group-hover:via-[#656CFF]/30 transition-all duration-700" />
                    
                    <div className="h-12 w-12 rounded-xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <DynamicIcon name={f.icon} size={22} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight group-hover:text-[#656CFF] transition-colors">{f.title}</h3>
                    <p className="text-xs text-slate-605 mt-3.5 leading-relaxed font-semibold">{f.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Batch schedules & pricing ─── */}
      <section id="batches" className="py-24 relative border-b border-slate-200/30 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm">Class Enrollments</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                Choose Your Target <span className="text-[#656CFF]">Batch Year</span>
              </h2>
              <p className="mt-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Course materials, hardcopy revision packs, and digital credentials are included in every program
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {showBatches.map((b, idx) => {
              const features = getSubtopics(b);
              return (
                <ScrollReveal key={b.id || idx} delay={idx * 200}>
                  <TiltCard>
                    <div className="border rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between bg-white border-slate-250 hover:border-[#656CFF]/45 relative group min-h-[520px]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/10 to-transparent group-hover:via-[#656CFF]/30 transition-all duration-700" />
                      
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-6">
                          <span className="text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">{b.status}</span>
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{b.seats_left || b.seatsLeft}</span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic group-hover:text-[#656CFF] transition-colors">{b.name}</h3>
                        <div className="text-xs text-[#656CFF] font-bold font-mono mt-2.5 flex items-center gap-1.5 uppercase">
                          <span>📅</span> {b.schedule}
                        </div>

                        <p className="text-xs text-slate-605 leading-relaxed font-semibold mt-4">
                          {b.description}
                        </p>

                        <div className="border-t border-slate-100 my-6 pt-6">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-4">Course Inclusion Items</span>
                          <ul className="flex flex-col gap-3">
                            {features.map(f => (
                              <li key={f} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold hover:text-[#656CFF] transition-colors">
                                <span className="text-emerald-500 font-black">✓</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button 
                        onClick={() => goLink(b.enroll_link || '/login')}
                        className="w-full py-4 mt-8 bg-[#656CFF] hover:bg-[#545bd9] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#656CFF]/15 active:scale-95 btn-shine-sweep"
                      >
                        Request Portal Enrollment
                      </button>

                    </div>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── Student Reviews Testimonials ─── */}
      <section id="testimonials" className="py-24 relative border-b border-slate-200/30 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center mb-20">
              <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm">Success Records</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">
                Stories from Our <span className="text-[#656CFF]">High Achievers</span>
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 relative shadow-lg shadow-slate-200/30 text-center group hover:border-[#656CFF]/30 hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/10 to-transparent group-hover:via-[#656CFF]/30 transition-all duration-700" />
              
              <div className="absolute top-6 left-10 text-8xl font-serif text-[#656CFF]/5 pointer-events-none select-none">“</div>
              
              <div className="flex justify-center gap-1.5 text-amber-550 text-lg mb-6">
                {[...Array(5)].map((_, i) => (
                  <Lucide.Star 
                    key={i} 
                    size={16} 
                    fill="currentColor" 
                    className="text-amber-500 hover:scale-125 transition-transform duration-200 cursor-pointer" 
                  />
                ))}
              </div>
              
              <p className="text-base sm:text-lg text-slate-750 leading-relaxed italic font-medium px-4">
                "{(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).quote}"
              </p>

              <h4 className="mt-8 font-black text-slate-900 text-base uppercase tracking-wider italic">
                {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).name}
              </h4>
              <span className="text-[10px] text-[#656CFF] font-black uppercase tracking-widest block mt-2">
                {(showTestimonials[activeTestimonial] || showTestimonials[0] || {}).result}
              </span>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {showTestimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${activeTestimonial === index ? 'bg-[#656CFF] w-7' : 'bg-slate-250 hover:bg-slate-350'}`}
                  />
                ))}
              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ─── FAQ Accordions & WhatsApp support ─── */}
      <section className="py-24 relative border-b border-slate-200/30 bg-white animate-in">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left FAQ */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ScrollReveal>
                <div>
                  <span className="text-[#656CFF] text-[10px] font-black uppercase tracking-[0.25em] px-4.5 py-2 bg-[#656CFF]/10 rounded-full border border-[#656CFF]/20 shadow-sm animate-pulse">Common Inquiries</span>
                  <h2 className="text-3xl font-black tracking-tight mt-6 text-slate-950 uppercase italic">Frequently Asked Questions</h2>
                </div>
              </ScrollReveal>

              <div className="flex flex-col gap-3 mt-6">
                {showFaqs.map((faq, idx) => {
                  const q = faq.question || faq.q;
                  const a = faq.answer || faq.a;
                  return (
                    <ScrollReveal key={idx} delay={idx * 100}>
                      <FaqItem q={q} a={a} />
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Right WhatsApp support desk */}
            <div className="lg:col-span-5 w-full">
              <ScrollReveal delay={250}>
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-md relative group hover:border-[#656CFF]/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#656CFF]/10 to-transparent group-hover:via-[#656CFF]/30 transition-all duration-700" />
                  
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Instant Support Desk</span>
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-tight">Need direct help?</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Our support team is available 24/7. Connect with us on WhatsApp or write us an email if you have specific registration errors.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <a 
                      href="https://wa.me/94000000000" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-5 bg-slate-50 border border-slate-200 hover:border-[#656CFF]/35 rounded-2xl text-left transition-all flex items-center gap-3.5 group decoration-transparent shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 duration-350"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-tight">WhatsApp</h4>
                        <span className="text-[9px] text-slate-555 mt-1 block group-hover:text-emerald-500 transition-colors uppercase tracking-widest font-black font-sans">Start Chat →</span>
                      </div>
                    </a>

                    <a 
                      href="mailto:info@intelligentphysics.lk" 
                      className="p-5 bg-slate-50 border border-slate-200 hover:border-[#656CFF]/35 rounded-2xl text-left transition-all flex items-center gap-3.5 group decoration-transparent shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 duration-350"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">📧</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-tight">Email Desk</h4>
                        <span className="text-[9px] text-slate-555 mt-1 block group-hover:text-[#656CFF] transition-colors uppercase tracking-widest font-black font-sans">Write Email →</span>
                      </div>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
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
    <div className="w-full aspect-[246/310] max-w-[440px] rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-900 flex flex-col justify-between p-6 sm:p-8 text-white group animate-in fade-in duration-300 hover:border-[#656CFF]/30 hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500">
      
      {/* Background Graphic or Image */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: fading ? 0.35 : 1,
          ...(hasImage 
            ? { backgroundImage: `url(${IMG(currentSlide.image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: currentSlide.gradient || 'linear-gradient(135deg,#656CFF,#a855f7)' })
        }}
      />
      {hasImage && (currentSlide.title || currentSlide.subtitle) && <div className="absolute inset-0 bg-slate-950/70" />}
      {hasImage && <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />}
      
      {/* Matrix grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Slide Content */}
      {(currentSlide.title || currentSlide.subtitle || currentSlide.badge) && (
        <div className="relative z-10 flex flex-col items-start gap-2.5">
          {currentSlide.badge && (
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-[9px] font-black tracking-widest uppercase">
              {currentSlide.badge}
            </span>
          )}
          {currentSlide.title && (
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight uppercase italic mt-1 drop-shadow-md">
              {currentSlide.title}
            </h3>
          )}
          {currentSlide.subtitle && (
            <p className="text-xs text-white/80 leading-relaxed font-semibold max-w-md mt-1.5 drop-shadow-sm">
              {currentSlide.subtitle}
            </p>
          )}
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between w-full mt-auto">
        {currentSlide.button_text ? (
          <button 
            onClick={() => goLink(currentSlide.button_link)}
            className="px-5 py-2.5 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === i ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60'}`}
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-[#656CFF]/30 hover:shadow-md duration-300">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4.5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 cursor-pointer"
      >
        <span className="font-extrabold text-sm text-slate-800 leading-snug">{q}</span>
        <span className={`text-slate-400 text-xs transition-transform duration-250 ${open ? 'rotate-180 text-[#656CFF]' : ''}`}>
          ▼
        </span>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[300px] border-t border-slate-150 bg-slate-50/20' : 'max-h-0'}`}>
        <p className="p-6 text-xs text-slate-650 leading-relaxed font-semibold">
          {a}
        </p>
      </div>
    </div>
  );
}

// Interactive Physics wave / oscillator simulator component for the Sandbox
function PhysicsSandbox() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('wave'); // 'wave' or 'vector'
  const [freq, setFreq] = useState(3.5);
  const [amp, setAmp] = useState(65);

  // Vector state
  const [angle, setAngle] = useState(45);
  const [magnitude, setMagnitude] = useState(120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let localPhase = 0;

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw axis lines and metrics grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      // X-Axis
      ctx.beginPath();
      ctx.moveTo(30, h / 2);
      ctx.lineTo(w - 30, h / 2);
      ctx.stroke();
      
      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(w / 2, 20);
      ctx.lineTo(w / 2, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      if (mode === 'wave') {
        // Draw wave grid markers
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(`A = ${amp}px`, 35, h / 2 - amp - 5);
        ctx.fillText(`f = ${freq}Hz`, w - 90, 30);
        
        // Draw dynamic sine wave
        ctx.strokeStyle = '#656CFF';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        
        for (let x = 30; x < w - 30; x++) {
          const angleVal = ((x - 30) / (w - 60)) * Math.PI * freq * 2 + localPhase;
          const y = h / 2 + Math.sin(angleVal) * amp;
          if (x === 30) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Draw pulsing node indicators
        ctx.fillStyle = '#ef4444';
        const pulseX = w / 2;
        const pulseAngle = ((pulseX - 30) / (w - 60)) * Math.PI * freq * 2 + localPhase;
        const pulseY = h / 2 + Math.sin(pulseAngle) * amp;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 10 + Math.sin(localPhase * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();

        localPhase += 0.05;
      } else {
        // Vector component rendering
        const originX = w / 2;
        const originY = h / 2;
        const rad = (angle * Math.PI) / 180;
        const endX = originX + Math.cos(rad) * magnitude;
        const endY = originY - Math.sin(rad) * magnitude;

        // Component shadow vectors
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        
        // X Component
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Y Component
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX, endY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw primary force vector arrow
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head
        const arrowLength = 12;
        const angle1 = rad - Math.PI / 6;
        const angle2 = rad + Math.PI / 6;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - Math.cos(angle1) * arrowLength, endY + Math.sin(angle1) * arrowLength);
        ctx.lineTo(endX - Math.cos(angle2) * arrowLength, endY + Math.sin(angle2) * arrowLength);
        ctx.closePath();
        ctx.fill();

        // Vector labels
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Vector R (${magnitude} N, ${angle}°)`, endX + 8, endY - 8);
        
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(`Rx = ${(Math.cos(rad) * magnitude).toFixed(1)} N`, endX - 45, originY + 15);
        ctx.fillText(`Ry = ${(Math.sin(rad) * magnitude).toFixed(1)} N`, originX - 60, endY + 5);
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [mode, freq, amp, angle, magnitude]);

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 flex flex-col lg:flex-row gap-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent pointer-events-none" />
      
      {/* Simulation Canvas Workspace */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-800">Concept Sandbox Playground</h4>
          </div>
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            <button 
              onClick={() => setMode('wave')} 
              className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${mode === 'wave' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-505 hover:text-slate-900'}`}
            >
              Wave Motion
            </button>
            <button 
              onClick={() => setMode('vector')} 
              className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${mode === 'vector' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-550 hover:text-slate-900'}`}
            >
              Vector Components
            </button>
          </div>
        </div>

        <div className="relative w-full h-64 bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full bg-[#f8fafc]" />
        </div>
      </div>

      {/* Simulation Parametric Knobs & Sliders */}
      <div className="w-full lg:w-72 flex flex-col justify-between border-l border-slate-100 lg:pl-8 py-2">
        <div>
          <h5 className="font-black text-slate-900 text-lg uppercase tracking-tight italic">Interactive Modulator</h5>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-2.5">
            Drag the sliders to adjust variables in real-time. Experience how physical equations behave visually.
          </p>

          {mode === 'wave' ? (
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-700">
                  <span>Frequency</span>
                  <span className="text-indigo-600">{freq} Hz</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.1" 
                  value={freq} 
                  onChange={e => setFreq(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-700">
                  <span>Amplitude</span>
                  <span className="text-indigo-600">{amp} px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={amp} 
                  onChange={e => setAmp(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer" 
                />
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-700">
                  <span>Force Angle</span>
                  <span className="text-purple-600">{angle}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  value={angle} 
                  onChange={e => setAngle(parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase text-slate-700">
                  <span>Magnitude</span>
                  <span className="text-purple-600">{magnitude} N</span>
                </div>
                <input 
                  type="range" 
                  min="40" 
                  max="160" 
                  value={magnitude} 
                  onChange={e => setMagnitude(parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Equation Output</span>
          <div className="p-3 bg-slate-55 border border-slate-150 rounded-xl font-mono text-[10px] text-slate-700 leading-normal">
            {mode === 'wave' ? (
              <div>y(x,t) = {amp} · sin(k·x - {freq}·t)</div>
            ) : (
              <div>
                R = √({(Math.cos((angle * Math.PI)/180) * magnitude).toFixed(1)}² + {(Math.sin((angle * Math.PI)/180) * magnitude).toFixed(1)}²) = {magnitude} N
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stunning glassmorphic LMS portal preview layout
function PortalMockPreview() {
  return (
    <div className="w-full bg-[#0d0e12] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-left group">
      {/* Background grid dots */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#656CFF]/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Portal Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-505" />
          <span className="w-3 h-3 rounded-full bg-yellow-505" />
          <span className="w-3 h-3 rounded-full bg-green-505" />
          <span className="text-[10px] text-slate-500 font-mono ml-2">student_learning_portal_v2.0</span>
        </div>
        <span className="px-3.5 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase text-emerald-400 border border-white/5 shadow-inner animate-pulse">
          Active Session
        </span>
      </div>

      {/* Mock Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        
        {/* Left Mini Stats */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Syllabus Completion</span>
            <div className="flex items-end justify-between mt-3">
              <span className="text-2xl font-black text-white font-mono">72.4%</span>
              <span className="text-[9px] text-emerald-400 font-bold font-mono">↑ 4.2% this wk</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#656CFF] h-full rounded-full animate-pulse" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Batch Rank</span>
            <div className="flex items-end justify-between mt-3">
              <span className="text-2xl font-black text-white font-mono">08 <span className="text-xs text-slate-500">/ 420</span></span>
              <span className="text-[9px] text-amber-500 font-bold font-mono">Elite Tier</span>
            </div>
          </div>
        </div>

        {/* Right Notification Hub Mockup */}
        <div className="md:col-span-8 p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">LMS Updates Feed</span>
          
          <div className="flex flex-col gap-2.5">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  <Lucide.FileText size={15} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-tight">Mechanics Study Sheet #04</h5>
                  <span className="text-[8px] text-slate-500 font-mono block mt-0.5">Uploaded 2 hours ago · PDF format</span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase rounded">Download</span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF]">
                  <Lucide.Video size={15} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white uppercase tracking-tight">Rotational Dynamics Lesson 3</h5>
                  <span className="text-[8px] text-slate-500 font-mono block mt-0.5">1080p HD Lecture Archive is ready</span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[8px] bg-[#656CFF]/10 text-[#656CFF] border border-[#656CFF]/20 font-black uppercase rounded">Watch</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


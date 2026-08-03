import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Eye,
    Clock,
    Layers,
    Calendar,
    ArrowRight,
    Loader2,
    UploadCloud,
    FileText,
    Share2
} from 'lucide-react';
import { API_URL } from '../../config';

/* ─── Smart Physics Notation Auto-Fixer ─────────────────────────────────────
   Handles both:
   1. LaTeX strings: $\text{kg}\ \text{m}^2\ \text{s}^{-2}$ → kg m² s⁻²
   2. Plain PDF patterns: kg m2 s-2 → kg m² s⁻²
──────────────────────────────────────────────────────────────────────────── */
const SUP_MAP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺' };
const SUB_MAP = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','n':'ₙ','i':'ᵢ','e':'ₑ' };

function toSuperscript(str) {
    return str.split('').map(c => SUP_MAP[c] ?? c).join('');
}
function toSubscript(str) {
    return str.split('').map(c => SUB_MAP[c] ?? c).join('');
}

const GREEK_MAP = {
    'alpha':'α','beta':'β','gamma':'γ','Gamma':'Γ','delta':'δ','Delta':'Δ',
    'epsilon':'ε','zeta':'ζ','eta':'η','theta':'θ','Theta':'Θ','iota':'ι',
    'kappa':'κ','lambda':'λ','Lambda':'Λ','mu':'μ','nu':'ν','xi':'ξ','Xi':'Ξ',
    'pi':'π','Pi':'Π','rho':'ρ','sigma':'σ','Sigma':'Σ','tau':'τ',
    'upsilon':'υ','phi':'φ','Phi':'Φ','chi':'χ','psi':'ψ','Psi':'Ψ',
    'omega':'ω','Omega':'Ω',
};

const SYMBOL_MAP = {
    'times':'×','div':'÷','pm':'±','mp':'∓','approx':'≈','neq':'≠',
    'leq':'≤','geq':'≥','infty':'∞','sqrt':'√','cdot':'·','cdots':'⋯',
    'propto':'∝','partial':'∂','sum':'∑','nabla':'∇','degree':'°',
    'rightarrow':'→','leftarrow':'←','Rightarrow':'⇒','Leftarrow':'⇐',
    'leftrightarrow':'↔','sim':'~','simeq':'≃','equiv':'≡',
};

function latexToUnicode(latex) {
    let t = latex.trim();

    // Remove surrounding $$ ... $$ (display math)
    t = t.replace(/^\$\$([\s\S]*?)\$\$$/, '$1').trim();
    // Remove surrounding $ ... $ (inline math)
    t = t.replace(/^\$([\s\S]*?)\$$/, '$1').trim();
    // Remove \[ ... \] and \( ... \)
    t = t.replace(/^\\\[([\s\S]*?)\\\]$/, '$1').trim();
    t = t.replace(/^\\\(([\s\S]*?)\\\)$/, '$1').trim();

    // Replace \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \mathsf{...}, \mbox{...}
    t = t.replace(/\\(?:text|mathrm|mathbf|mathit|mathsf|mbox)\{([^}]*)\}/g, '$1');

    // Replace \frac{a}{b} → a/b (do before ^ so nested fracs work)
    t = t.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');

    // Replace ^{...} with Unicode superscripts (multi-char, e.g. ^{-2})
    t = t.replace(/\^\{([^}]*)\}/g, (_, content) => toSuperscript(content));
    // Replace ^x (single character: digit or sign or letter n/N)
    t = t.replace(/\^([0-9\-+nN])/g, (_, c) => toSuperscript(c));

    // Replace _{...} with Unicode subscripts (multi-char)
    t = t.replace(/_\{([^}]*)\}/g, (_, content) => toSubscript(content));
    // Replace _x (single character subscript)
    t = t.replace(/_([0-9nNiIeE])/g, (_, c) => toSubscript(c));

    // Replace Greek letters
    Object.entries(GREEK_MAP).forEach(([name, char]) => {
        t = t.replace(new RegExp(`\\\\${name}(?![a-zA-Z])`, 'g'), char);
    });

    // Replace math symbols
    Object.entries(SYMBOL_MAP).forEach(([name, char]) => {
        t = t.replace(new RegExp(`\\\\${name}(?![a-zA-Z])`, 'g'), char);
    });

    // Replace LaTeX spacing commands with a space
    t = t.replace(/\\[,;:!]/g, ' ');
    t = t.replace(/\\ /g, ' ');
    t = t.replace(/\\quad\b/g, '  ');
    t = t.replace(/\\qquad\b/g, '   ');

    // Remove remaining unknown backslash commands
    t = t.replace(/\\[a-zA-Z]+/g, '');

    // Remove remaining braces and lone backslashes
    t = t.replace(/[{}\\]/g, '');

    // Collapse multiple spaces into one
    t = t.replace(/\s+/g, ' ').trim();

    return t;
}

// Replace all inline $...$ segments within a larger string
function convertInlineLatex(text) {
    // Replace $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => latexToUnicode(inner));
    // Replace $...$
    text = text.replace(/\$([^$\n]+?)\$/g, (_, inner) => latexToUnicode(inner));
    // Replace \(...\)
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => latexToUnicode(inner));
    // Replace \[...\]
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => latexToUnicode(inner));
    return text;
}
// Known A/L Physics unit letters — only convert after these for plain-text mode
const UNIT_CHARS = 'msCJKNWVAΩFHTBPcgkMGμnpf';

function fixPlainTextNotation(text) {
    return text.replace(
        new RegExp(`([${UNIT_CHARS}])([+-]?\\d{1,2})(?=[^\\d]|$)`, 'g'),
        (match, unit, power) => {
            if (Math.abs(parseInt(power)) > 9) return match;
            return unit + toSuperscript(power);
        }
    );
}

/* ─── Bamini to Unicode Conversion Engine ─── */
const BAMINI_MAP = {
    "sp": "ளி", "hp": "ரி", "hP": "ரீ", "uP": "ரீ", "u;": "ர்", "h;": "ர்", "H": "ர்",
    "nfs": "கௌ", "Nfh": "கோ", "nfh": "கொ", "fh": "கா", "fp": "கி", "fP": "கீ",
    "F": "கு", "$": "கூ", "nf": "கெ", "Nf": "கே", "if": "கை", "f;": "க்", "f": "க",
    "nqs": "ஙௌ", "Nqh": "ஙோ", "nqh": "ஙொ", "qh": "ஙா", "qp": "ஙி", "qP": "ஙீ",
    "nq": "ஙெ", "Nq": "ஙே", "iq": "ஙை", "q;": "ங்", "q": "ங",
    "nrs": "சௌ", "Nrh": "சோ", "nrh": "சொ", "rh": "சா", "rp": "சி", "rP": "சீ",
    "R": "சு", "#": "சூ", "nr": "செ", "Nr": "சே", "ir": "சை", "r;": "ச்", "r": "ச",
    "n[s": "ஜௌ", "N[h": "ஜோ", "n[h": "ஜொ", "[h": "ஜா", "[p": "ஜி", "[P": "ஜீ",
    "[{": "ஜு", "[_": "ஜூ", "n[": "ஜெ", "N[": "ஜே", "i[": "ஜை", "[;": "ஜ்",
    "nQs": "ஞௌ", "NQh": "ஞோ", "nQh": "ஞொ", "Qh": "ஞா", "Qp": "ஞி", "QP": "ஞீ",
    "nQ": "ஞெ", "NQ": "ஞே", "iQ": "ஞை", "Q;": "ஞ்", "Q": "ஞ",
    "nls": "டௌ", "Nlh": "டோ", "nlh": "டொ", "lp": "டி", "lP": "டீ", "lh": "டா",
    "b": "டி", "B": "டீ", "L": "டு", "^": "டூ", "nl": "டெ", "Nl": "டே", "il": "டை",
    "l;": "ட்", "l": "ட",
    "nzs": "ணௌ", "Nzh": "ணோ", "nzh": "ணொ", "zh": "ணா", "zp": "ணி", "zP": "ணீ",
    "Zh": "ணூ", "Z}": "ணூ", "nz": "ணெ", "Nz": "ணே", "iz": "ணை", "z;": "ண்", "Z": "ணு", "z": "ண",
    "njs": "தௌ", "Njh": "தோ", "njh": "தொ", "jh": "தா", "jp": "தி", "jP": "தீ",
    "Jh": "தூ", "J}": "தூ", "J": "து", "nj": "தெ", "Nj": "தே", "ij": "தை", "j;": "த்", "j": "த",
    "nes": "நௌ", "Neh": "நோ", "neh": "நொ", "eh": "நா", "ep": "நி", "eP": "நீ",
    "E}": "நூ", "Eh": "நூ", "E": "நு", "ne": "நெ", "Ne": "நே", "ie": "நை", "e;": "ந்", "e": "ந",
    "nds": "னௌ", "Ndh": "னோ", "ndh": "னொ", "dh": "னா", "dp": "னி", "dP": "னீ",
    "D}": "னூ", "Dh": "னூ", "D": "னு", "nd": "னெ", "Nd": "னே", "id": "னை", "d;": "ன்", "d": "ன",
    "ngs": "பௌ", "Ngh": "போ", "ngh": "பொ", "gh": "பா", "gp": "பி", "gP": "பீ",
    "G": "பு", "ng": "பெ", "Ng": "பே", "ig": "பை", "g;": "ப்", "g": "ப",
    "nks": "மௌ", "Nkh": "மோ", "nkh": "மொ", "kh": "மா", "kp": "மி", "kP": "மீ",
    "K": "மு", "%": "மூ", "nk": "மெ", "Nk": "மே", "ik": "மை", "k;": "ம்", "k": "ம",
    "nas": "யௌ", "Nah": "யோ", "nah": "யொ", "ah": "யா", "ap": "யி", "aP": "யீ",
    "A": "யு", "A+": "யூ", "na": "யெ", "Na": "யே", "ia": "யை", "a;": "ய்", "a": "ய",
    "nus": "ரௌ", "Nuh": "ரோ", "nuh": "ரொ", "uh": "ரா", "up": "ரி", "U": "ரு",
    "&": "ரூ", "nu": "ரெ", "Nu": "ரே", "iu": "ரை", "u": "ர",
    "nys": "லௌ", "Nyh": "லோ", "nyh": "லொ", "yh": "லா", "yp": "லி", "yP": "லீ",
    "Yh": "லூ", "Y}": "லூ", "Y": "லு", "ny": "லெ", "Ny": "லே", "iy": "லை", "y;": "ல்", "y": "ல",
    "nss": "ளௌ", "Nsh": "ளோ", "nsh": "ளொ", "sh": "ளா", "sP": "ளீ", "Sh": "ளூ",
    "S": "ளு", "ns": "ளெ", "Ns": "ளே", "is": "ளை", "s;": "ள்", "s": "ள",
    "ntt": "வௌ", "Nth": "வோ", "nth": "வொ", "th": "வா", "tp": "வி", "tP": "வீ",
    "nt": "வெ", "Nt": "வே", "it": "வை", "t;": "வ்", "t": "வ",
    "noo": "ழௌ", "Noh": "ழோ", "noh": "ழொ", "oh": "ழா", "op": "ழி", "oP": "ழீ",
    "*": "ழூ", "O": "ழு", "no": "ழெ", "No": "ழே", "io": "ழை", "o;": "ழ்", "o": "ழ",
    "nws": "றௌ", "Nwh": "றோ", "nwh": "றொ", "wh": "றா", "wp": "றி", "wP": "றீ",
    "Wh": "றூ", "W}": "றூ", "W": "று", "nw": "றெ", "Nw": "றே", "iw": "றை", "w;": "ற்", "w": "ற",
    "n``": "ஹௌ", "N`h": "ஹோ", "n`h": "ஹொ", "`h": "ஹா", "`p": "ஹி", "`P": "ஹீ",
    "n`": "ஹெ", "N`": "ஹே", "i`": "ஹை", "`;": "ஹ்", "`": "ஹ",
    "n\\s": "ஷௌ", "N\\h": "ஷோ", "n\\h": "ஷொ", "\\h": "ஷா", "\\p": "ஷி", "\\P": "ஷீ",
    "n\\\\": "ஷெ", "N\\\\": "ஷே", "i\\\\": "ஷை", "\\\\;": "ஷ்", "\\\\": "ஷ",
    "n]s": "ஸௌ", "N]h": "ஸோ", "n]h": "ஸொ", "]h": "ஸா", "]p": "ஸி", "]P": "ஸீ",
    "n]": "ஸெ", "N]": "ஸே", "i]": "ஸை", "];": "ஸ்",
    "m": "அ", "M": "ஆ", "<": "ஈ", "c": "உ", "C": "ஊ", "v": "எ", "V": "ஏ", "I": "ஐ",
    "x": "ஒ", "X": "ஓ", "xs": "ஔ", "/": "ஃ", ",": "இ", "=": "ஸ்ரீ", ">": ",", "T": "வு",
    "வு+": "வூ", "பு+": "பூ", "யு+": "யூ", "சு+": "சூ", "+": "ooh", ";": "்", "@": ";",
    "¿f": "கை", "¿q": "ஙை", "¿r": "சை", "¿[": "ஜை", "¿Q": "ஞை", "¿l": "டை", "¿z": "ணை",
    "¿j": "தை", "¿e": "நை", "¿d": "னை", "¿g": "பை", "¿k": "மை", "¿a": "யை", "¿u": "ரை",
    "¿y": "லை", "¿s": "ளை", "¿t": "வை", "¿o": "ழை", "¿w": "றை", "¿`": "ஹை", "¿\\": "ஷை",
    "¿]": "ஸை", "¿": "ை", "≈": "ௐ", "xk;": "உம்", "[": "ஐ"
};

const bReplacement = Object.entries(BAMINI_MAP).sort((a, b) => b[0].length - a[0].length);

function convertBaminiToUnicode(text) {
    let unicodeText = text;
    for (const [p, r] of bReplacement) {
        unicodeText = unicodeText.split(p).join(r);
    }
    return unicodeText;
}

function isBamini(text) {
    return /MdJ|Nthy;w;W|,yj;jpud;|[jrlztngkahyvwdqcs];/.test(text);
}

function fixTamilUnicodeReordering(text) {
    // Swaps visual combination markers (ெ, ே, ை) that precede consonants,
    // ensuring they are NOT already preceded by a consonant (using negative lookbehind)
    return text.replace(/(?<![\u0B95-\u0BB9])([\u0BC6\u0BC7\u0BC8])([\u0B95-\u0BB9])/g, '$2$1');
}

function autoFixPhysicsNotation(text) {
    // Convert Celsius degree typos (e.g. 400C -> 40°C, 100C -> 10°C)
    text = text.replace(/(\d+)0C\b/g, '$1°C');
    if (isBamini(text)) {
        const translated = text.replace(/[a-zA-Z;,<>\\^\\/\\*\\-\\+0-9\[\]$#%&_\{\}¿≈]+/g, (token) => {
            if (token.length <= 1) {
                if (/^[a-zA-Z]$/.test(token)) {
                    return token;
                }
                return convertBaminiToUnicode(token);
            }
            if (/^\[[a-zA-Z]\]$/.test(token)) return token;
            if (/^(GMm|GM|eV|N|G|M|m|r|r\^2|GMm\/r|GMm\/r\^2|GM\/r)$/i.test(token)) return token;
            if (/^[Mmr],?[Mmr]?$/.test(token)) return token;
            if (token.includes('/') || token.includes('^')) return token;
            
            // Keep a single English letter variable followed by a number (e.g., r1, v2)
            if (/^[a-zA-Z]\d+$/.test(token)) {
                return token;
            }

            // Split variable name followed by number if merged with suffix (e.g., r1ck; -> r1 + ck;)
            const varNumMatch = token.match(/^([a-zA-Z]\d+)([a-zA-Z;,<>]+)$/);
            if (varNumMatch) {
                return varNumMatch[1] + convertBaminiToUnicode(varNumMatch[2]);
            }

            // Keep numbers followed by a single English letter variable (e.g., 2L, 2d, 400C)
            if (/^\d+[a-zA-Z]$/.test(token)) {
                return token;
            }

            // Split variable name preceded by number if merged with suffix (e.g., 2Lck; -> 2L + ck;)
            const numVarMatch = token.match(/^(\d+[a-zA-Z])([a-zA-Z;,<>]+)$/);
            if (numVarMatch) {
                return numVarMatch[1] + convertBaminiToUnicode(numVarMatch[2]);
            }

            // Split variable name if merged with suffix (e.g., Yxk; -> Y + xk;)
            const varMatch = token.match(/^([XY])([a-zA-Z;,<>]+)$/);
            if (varMatch) {
                return varMatch[1] + convertBaminiToUnicode(varMatch[2]);
            }
            
            return convertBaminiToUnicode(token);
        });
        return fixTamilUnicodeReordering(translated);
    }

    // Check for LaTeX markers
    const hasLatex = /\$|\\text\{|\\mathrm\{|\^\{|_\{\\|\\[a-zA-Z]|\\\(|\\\[/.test(text);

    if (hasLatex) {
        // First convert all inline $...$ and \(...\) segments
        let result = convertInlineLatex(text);
        // Then handle any remaining lines that are fully LaTeX (no $ wrapper but have backslash commands)
        result = result.split('\n').map(line => {
            const trimmed = line.trim();
            if (/\\[a-zA-Z]/.test(trimmed)) {
                return latexToUnicode(trimmed);
            }
            return line;
        }).join('\n');
        return result;
    }

    // Otherwise apply plain-text physics notation fix
    return fixPlainTextNotation(text);
}


function setNativeValue(el, newVal) {
    const setter = Object.getOwnPropertyDescriptor(
        el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value'
    )?.set;
    if (setter) {
        setter.call(el, newVal);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

/* Hook: attach smart paste to an input/textarea ref */


/* Small toast notification */
function FixToast({ msg, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2800);
        return () => clearTimeout(t);
    }, [onDone]);
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 bg-[#10B981] text-white rounded-2xl shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-bottom-4 duration-300">
            <span className="text-base">✅</span>
            <span className="text-xs font-black uppercase tracking-widest">{msg}</span>
        </div>
    );
}

/* Formula toolbar + auto-fix button */
const FORMULA_GROUPS = [
    {
        label: 'Superscripts',
        chars: [
            { label: '⁻¹', val: '⁻¹' }, { label: '⁻²', val: '⁻²' }, { label: '⁻³', val: '⁻³' },
            { label: '²', val: '²' }, { label: '³', val: '³' }, { label: '⁴', val: '⁴' },
            { label: '⁰', val: '⁰' }, { label: '¹', val: '¹' },
        ]
    },
    {
        label: 'Subscripts',
        chars: [
            { label: '₀', val: '₀' }, { label: '₁', val: '₁' }, { label: '₂', val: '₂' },
            { label: '₃', val: '₃' }, { label: '₄', val: '₄' }, { label: 'ₙ', val: 'ₙ' },
        ]
    },
    {
        label: 'Greek',
        chars: [
            { label: 'α', val: 'α' }, { label: 'β', val: 'β' }, { label: 'γ', val: 'γ' },
            { label: 'δ', val: 'δ' }, { label: 'ε', val: 'ε' }, { label: 'θ', val: 'θ' },
            { label: 'λ', val: 'λ' }, { label: 'μ', val: 'μ' }, { label: 'π', val: 'π' },
            { label: 'ρ', val: 'ρ' }, { label: 'σ', val: 'σ' }, { label: 'τ', val: 'τ' },
            { label: 'φ', val: 'φ' }, { label: 'ω', val: 'ω' }, { label: 'Ω', val: 'Ω' },
        ]
    },
    {
        label: 'Units & Symbols',
        chars: [
            { label: '·', val: '·' }, { label: '×', val: '×' }, { label: '÷', val: '÷' },
            { label: '±', val: '±' }, { label: '≈', val: '≈' }, { label: '≠', val: '≠' },
            { label: '≤', val: '≤' }, { label: '≥', val: '≥' }, { label: '∞', val: '∞' },
            { label: '√', val: '√' }, { label: '∑', val: '∑' }, { label: '∝', val: '∝' },
            { label: '∆', val: '∆' }, { label: '∂', val: '∂' }, { label: '°', val: '°' },
        ]
    },
];

function FormulaToolbar({ onFixApplied }) {
    const [open, setOpen] = useState(false);

    const insertChar = useCallback((char) => {
        const el = document.activeElement;
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        const newVal = el.value.substring(0, start) + char + el.value.substring(end);
        setNativeValue(el, newVal);
        const newPos = start + char.length;
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(newPos, newPos);
        });
    }, []);

    const autoFixCurrent = useCallback(() => {
        const el = document.activeElement;
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) {
            alert('Click inside a text field first, then press Auto-fix.');
            return;
        }
        const fixed = autoFixPhysicsNotation(el.value);
        if (fixed !== el.value) {
            setNativeValue(el, fixed);
            if (onFixApplied) onFixApplied('Notation fixed automatically ✅');
        } else {
            if (onFixApplied) onFixApplied('Already correct — no changes needed');
        }
    }, [onFixApplied]);

    return (
        <div className="mb-2 flex items-center gap-2 flex-wrap">
            {/* Auto-fix button — most important for PDF paste workflow */}
            <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); autoFixCurrent(); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                title="Click inside a field, then click this to auto-convert m2→m², s-1→s⁻¹ etc."
            >
                🔧 Auto-fix Notation
            </button>

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#656CFF]/10 border border-[#656CFF]/30 text-[#656CFF] text-[10px] font-black uppercase tracking-widest hover:bg-[#656CFF]/20 transition-all"
            >
                <span className="text-sm">Σ</span> Insert Symbol {open ? '▲' : '▼'}
            </button>

            {open && (
                <div className="w-full mt-2 p-4 bg-[#0D0E12] border border-[#23262D] rounded-2xl space-y-3 animate-in fade-in duration-200">
                    {FORMULA_GROUPS.map(group => (
                        <div key={group.label}>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1.5">{group.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {group.chars.map(c => (
                                    <button
                                        key={c.val}
                                        type="button"
                                        onMouseDown={(e) => { e.preventDefault(); insertChar(c.val); }}
                                        className="min-w-[32px] h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-[#656CFF]/30 hover:border-[#656CFF]/50 transition-all active:scale-95"
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <p className="text-[9px] text-slate-600 font-semibold pt-1">
                        💡 Click a symbol to insert at cursor. Or paste from PDF — notation auto-fixes on paste!
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Custom DateTimePicker ───────────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DateTimePicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref  = useRef(null);

    // Parse value ("YYYY-MM-DDTHH:mm") or default to now
    const parsed = useMemo(() => {
        if (value) { const d = new Date(value); if (!isNaN(d)) return d; }
        return new Date();
    }, [value]);

    const [viewYear,  setViewYear]  = useState(parsed.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed.getMonth());
    const [selDate,   setSelDate]   = useState(value ? parsed : null);
    const [hour,      setHour]      = useState(parsed.getHours());
    const [minute,    setMinute]    = useState(parsed.getMinutes());

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const emit = useCallback((d, h, m) => {
        if (!d) return;
        const pad = n => String(n).padStart(2,'0');
        onChange(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`);
    }, [onChange]);

    // Calendar grid
    const cells = useMemo(() => {
        const first = new Date(viewYear, viewMonth, 1).getDay();
        const days  = new Date(viewYear, viewMonth+1, 0).getDate();
        const arr   = [];
        for (let i = 0; i < first; i++) arr.push(null);
        for (let d = 1; d <= days; d++) arr.push(d);
        return arr;
    }, [viewYear, viewMonth]);

    const selectDay = (day) => {
        if (!day) return;
        const d = new Date(viewYear, viewMonth, day);
        setSelDate(d);
        emit(d, hour, minute);
    };

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); };

    const isSelected = (day) => selDate &&
        selDate.getDate() === day && selDate.getMonth() === viewMonth && selDate.getFullYear() === viewYear;

    const isToday = (day) => {
        const t = new Date();
        return t.getDate() === day && t.getMonth() === viewMonth && t.getFullYear() === viewYear;
    };

    const displayValue = selDate
        ? `${MONTHS[selDate.getMonth()].slice(0,3)} ${selDate.getDate()}, ${selDate.getFullYear()}  ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`
        : 'Pick date & time';

    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o=>!o)}
                className="w-full flex items-center gap-3 bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none text-left hover:border-[#656CFF]/40"
            >
                <Calendar size={16} className="text-[#656CFF] flex-shrink-0" />
                <span className={selDate ? 'text-white' : 'text-slate-600'}>{displayValue}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-[999] top-full mt-2 left-0 w-[340px] bg-[#0D0E12] border border-[#23262D] rounded-3xl shadow-2xl shadow-black/60 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={prevMonth} className="h-8 w-8 rounded-xl bg-white/5 hover:bg-[#656CFF]/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-black text-white tracking-wide">{MONTHS[viewMonth]} {viewYear}</span>
                        <button type="button" onClick={nextMonth} className="h-8 w-8 rounded-xl bg-white/5 hover:bg-[#656CFF]/20 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, i) => (
                            <button
                                key={i}
                                type="button"
                                disabled={!day}
                                onClick={() => selectDay(day)}
                                className={`h-9 w-full rounded-xl text-xs font-black transition-all ${
                                    !day ? 'invisible' :
                                    isSelected(day) ? 'bg-[#656CFF] text-white shadow-lg shadow-[#656CFF]/30' :
                                    isToday(day) ? 'bg-[#656CFF]/10 text-[#656CFF] ring-1 ring-[#656CFF]/40' :
                                    'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Time selectors */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Time</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Hour</label>
                                <select
                                    value={hour}
                                    onChange={e => { const h = +e.target.value; setHour(h); emit(selDate, h, minute); }}
                                    className="w-full bg-[#13141A] border border-[#23262D] rounded-xl py-2 px-3 text-sm font-black text-white outline-none focus:border-[#656CFF]/50 appearance-none text-center"
                                >
                                    {Array.from({length:24},(_,i)=>i).map(h => (
                                        <option key={h} value={h}>{String(h).padStart(2,'0')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-2xl font-black text-slate-500 mt-4">:</div>
                            <div className="flex-1">
                                <label className="text-[9px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Minute</label>
                                <select
                                    value={minute}
                                    onChange={e => { const m = +e.target.value; setMinute(m); emit(selDate, hour, m); }}
                                    className="w-full bg-[#13141A] border border-[#23262D] rounded-xl py-2 px-3 text-sm font-black text-white outline-none focus:border-[#656CFF]/50 appearance-none text-center"
                                >
                                    {[0,5,10,15,20,25,30,35,40,45,50,55].map(m => (
                                        <option key={m} value={m}>{String(m).padStart(2,'0')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Confirm */}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-4 w-full py-2.5 bg-[#656CFF] hover:bg-[#545bd9] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Quiz Preview Modal ──────────────────────────────────────────────────── */
function QuizPreviewModal({ quiz, questions, onClose }) {
    const [selected, setSelected] = useState({});
    const ungraded = questions.filter(q => !q.correct_option).length;

    return (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-6">
            <div className="w-full max-w-3xl my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#656CFF] bg-[#656CFF]/10 px-3 py-1 rounded-full">Preview Mode</span>
                            {ungraded > 0 && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 bg-amber-400/10 px-3 py-1 rounded-full">⚠ {ungraded} ungraded</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{quiz || 'Untitled Quiz'}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Questions */}
                <div className="space-y-5">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-[#13141A] border border-[#23262D] rounded-3xl p-7">
                            <div className="flex flex-col md:flex-row gap-6 mb-5">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="h-7 w-7 rounded-lg bg-[#656CFF]/10 text-[#656CFF] flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">{idx+1}</div>
                                        <p className="text-sm font-bold text-white leading-relaxed">{q.text || <span className="text-slate-600 italic">No question text</span>}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {['a','b','c','d','e'].map(opt => {
                                            const val = q[`option_${opt}`];
                                            const imgUrl = q[`option_${opt}_image_url`];
                                            if (!val && !imgUrl) return null;
                                            const letter = opt.toUpperCase();
                                            const isCorrect = q.correct_option === letter;
                                            const isSel    = selected[idx] === letter;
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setSelected(s => ({...s, [idx]: letter}))}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                                                        isSel
                                                            ? isCorrect
                                                                ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#10B981]'
                                                                : 'bg-red-500/10 border-red-500/50 text-red-400'
                                                            : 'bg-white/[0.02] border-[#23262D] text-slate-400 hover:border-[#656CFF]/40 hover:text-white'
                                                    }`}
                                                >
                                                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                                        isSel ? (isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white') : 'bg-white/5 text-slate-500'
                                                    }`}>{letter}</span>
                                                    <div className="flex flex-col gap-2">
                                                        {val && <span className="text-xs font-bold">{val}</span>}
                                                        {imgUrl && (
                                                            <img
                                                                src={`${API_URL}${imgUrl}`}
                                                                alt={`Option ${letter}`}
                                                                className="max-h-24 object-contain rounded-lg border border-[#23262D] bg-black/40 p-1"
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {q.image_url && (
                                    <div className="w-full md:w-1/3 flex items-center justify-center bg-black/20 rounded-2xl p-4 border border-[#23262D] shrink-0">
                                        <img
                                            src={`${API_URL}${q.image_url}`}
                                            alt={`Preview Q${idx + 1}`}
                                            className="max-h-48 object-contain rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>
                            {!q.correct_option && (
                                <p className="text-[9px] text-amber-400/60 font-bold">⚠ No correct answer set</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}



const QuizzesPage = () => {
    // Mode: 'list', 'create', or 'view'
    const [mode, setMode] = useState('list');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewQuiz, setPreviewQuiz] = useState(null);

    // New Quiz State
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [currentQuizStatus, setCurrentQuizStatus] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [expiryMode, setExpiryMode] = useState('end_time');
    const [expiryDays, setExpiryDays] = useState(1);
    const [questions, setQuestions] = useState([
        { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: '', image_url: '' }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fixToast, setFixToast] = useState(null); // { msg } | null
    const [isGenerating, setIsGenerating] = useState(false);
    const [showJsonModal, setShowJsonModal] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonImportIndex, setJsonImportIndex] = useState(null);

    const handlePdfUpload = async (file) => {
        setIsGenerating(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${API_URL}/quizzes/generate-from-pdf`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to generate quiz from PDF.');
            }
            const data = await response.json();
            if (data.questions && data.questions.length > 0) {
                const formatted = data.questions.map(q => ({
                    text: q.text || '',
                    option_a: q.option_a || '',
                    option_b: q.option_b || '',
                    option_c: q.option_c || '',
                    option_d: q.option_d || '',
                    option_e: q.option_e || '',
                    correct_option: q.correct_option || '',
                    image_url: q.image_url || '',
                    option_a_image_url: q.option_a_image_url || '',
                    option_b_image_url: q.option_b_image_url || '',
                    option_c_image_url: q.option_c_image_url || '',
                    option_d_image_url: q.option_d_image_url || '',
                    option_e_image_url: q.option_e_image_url || ''
                }));
                setQuestions(formatted);
                setFixToast(`Generated ${formatted.length} questions successfully! ✨`);
            } else {
                alert('No questions could be extracted from the PDF.');
            }
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImportJson = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            
            const newQuestions = items.map(q => ({
                text: q.text || '',
                option_a: q.option_a || '',
                option_b: q.option_b || '',
                option_c: q.option_c || '',
                option_d: q.option_d || '',
                option_e: q.option_e || '',
                correct_option: (q.correct_option || '').toUpperCase(),
                image_url: q.image_url || '',
                option_a_image_url: q.option_a_image_url || '',
                option_b_image_url: q.option_b_image_url || '',
                option_c_image_url: q.option_c_image_url || '',
                option_d_image_url: q.option_d_image_url || '',
                option_e_image_url: q.option_e_image_url || ''
            }));
            
            if (jsonImportIndex !== null && jsonImportIndex !== undefined) {
                const newQList = [...questions];
                newQList[jsonImportIndex] = newQuestions[0];
                setQuestions(newQList);
                setFixToast(`Successfully populated Question ${jsonImportIndex + 1}! 📋`);
            } else {
                if (questions.length === 1 && !questions[0].text && !questions[0].option_a) {
                    setQuestions(newQuestions);
                } else {
                    setQuestions([...questions, ...newQuestions]);
                }
                setFixToast(`Successfully imported ${newQuestions.length} questions! 📋`);
            }
            setShowJsonModal(false);
            setJsonInput('');
            setJsonImportIndex(null);
        } catch (err) {
            alert(`Invalid JSON format: ${err.message}`);
        }
    };

    // Fetch Quizzes & Batches
    useEffect(() => {
        fetchQuizzes();
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_URL}/batches`);
            if (res.ok) setBatches(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/quizzes`);
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
    const addQuestion = () => {
        setQuestions([...questions, { text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: '', image_url: '', option_a_image_url: '', option_b_image_url: '', option_c_image_url: '', option_d_image_url: '', option_e_image_url: '' }]);
    };

    const removeQuestion = (index) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const resetForm = () => {
        setMode('list');
        setEditingQuizId(null);
        setCurrentQuizStatus(false);
        setQuizTitle('');
        setSelectedBatches([]);
        setScheduledTime('');
        setDurationMinutes(30);
        setExpiryMode('end_time');
        setExpiryDays(1);
        setQuestions([{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: '', image_url: '', option_a_image_url: '', option_b_image_url: '', option_c_image_url: '', option_d_image_url: '', option_e_image_url: '' }]);
    };

    const handleEditQuiz = (quiz) => {
        setMode('create');
        setEditingQuizId(quiz.id);
        setCurrentQuizStatus(false); // Automatically show as unpublished (Draft) and ask option to publish on edit
        setQuizTitle(quiz.title || '');
        setSelectedBatches(quiz.class_name ? quiz.class_name.split(', ') : []);
        setScheduledTime(quiz.scheduled_time || '');
        setDurationMinutes(quiz.duration_minutes || 30);
        setExpiryMode(quiz.expiry_mode || 'end_time');
        setExpiryDays(quiz.expiry_days || 1);
        setQuestions(quiz.questions && quiz.questions.length > 0 
            ? quiz.questions.map(q => ({ 
                ...q, 
                image_url: q.image_url || '',
                option_a_image_url: q.option_a_image_url || '',
                option_b_image_url: q.option_b_image_url || '',
                option_c_image_url: q.option_c_image_url || '',
                option_d_image_url: q.option_d_image_url || '',
                option_e_image_url: q.option_e_image_url || ''
            })) 
            : [{ text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_option: 'A', image_url: '', option_a_image_url: '', option_b_image_url: '', option_c_image_url: '', option_d_image_url: '', option_e_image_url: '' }]);
    };



    const handleSaveQuiz = async () => {
        if (!quizTitle) return alert("Quiz Title is required");
        if (selectedBatches.length === 0) return alert("Please select at least one batch");
        if (questions.length === 0) return alert("Add at least one question");
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].correct_option) {
                return alert(`Please select a correct answer for Question ${i + 1}`);
            }
        }

        setIsSubmitting(true);
        const payload = {
            title: quizTitle,
            description: "Generated Quiz",
            class_name: selectedBatches.join(', '),
            is_published: currentQuizStatus,
            scheduled_time: scheduledTime || null,
            duration_minutes: durationMinutes,
            expiry_mode: expiryMode,
            expiry_days: expiryDays,
            questions: questions
        };

        try {
            const endpoint = editingQuizId ? `${API_URL}/quizzes/${editingQuizId}` : `${API_URL}/quizzes`;
            const method = editingQuizId ? 'PUT' : 'POST';
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingQuizId ? "Quiz Updated Successfully!" : "Quiz Saved Successfully!");
                resetForm();
                fetchQuizzes();
            } else {
                alert("Failed to save quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const publishQuiz = async (quizId) => {
        try {
            const res = await fetch(`${API_URL}/quizzes/${quizId}/publish`, { method: 'PUT' });
            if (res.ok) {
                alert("Quiz Published!");
                fetchQuizzes();
            } else {
                alert("Failed to publish quiz");
            }
        } catch (err) {
            console.error(err);
            alert("Error publishing quiz");
        }
    };

    const deleteQuiz = async (id) => {
        if (!window.confirm("Delete this quiz permanently?")) return;
        try {
            const res = await fetch(`${API_URL}/quizzes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchQuizzes();
        } catch (err) {
            console.error("Failed to delete quiz:", err);
        }
    };

    if (mode === 'create') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">{editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Set up your quiz details and questions</p>
                    </div>
                    <button onClick={resetForm} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                </div>

                <div className="admin-card p-10 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Quiz Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none"
                                    placeholder="e.g. Thermodynamics Mastery Test"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                            <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                                    <DateTimePicker
                                        value={scheduledTime}
                                        onChange={setScheduledTime}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Duration (Min)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none transition-all"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Batches</label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-[#0D0E12] border border-[#23262D] rounded-2xl max-h-[160px] overflow-y-auto custom-scrollbar">
                                    {/* Knowledge Hub Option */}
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedBatches.includes('knowledge hub') ? 'bg-[#656CFF]/10 border-[#656CFF]/50 text-[#656CFF]' : 'bg-transparent border-[#23262D] text-slate-500 hover:border-slate-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedBatches.includes('knowledge hub')}
                                            onChange={e => {
                                                const arr = selectedBatches;
                                                if (e.target.checked) setSelectedBatches([...arr, 'knowledge hub']);
                                                else setSelectedBatches(arr.filter(x => x !== 'knowledge hub'));
                                            }}
                                        />
                                        <span className="text-[11px] font-black uppercase tracking-tight text-indigo-400">knowledge hub ⚡</span>
                                    </label>

                                    {batches.map(b => (
                                        <label key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedBatches.includes(b.name) ? 'bg-[#656CFF]/10 border-[#656CFF]/50 text-[#656CFF]' : 'bg-transparent border-[#23262D] text-slate-500 hover:border-slate-700'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedBatches.includes(b.name)}
                                                onChange={e => {
                                                    const arr = selectedBatches;
                                                    if (e.target.checked) setSelectedBatches([...arr, b.name]);
                                                    else setSelectedBatches(arr.filter(x => x !== b.name));
                                                }}
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-tight">{b.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Quiz Availability</label>
                                <select
                                    className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-3.5 px-5 text-sm font-bold text-white focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none appearance-none"
                                    value={expiryMode}
                                    onChange={(e) => setExpiryMode(e.target.value)}
                                >
                                    <option value="end_time">Standard (Ends at time)</option>
                                    <option value="one_day">Extend 1 Day</option>
                                    <option value="custom_days">Custom Days</option>
                                    <option value="never">No Expiry</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Publish Status</label>
                                <div className="flex items-center gap-3 p-3.5 bg-[#0D0E12] border border-[#23262D] rounded-2xl h-[50px]">
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={currentQuizStatus}
                                            onChange={(e) => setCurrentQuizStatus(e.target.checked)}
                                        />
                                        <div className="w-10 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                                        <span className="ms-3 text-xs font-black uppercase tracking-wider text-slate-400 peer-checked:text-white">
                                            {currentQuizStatus ? "Published" : "Draft (Hidden)"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-white tracking-tight">Questions</h2>
                        <span className="text-xs font-black text-[#656CFF] bg-[#656CFF]/10 px-3 py-1.5 rounded-full uppercase tracking-widest">{questions.length} Items</span>
                    </div>

                    {/* PDF Quiz Generator Zone */}
                    <div className="admin-card p-6 border border-dashed border-[#656CFF]/30 bg-[#656CFF]/5 rounded-[2rem] space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✨</span>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Quiz Importer</h3>
                                    <p className="text-xs text-slate-400">Upload an exam PDF to extract questions via Gemini AI, or paste questions in JSON format directly</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowJsonModal(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    📋 Paste JSON
                                </button>
                                {isGenerating && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#656CFF] bg-[#656CFF]/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" /> Processing PDF...
                                    </span>
                                )}
                            </div>
                        </div>

                        <div 
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type === 'application/pdf') {
                                    await handlePdfUpload(file);
                                } else {
                                    alert('Please upload a valid PDF file.');
                                }
                            }}
                            className="border border-[#23262D] bg-[#0D0E12]/50 hover:bg-[#0D0E12] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group min-h-[120px]"
                            onClick={() => document.getElementById('pdf-file-input').click()}
                        >
                            <input 
                                id="pdf-file-input"
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) await handlePdfUpload(file);
                                }}
                            />
                            <UploadCloud className="text-slate-500 group-hover:text-[#656CFF] transition-colors" size={32} />
                            <p className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                                Drag & Drop your exam PDF here, or <span className="text-[#656CFF] underline">browse files</span>
                            </p>
                            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Supports Tamil (Bamini/Unicode) and physics variables</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {questions.map((q, idx) => (
                            <div key={idx} className="admin-card p-8 group relative border-l-4 border-l-[#656CFF]">
                                <div className="absolute top-6 right-6">
                                    <button onClick={() => removeQuestion(idx)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pr-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 bg-[#656CFF]/10 text-[#656CFF] flex items-center justify-center rounded-lg font-black text-xs">
                                            Q{idx + 1}
                                        </div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-80">Question Content</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setJsonImportIndex(idx);
                                            setShowJsonModal(true);
                                        }}
                                        className="px-3 py-1.5 bg-[#656CFF]/10 hover:bg-[#656CFF]/30 border border-[#656CFF]/20 text-[#656CFF] text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5"
                                    >
                                        📋 Paste JSON
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <FormulaToolbar onFixApplied={(msg) => setFixToast(msg)} />
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <textarea
                                                className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-4 px-6 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#656CFF]/20 transition-all outline-none"
                                                placeholder="Paste from PDF or type your question — superscripts auto-fix on paste!"
                                                rows="3"
                                                value={q.text}
                                                onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                                onPaste={(e) => {
                                                    const raw = (e.clipboardData || window.clipboardData).getData('text');
                                                    const fixed = autoFixPhysicsNotation(raw);
                                                    if (fixed !== raw) {
                                                        e.preventDefault();
                                                        const el = e.target;
                                                        const start = el.selectionStart ?? el.value.length;
                                                        const end = el.selectionEnd ?? el.value.length;
                                                        const newVal = el.value.substring(0, start) + fixed + el.value.substring(end);
                                                        updateQuestion(idx, 'text', newVal);
                                                        setFixToast('Notation auto-fixed from paste ✅');
                                                        requestAnimationFrame(() => {
                                                            el.setSelectionRange(start + fixed.length, start + fixed.length);
                                                        });
                                                    }
                                                }}
                                            ></textarea>
                                        </div>
                                        <div className="w-full md:w-56 shrink-0 flex flex-col items-center justify-center border border-dashed border-[#23262D] rounded-2xl p-3 bg-[#0D0E12]/50 hover:bg-[#0D0E12] transition-colors relative group min-h-[96px]">
                                            {q.image_url ? (
                                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                    <img
                                                        src={`${API_URL}${q.image_url}`}
                                                        alt="Question Graphic"
                                                        className="max-h-24 object-contain rounded-lg shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(idx, 'image_url', '')}
                                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110"
                                                        title="Remove Image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center p-2">
                                                    <Plus size={20} className="text-slate-500 mb-1" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Add Image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            try {
                                                                const res = await fetch(`${API_URL}/upload`, {
                                                                    method: 'POST',
                                                                    body: formData
                                                                });
                                                                if (res.ok) {
                                                                    const data = await res.json();
                                                                    updateQuestion(idx, 'image_url', data.url);
                                                                } else {
                                                                    alert('Image upload failed');
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Image upload error');
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                            <div key={opt} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{`Option ${opt.toUpperCase()}`}</label>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-[#0D0E12] border border-[#23262D] rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-[#656CFF]/50 outline-none transition-all"
                                                        placeholder="Option text (optional)"
                                                        value={q[`option_${opt}`]}
                                                        onChange={(e) => updateQuestion(idx, `option_${opt}`, e.target.value)}
                                                        onPaste={(e) => {
                                                            const raw = (e.clipboardData || window.clipboardData).getData('text');
                                                            const fixed = autoFixPhysicsNotation(raw);
                                                            if (fixed !== raw) {
                                                                e.preventDefault();
                                                                const el = e.target;
                                                                const start = el.selectionStart ?? el.value.length;
                                                                const end = el.selectionEnd ?? el.value.length;
                                                                const newVal = el.value.substring(0, start) + fixed + el.value.substring(end);
                                                                updateQuestion(idx, `option_${opt}`, newVal);
                                                                setFixToast('Notation auto-fixed from paste ✅');
                                                                requestAnimationFrame(() => {
                                                                    el.setSelectionRange(start + fixed.length, start + fixed.length);
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <div className="shrink-0 w-16 h-10 border border-dashed border-[#23262D] rounded-xl bg-[#0D0E12]/50 hover:bg-[#0D0E12] transition-colors relative flex items-center justify-center overflow-hidden">
                                                        {q[`option_${opt}_image_url`] ? (
                                                            <div className="relative w-full h-full flex items-center justify-center p-1">
                                                                <img
                                                                    src={`${API_URL}${q[`option_${opt}_image_url`]}`}
                                                                    alt=""
                                                                    className="w-full h-full object-contain rounded"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQuestion(idx, `option_${opt}_image_url`, '')}
                                                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                                    title="Remove Option Image"
                                                                >
                                                                    <X size={8} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center">
                                                                <Plus size={14} className="text-slate-500" />
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Img</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        try {
                                                                            const res = await fetch(`${API_URL}/upload`, {
                                                                                method: 'POST',
                                                                                body: formData
                                                                            });
                                                                            if (res.ok) {
                                                                                const data = await res.json();
                                                                                updateQuestion(idx, `option_${opt}_image_url`, data.url);
                                                                            } else {
                                                                                alert('Image upload failed');
                                                                            }
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert('Image upload error');
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3 ml-1">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Correct Answer</label>
                                                {!q.correct_option && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded-full">⚠ Not set</span>
                                                )}
                                            </div>
                                            <div className="flex bg-[#0D0E12] p-1 rounded-xl border border-[#23262D]">
                                                {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => updateQuestion(idx, 'correct_option', opt)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${q.correct_option === opt ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="bg-white/5 border-2 border-dashed border-[#23262D] rounded-[2rem] p-10 text-center hover:bg-[#656CFF]/10 hover:border-[#656CFF]/50 transition-all group active:scale-[0.98]"
                        >
                            <Plus className="mx-auto text-slate-600 group-hover:text-[#656CFF] mb-3 transition-colors" size={32} />
                            <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Append New Question Instance</span>
                        </button>
                    </div>
                </div>

                <div className="pt-10 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="h-16 bg-white/5 hover:bg-white/10 text-white rounded-2xl px-10 font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-3 active:scale-95 border border-white/10 hover:border-[#656CFF]/40"
                    >
                        <Eye size={20} className="text-[#656CFF]" /> Preview
                    </button>
                    <button onClick={handleSaveQuiz} disabled={isSubmitting} className="h-16 bg-[#656CFF] text-white rounded-2xl px-12 font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        {isSubmitting ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>

                {/* JSON Import Modal */}
                {showJsonModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-[#15171C] border border-[#23262D] rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in scale-in duration-300">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0D0E12]/50">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                        {jsonImportIndex !== null ? `Import JSON to Question ${jsonImportIndex + 1}` : 'Paste JSON Questions'}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                        {jsonImportIndex !== null ? `Populate fields for Question ${jsonImportIndex + 1} from JSON` : 'Paste a JSON question object or a JSON array of questions'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setShowJsonModal(false); setJsonInput(''); }}
                                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex flex-col gap-4">
                                    <div 
                                        onClick={() => document.getElementById('json-file-input').click()}
                                        className="border border-dashed border-[#23262D] hover:border-[#656CFF]/55 bg-[#0D0E12]/50 hover:bg-[#0D0E12] rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group"
                                    >
                                        <input 
                                            id="json-file-input"
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setJsonInput(event.target.result);
                                                };
                                                reader.readAsText(file);
                                            }}
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#656CFF] group-hover:text-white transition-colors">📂 Upload .json file</span>
                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Click to browse your computer</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Or Paste JSON text below</label>
                                        </div>
                                        <textarea
                                            className="w-full bg-[#0D0E12] border border-[#23262D] rounded-2xl py-4 px-5 text-xs font-mono text-indigo-400 placeholder:text-slate-700 focus:ring-2 focus:ring-[#656CFF]/20 focus:border-[#656CFF]/50 transition-all outline-none"
                                            rows="10"
                                            placeholder={`[\n  {\n    "text": "01. வோல்ட் (V) என்பது எதற்கான SI அலகாகும்?",\n    "option_a": "சக்தி",\n    "option_b": "வலி",\n    "option_c": "வேலை",\n    "option_d": "மின்னழுத்தம்",\n    "option_e": "மின்திறன்",\n    "correct_option": "D"\n  }\n]`}
                                            value={jsonInput}
                                            onChange={(e) => setJsonInput(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => { setShowJsonModal(false); setJsonInput(''); }}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleImportJson(jsonInput)}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                    >
                                        Import Questions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-10">
            {/* Preview Modal (create mode) */}
            {showPreview && (
                <QuizPreviewModal
                    quiz={quizTitle}
                    questions={questions}
                    onClose={() => setShowPreview(false)}
                />
            )}
            {/* Preview Modal (list mode) */}
            {previewQuiz && (
                <QuizPreviewModal
                    quiz={previewQuiz.title}
                    questions={previewQuiz.questions || []}
                    onClose={() => setPreviewQuiz(null)}
                />
            )}
            {/* Smart Paste Toast Notification */}
            {fixToast && <FixToast msg={fixToast} onDone={() => setFixToast(null)} />}
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 italic italic">
                        <Layers size={32} className="text-[#656CFF]" /> All Quizzes
                    </h1>
                    <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                        Create and manage your student quizzes
                    </p>
                </div>
                <button
                    onClick={() => setMode('create')}
                    className="h-14 bg-[#656CFF] text-white rounded-2xl px-10 font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#656CFF]/30 hover:bg-[#545bd9] transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={20} /> Create Quiz
                </button>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#656CFF] mb-4" size={40} />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Loading Quizzes...</span>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="py-32 text-center border-2 border-dashed border-[#23262D] rounded-[3rem] bg-white/[0.01]">
                    <Layers className="mx-auto text-slate-800 mb-6 opacity-30" size={64} />
                    <h4 className="text-xl font-black text-slate-700 uppercase tracking-tight mb-2">No Quizzes Found</h4>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Create your first quiz to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quizzes.map((q) => (
                        <div key={q.id} className="admin-card group p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-[#656CFF]/30 transition-all bg-[#15171C]">
                            <div className="flex items-center gap-8 w-full flex-1">
                                <div className="h-16 w-16 rounded-2xl bg-[#656CFF]/10 flex items-center justify-center text-[#656CFF] flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Clock size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[9px] font-black text-[#656CFF] uppercase tracking-[0.3em]">{q.class_name}</span>
                                        <div className={`h-1.5 w-1.5 rounded-full ${q.is_published ? 'bg-[#10B981]' : 'bg-slate-700'}`} />
                                    </div>
                                    <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight mb-2 truncate group-hover:text-[#656CFF] transition-colors">{q.title}</h4>
                                    <div className="flex items-center gap-6 mt-3">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <Calendar size={12} /> {new Date(q.scheduled_time).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <Clock size={12} /> {q.duration_minutes} Min
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                 {!q.is_published && (
                                     <button onClick={() => publishQuiz(q.id)} className="h-12 px-6 flex items-center gap-3 rounded-2xl bg-[#10B981]/10 text-[#10B981] text-[9px] font-black uppercase tracking-widest hover:bg-[#10B981] hover:text-white transition-all shadow-xl">
                                         <CheckCircle size={16} /> Publish Now
                                     </button>
                                 )}
                                 <button
                                     onClick={() => {
                                         const link = `${window.location.origin}/dashboard?quiz_id=${q.id}`;
                                         navigator.clipboard.writeText(link);
                                         alert("Quiz link copied to clipboard!");
                                     }}
                                     className="h-12 w-12 rounded-2xl bg-[#FEBC2E]/10 text-[#FEBC2E] hover:bg-[#FEBC2E] hover:text-[#0a0a0a] transition-all flex items-center justify-center"
                                     title="Copy direct shareable quiz link"
                                 >
                                     <Share2 size={20} />
                                 </button>
                                 <button
                                     onClick={() => setPreviewQuiz(q)}
                                     className="h-12 w-12 rounded-2xl bg-[#656CFF]/10 text-[#656CFF] hover:bg-[#656CFF] hover:text-white transition-all flex items-center justify-center"
                                     title="Preview quiz"
                                 >
                                     <Eye size={20} />
                                 </button>
                                 <button onClick={() => handleEditQuiz(q)} className="h-12 w-12 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                                     <Pencil size={20} />
                                 </button>
                                 <button onClick={() => deleteQuiz(q.id)} className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl">
                                     <Trash2 size={20} />
                                 </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default QuizzesPage;

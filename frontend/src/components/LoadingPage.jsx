import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.jpeg';

const LoadingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Longer timeout to enjoy the animation
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#03060f] overflow-hidden relative">

            {/* Background glowing gradients */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.4, 0.2], scale: [0.8, 1.2, 1] }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="absolute w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-600 blur-[130px] opacity-20 pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                className="relative z-10 flex flex-col items-center justify-center"
            >
                {/* Orbital Rings representing Physics/Atoms */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1000px' }}>
                    <motion.div
                        initial={{ rotateX: 65, rotateY: 0, rotateZ: 0, scale: 0 }}
                        animate={{ rotateZ: 360, scale: [0, 1.8, 1.4] }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        className="absolute w-64 h-64 border-t-2 border-l border-blue-400/50 rounded-full"
                    />
                    <motion.div
                        initial={{ rotateX: 65, rotateY: 60, rotateZ: 0, scale: 0 }}
                        animate={{ rotateZ: -360, scale: [0, 1.9, 1.5] }}
                        transition={{ duration: 3.2, ease: "easeInOut", delay: 0.1 }}
                        className="absolute w-64 h-64 border-t-2 border-r border-indigo-500/50 rounded-full"
                    />
                    <motion.div
                        initial={{ rotateX: 65, rotateY: 120, rotateZ: 0, scale: 0 }}
                        animate={{ rotateZ: 360, scale: [0, 2, 1.6] }}
                        transition={{ duration: 3.4, ease: "easeInOut", delay: 0.2 }}
                        className="absolute w-64 h-64 border-b-2 border-l border-purple-400/50 rounded-full"
                    />
                </div>

                {/* The Logo Container */}
                <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-44 h-44 p-1.5 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-white/10 to-purple-500/20 backdrop-blur-xl shadow-[0_0_60px_rgba(59,130,246,0.3)] border border-white/10"
                >
                    <div className="w-full h-full rounded-[22px] overflow-hidden bg-black/60 relative flex items-center justify-center">
                        <img src={logo} alt="Intelligent Physics" className="w-[85%] h-[85%] object-contain" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Typography */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                className="mt-20 text-center z-10"
            >
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 tracking-[0.2em] uppercase origin-center">
                    Intelligent Physics
                </h1>

                {/* Sweeping Light Loading effect */}
                <motion.div
                    className="h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mt-6"
                    initial={{ width: "0%", opacity: 0 }}
                    animate={{ width: "100%", opacity: [0, 1, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
                />
            </motion.div>

        </div>
    );
};

export default LoadingPage;

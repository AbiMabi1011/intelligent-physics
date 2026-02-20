import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo3D from './Logo3D'; // Import the 3D Logo

const LoadingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect after 5 seconds to ensure animation is seen
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden perspective-1000">
            <div className="flex flex-col items-center justify-center space-y-8 animate-slide-up">
                {/* 3D Flipping Logo */}
                <Logo3D />

                {/* Subtitle */}

            </div>
        </div>
    );
};

export default LoadingPage;

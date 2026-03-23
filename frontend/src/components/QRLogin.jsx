import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Loader2, QrCode } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QRLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        scanner.render(onScanSuccess, onScanError);

        async function onScanSuccess(result) {
            scanner.clear();
            handleQRLogin(result);
        }

        function onScanError(err) {
            console.warn(err);
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    const handleQRLogin = async (resultCode) => {
        setIsLoading(true);
        setError('');
        
        try {
            // QR code should contain a JSON payload like {'user_id': 1}
            let payload;
            try {
                payload = JSON.parse(resultCode);
            } catch (e) {
                // If the QR code just has the integer ID
                payload = { user_id: parseInt(resultCode) };
                if (isNaN(payload.user_id)) {
                    throw new Error("Invalid QR code format.");
                }
            }

            const response = await fetch(`${API_URL}/auth/qr-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                setError(data.detail || 'Failed to login via QR code.');
                setIsLoading(false);
                return;
            }
            
            setSuccess(true);
            login(data);
            setTimeout(() => {
                 navigate(data.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
            }, 1000);
            
        } catch (err) {
            setError(err.message || 'Error processing QR code.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center flex-col space-y-4">
            <div className="w-full text-center">
                <QrCode size={40} className="mx-auto text-blue-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">Scan QR Code to Login</h3>
                <p className="text-sm text-gray-500 mb-4">Hold your ID card or QR code up to the camera.</p>
            </div>
            
            {error && (
                <div className="w-full rounded-lg bg-red-50 p-3 text-red-600 text-sm font-medium border border-red-100 text-center animate-shake">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="w-full rounded-lg bg-green-50 p-3 text-green-700 text-sm font-medium border border-green-100 text-center">
                    Login successful! Redirecting...
                </div>
            )}

            {isLoading || success ? (
                <div className="flex py-10 flex-col items-center justify-center">
                    {!success && <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />}
                </div>
            ) : (
                <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50"></div>
            )}
            
            <style>{`
                #reader__scan_region { background: white; }
                #reader button { background: #2563EB; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                #reader button:hover { background: #1D4ED8; }
            `}</style>
        </div>
    );
};

export default QRLogin;

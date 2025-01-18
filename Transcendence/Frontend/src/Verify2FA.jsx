import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verify2FA.css'

function Verify2FA() {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState('');
    const [attempts, setAttempts] = useState(0); // Track the number of failed attempts
    const navigate = useNavigate();

    useEffect(() => {
        const isVerifying2FA = localStorage.getItem('isVerifying2FA');
        if (!isVerifying2FA) {
            navigate('/login');
        }
    }, [navigate]);

    const handleVerify = async () => {
        try {
            const response = await fetch('/api/verify-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ otp, user_id: localStorage.getItem('userId') }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.removeItem('isVerifying2FA'); // Clear flag
                navigate('/menu');
            } else {
                const errorData = await response.json();
                setStatus(errorData.error);
                setAttempts(prevAttempts => {
                    const newAttempts = prevAttempts + 1;
                    if (newAttempts >= 3) {
                        localStorage.removeItem('isVerifying2FA'); // Clear flag
                        navigate('/login');
                    }
                    return newAttempts;
                });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setStatus('Failed to verify OTP');
            setAttempts(prevAttempts => {
                const newAttempts = prevAttempts + 1;
                if (newAttempts >= 3) {
                    localStorage.removeItem('isVerifying2FA'); // Clear flag
                    navigate('/login');
                }
                return newAttempts;
            });
        }
    };

    const handleQuit = () => {
        localStorage.removeItem('isVerifying2FA'); // Clear flag
        navigate('/login');
    };

    return (
        <div className="a2fBody">
            <div className='a2f'>
                <h2 className='a2fText'>Verify 2FA</h2>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                />
                <button onClick={handleVerify}>Verify OTP</button>
                <button onClick={handleQuit}>Quit</button>
                {status && <p>{status}</p>}
                {attempts > 0 && <p>Remaining attempts: {3 - attempts}</p>}
            </div>
        </div>
    );
}

export default Verify2FA;

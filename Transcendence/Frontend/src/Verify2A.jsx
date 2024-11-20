import React, { useState } from 'react';

function Verify2FA() {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState('');

    const handleVerify = async () => {
        try {
            const response = await fetch('/api/verify-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ otp }),
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(data.success);
            } else {
                const errorData = await response.json();
                setStatus(errorData.error);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setStatus('Failed to verify OTP');
        }
    };

    return (
        <div>
            <h2>Verify 2FA</h2>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
            />
            <button onClick={handleVerify}>Verify OTP</button>
            {status && <p>{status}</p>}
        </div>
    );
}

export default Verify2FA;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Edit.css'; // Import the CSS file

const pepeImages = [
    '/media/profile_pictures/pepe_boxe.png',
    '/media/profile_pictures/pepe_glasses.png',
    '/media/profile_pictures/pepe_thumbup.png',
    '/media/profile_pictures/pepe-ohhh.png',
    '/media/profile_pictures/pepe.png'
];

const EditAccount = () => {
    const [userDetails, setUserDetails] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        profilePicture: null,
    });
    const [preview, setPreview] = useState(pepeImages[pepeImages.length - 1]); // Default to the last image
    const [currentImageIndex, setCurrentImageIndex] = useState(pepeImages.length - 1);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (/\.(jpeg|jpg|gif|png)$/i.test(file.name)) {
                setUserDetails((prevDetails) => ({
                    ...prevDetails,
                    profilePicture: file,
                }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
                setIsFileUploaded(true);
                setError(null);
            } else {
                setError('Invalid file type. Only images are allowed.');
            }
        } else {
            setError('No file selected.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', userDetails.username);
        formData.append('email', userDetails.email);
        formData.append('firstName', userDetails.firstName);
        formData.append('lastName', userDetails.lastName);
        if (isFileUploaded && userDetails.profilePicture) {
            formData.append('profilePicture', userDetails.profilePicture);
        } else {
            formData.append('profilePictureUrl', preview);
        }

        try {
            const response = await fetch('/api/edit-account/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formData,
            });
            if (response.ok) {
                navigate('/menu');
            } else {
                const errorData = await response.json();
                setError(`Failed to update account: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            setError(`Error updating account: ${error.message}`);
        }
    };

    const handleNextImage = () => {
        const nextIndex = (currentImageIndex + 1) % pepeImages.length;
        setCurrentImageIndex(nextIndex);
        if (!isFileUploaded) {
            setPreview(pepeImages[nextIndex]);
        }
    };

    const handlePrevImage = () => {
        const prevIndex = (currentImageIndex - 1 + pepeImages.length) % pepeImages.length;
        setCurrentImageIndex(prevIndex);
        if (!isFileUploaded) {
            setPreview(pepeImages[prevIndex]);
        }
    };

    return (
        <div className='accountBody'>
            <header className='accountHeader'>
                <h2 className='accountLogo' onClick={()=>navigate('/menu')}>Pong</h2>
                <nav className='accountNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>Profile</div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>Account</div>
                </nav>
            </header>
            <div className="accountWrapper">
                <form className='accountForm' onSubmit={handleSubmit}>
                    <label className='accountLabel'>
                        Username:
                        <input className='accountInput' type="text" name="username" value={userDetails.username} onChange={handleChange} />
                    </label>
                    <label className='accountLabel'>
                        Email:
                        <input className='accountInput' type="email" name="email" value={userDetails.email} onChange={handleChange} />
                    </label>
                    <label className='accountLabel'>
                        First Name:
                        <input className='accountInput' type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} />
                    </label>
                    <label className='accountLabel'>
                        Last Name:
                        <input className='accountInput' type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} />
                    </label>
                    <label className='accountLabel'>
                        Profile Picture:
                        <input className='accountImage' type="file" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <div className="image-carousel">
                        <button className='carouselButton' type="button" onClick={handlePrevImage}>←</button>
                        {preview && <img className='carouselImage' src={preview} alt="Profile Preview" />}
                        <button className='carouselButton' type="button" onClick={handleNextImage}>→</button>
                    </div>
                    <button className='accountChanges' type="submit">Save Changes</button>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default EditAccount;
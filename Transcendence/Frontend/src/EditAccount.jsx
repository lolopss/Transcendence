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
        }
        console.log('Selected file path:', file ? file.name : 'No file selected');
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
                console.error('Failed to update account:', errorData);
            }
        } catch (error) {
            console.error('Error updating account:', error);
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
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" name="username" value={userDetails.username} onChange={handleChange} />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={userDetails.email} onChange={handleChange} />
                </label>
                <label>
                    First Name:
                    <input type="text" name="firstName" value={userDetails.firstName} onChange={handleChange} />
                </label>
                <label>
                    Last Name:
                    <input type="text" name="lastName" value={userDetails.lastName} onChange={handleChange} />
                </label>
                <label>
                    Profile Picture:
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                <div className="image-carousel">
                    <button type="button" onClick={handlePrevImage}>←</button>
                    {preview && <img src={preview} alt="Profile Preview" />}
                    <button type="button" onClick={handleNextImage}>→</button>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default EditAccount;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditAccount = () => {
    const [userDetails, setUserDetails] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        profilePicture: null,
    });
    const [preview, setPreview] = useState('/media/profile_pictures/pepe.jpg');
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
        if (userDetails.profilePicture) {
            formData.append('profilePicture', userDetails.profilePicture);
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
                console.error('Failed to update account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
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
                {preview && <img src={preview} alt="Profile Preview" />}
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default EditAccount;
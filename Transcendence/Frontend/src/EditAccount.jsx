import React, { useEffect, useState } from 'react';
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
    const [language, setLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
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
    const [connectedFrom42API, setConnectedFrom42API] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('/api/user-details/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setLanguage(data.language);
                    loadTranslations(data.language);
                    setConnectedFrom42API(data.connected_from_42_api);
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    const loadTranslations = async (language) => {
        try {
            const response = await fetch(`/api/translations/${language}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    };

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
    
        // Check if any required fields are null
        if (!userDetails.username || !userDetails.email || !userDetails.nickname) {
            setError('All fields are required.');
            return;
        }
    
        const formData = new FormData();
        formData.append('username', userDetails.username);
        formData.append('email', userDetails.email);
        formData.append('nickname', userDetails.nickname);
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
                navigate('/profile');
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

    const [isShrink, setIsShrink] = useState(false);
    useEffect(()=>{
        if (window.innerWidth <= 920) {
            setIsShrink(true);
        }
        else {
            setIsShrink(false);
        }
    },[])
    const handleResize = () => {
        if (window.innerWidth <= 920) {
            setIsShrink(true);
        }
        else {
            setIsShrink(false);
        }
    }

    window.addEventListener("resize", handleResize);
    
    return (
        <div className='accountBody'>
            <header className={`accountHeader ${isShrink ? 'shrink' : ''}`}>
                <h2 className='accountLogo' onClick={()=>navigate('/menu')}>
                    {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>)
                    : (<span>Pong</span>)}
                </h2>
                <nav className='accountNav'>
                    <div className="navProfile" onClick={()=>navigate('/profile')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>)
                        : (<span>{translations.profile}</span>)}
                    </div>
                    <div className="navAccount" onClick={()=>navigate('/edit-account')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z"/></svg>)
                        : (<span>{translations.account}</span>)}
                    </div>
                    <div className="navSecurity" onClick={()=>navigate('/security')}>
                        {isShrink ? (<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>)
                        : (<span>{translations.security}</span>)}
                    </div>
                </nav>
            </header>
            <div className="accountWrapper">
                <form className='accountForm' onSubmit={handleSubmit}>
                    {connectedFrom42API && <p className="warning-message">{translations.changesNotAccounted}</p>}
                    <label className='accountLabel'>
                        {translations.username}:
                        <input className={`accountInput ${connectedFrom42API ? 'connected' : ''}`} type="text" name="username" value={userDetails.username} onChange={handleChange} maxLength={15} readOnly={connectedFrom42API}/>
                    </label>
                    <label className='accountLabel'>
                    {translations.email}:
                        <input className={`accountInput ${connectedFrom42API ? 'connected' : ''}`} type="email" name="email" value={userDetails.email} onChange={handleChange} readOnly={connectedFrom42API}/>
                    </label>
                    <label className='accountLabel'>
                    {translations.nickname}:
                        <input className={`accountInput ${connectedFrom42API ? 'connected' : ''}`} type="text" name="nickname" value={userDetails.nickname} onChange={handleChange} maxLength={15} readOnly={connectedFrom42API}/>
                    </label>
                    <label className='accountLabel'>
                    {translations.profilePicture}:
                        <input className='accountImage' type="file" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <div className="image-carousel">
                        <button className='carouselButton' type="button" onClick={handlePrevImage}>←</button>
                        {preview && <img className='carouselImage' src={preview}/>}
                        <button className='carouselButton' type="button" onClick={handleNextImage}>→</button>
                    </div>
                    <button className='accountChanges' type="submit">{translations.saveChanges}</button>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default EditAccount;
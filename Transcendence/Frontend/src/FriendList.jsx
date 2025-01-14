import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FriendList.css';  // Ensure the CSS file is imported

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friend-list/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setFriends(data);
            } else if (response.status !== 404) {
                const errorData = await response.json();
                setMessage(errorData.error || 'Failed to fetch friend list');
            }
        } catch (error) {
            console.error('Error fetching friend list:', error);
            setMessage('Error fetching friend list');
        }
    };

    useEffect(() => {
        fetchFriends();
        const interval = setInterval(fetchFriends, 10000);  // Fetch friends every 20 second
        return () => clearInterval(interval);  // Cleanup interval on component unmount
    }, []);

    const handleAddFriend = async () => {
        try {
            const response = await fetch('/api/add-friend/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ username: search }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setSearch('');
                // Refresh the friend list
                fetchFriends();
            } else {
                setMessage(data.error || 'Failed to add friend');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            setMessage('Error adding friend');
        }
    };

    const handleFriendClick = (username) => {
        navigate(`/profile/${username}`);
    };

    const [isListActive, setIsListActive] = useState(false);

    const handleListActiveClick = ()=> {
        setIsListActive(true);
    }

    const handleListCloseClick = ()=> {
        setIsListActive(false);
    }

    // Conditionally render the friend list UI based on the current route (for isOnline status)
    if (location.pathname !== '/menu') {
        return null;
    }

    return (
        <div className={`friend-list ${isListActive ? 'active-list' : ''}`}>
            <span className="listActiveIcon" onClick={handleListCloseClick}>
                <svg className='wrapperSvg' xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="white"><path d="M480-200 240-440l56-56 184 183 184-183 56 56-240 240Zm0-240L240-680l56-56 184 183 184-183 56 56-240 240Z"/></svg>
            </span>
            <span className="listCloseIcon" onClick={handleListActiveClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#e8eaed"><path d="m296-224-56-56 240-240 240 240-56 56-184-183-184 183Zm0-240-56-56 240-240 240 240-56 56-184-183-184 183Z"/></svg>
            </span>
            <h3>Friends</h3>
            <input
                className='friendInput'
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Username"
            />
            <span className='separation'></span>
            <button className='addFriendButton' onClick={handleAddFriend}>Add Friend</button>
            {message && <p className='message'>{message}</p>}
            <ul>
                {friends.map(friend => (
                    <li key={friend.username} onClick={() => handleFriendClick(friend.username)}>
                        <img src={friend.profilePicture} alt={friend.username} className="friend-picture" />
                        <span>{friend.nickname}</span>
                        <span className={`status ${friend.isOnline ? 'online' : 'offline'}`}></span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Setting = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupTelephone, setSignupTelephone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = loginEmail.toLowerCase(); // Convert email to lowercase
      // Send a POST request to the login endpoint
      await axios.post('http://localhost:8000/login', {
        email,
        password: loginPassword,
      });

      // User login successful, update state
      setIsLoggedIn(true);
      // Load user profile
      await loadUserProfile(email);

      // Persist login state in browser storage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginEmail', email);
    } catch (error) {
      // User login failed, display error message or perform appropriate action
      console.log('Invalid email or password');
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoggedIn(false);
      setUserProfile(null); // Clear user profile on sign out

      // Clear login state from browser storage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginEmail');

      // Redirect to the login page
      window.location.replace('/');
    } catch (error) {
      console.log('Error signing out');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = signupEmail.toLowerCase(); // Convert email to lowercase
      // Send a POST request to the signup endpoint
      await axios.post('http://localhost:8000/signup', {
        name: signupName,
        email,
        password: signupPassword,
        address: signupAddress,
        telephone: signupTelephone,
      });

      // User signup successful, clear the signup form fields
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupAddress('');
      setSignupTelephone('');

      console.log('Signup submitted');
    } catch (error) {
      console.log('Error signing up');
    }
  };

  const loadUserProfile = async (email) => {
    try {
      // Send a GET request to retrieve the user's profile
      const response = await axios.get(`http://localhost:8000/users/${email}`);
      const userData = response.data;
      setUserProfile(userData);
    } catch (error) {
      console.log('Error loading user profile');
    }
  };

  useEffect(() => {
    // Check if the user is logged in based on browser storage
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedLoginEmail = localStorage.getItem('loginEmail');

    if (storedIsLoggedIn === 'true' && storedLoginEmail) {
      setIsLoggedIn(true);
      setLoginEmail(storedLoginEmail);
      loadUserProfile(storedLoginEmail);
    }
  }, []);

  useEffect(() => {
    // Perform any additional actions after logging in
    if (isLoggedIn && userProfile) {
      // Do something with the user's profile data
      console.log(userProfile);
    }
  }, [isLoggedIn, userProfile]);

  if (isLoggedIn) {
    return (
      <div>
        <h2>User Profile</h2>
        <p>Welcome, {loginEmail}!</p>
        {/* Render user profile data */}
        {userProfile && (
          <div>
            <p>Name: {userProfile.name}</p>
            <p>Email: {userProfile.email}</p>
            <p>Address: {userProfile.address}</p>
            <p>Telephone: {userProfile.telephone}</p>
          </div>
        )}
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  } else {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>

        <h2>Signup</h2>
        <form onSubmit={handleSignupSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              value={signupAddress}
              onChange={(e) => setSignupAddress(e.target.value)}
            />
          </div>
          <div>
            <label>Telephone:</label>
            <input
              type="text"
              value={signupTelephone}
              onChange={(e) => setSignupTelephone(e.target.value)}
            />
          </div>
          <button type="submit">Signup</button>
        </form>
      </div>
    );
  }
};

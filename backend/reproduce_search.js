
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const runTest = async () => {
    try {
        const randomStr = Math.random().toString(36).substring(7);
        const user = {
            name: `Test User ${randomStr}`,
            email: `test${randomStr}@example.com`,
            password: 'password123'
        };

        // 1. Register
        console.log('Registering user...');
        await axios.post(`${API_URL}/auth/register`, user);
        console.log('User registered.');

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token received.');

        // 3. Search
        console.log('Searching for user...');
        const searchRes = await axios.get(`${API_URL}/user/search?query=${user.name}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Search Results:', JSON.stringify(searchRes.data, null, 2));

        if (searchRes.data.length > 0) {
            const foundUser = searchRes.data[0];
            if (foundUser.name && foundUser.email) { // profileImage might be empty
                console.log('PASS: User found with name and email.');
            } else {
                console.log('FAIL: User found but missing name or email.');
            }
        } else {
            console.log('FAIL: User not found.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

runTest();

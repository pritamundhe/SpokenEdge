
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const runTest = async () => {
    try {
        const randomStr = Math.random().toString(36).substring(7);
        const user = {
            name: `Profile Test ${randomStr}`,
            email: `profile${randomStr}@example.com`,
            password: 'password123'
        };

        // 1. Register
        console.log('Registering user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, user);
        console.log('User registered.');

        // 2. Login to get token and ID
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.user._id || loginRes.data.user.id; // Check structure

        // If ID is not in login response, we might need to get it from profile or search
        // But let's assume login returns it or we can get it from /auth/me or similar if exists
        // Looking at authController.js, login returns: user: { name, email, profileImage } but NO ID?
        // Wait, let me check authController.js again.

        // Re-checking authController.js in my memory/context...
        // Step 54: 
        // res.status(200).json({
        //     message: 'Login successful',
        //     token,
        //     user: {
        //         name: user.name,
        //         email: user.email,
        //         profileImage: user.profileImage,
        //     },
        // });
        // FUCK. The login response DOES NOT return the ID. See line 60-64 of authController.js.

        // This means I need to search for the user to get the ID, OR use /api/user/profile if it returns ID.
        // Let's check /api/user/profile (getProfile) in userController.js (Step 44).
        // It returns { user: ...document... }. The document should have _id.

        console.log('Fetching own profile to get ID...');
        const profileRes = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const realUserId = profileRes.data.user._id;
        console.log(`Got User ID: ${realUserId}`);

        // 3. Fetch User by ID (Public/Protected route)
        console.log(`Testing public profile fetch: GET /api/user/${realUserId}`);
        const publicProfileRes = await axios.get(`${API_URL}/user/${realUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Profile Response:', JSON.stringify(publicProfileRes.data, null, 2));

        const data = publicProfileRes.data;
        if (data.name === user.name && data.email === user.email) {
            console.log('PASS: Profile data matches.');
        } else {
            console.log('FAIL: Profile data mismatch.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

runTest();

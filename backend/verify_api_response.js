import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

const verifyApi = async () => {
    try {
        // 1. Login to get token (using a known user or creating one if needed, but let's try a known one or just register one)
        // Since we don't know a password for 'pritammundhe00@gmail.com', we'll register a temp user to perform the search.
        const tempUser = {
            name: 'Tester',
            email: `tester_${Date.now()}@example.com`,
            password: 'password123'
        };

        console.log('1. Registering temp user...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempUser)
        });

        if (!registerRes.ok && registerRes.status !== 400) {
            throw new Error(`Register failed: ${registerRes.statusText}`);
        }

        console.log('2. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: tempUser.email, password: tempUser.password })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Logged in, Token acquired.');

        // 2. Search for the user in question
        console.log('3. Searching for "pritammundhe00@gmail.com"...');
        const searchRes = await fetch(`${API_URL}/user/search?query=pritammundhe00@gmail.com`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const searchResults = await searchRes.json();

        console.log('\n--- SEARCH RESULTS JSON ---');
        console.log(JSON.stringify(searchResults, null, 2));
        console.log('---------------------------\n');

        if (searchResults.length > 0) {
            const u = searchResults[0];
            console.log(`Name: "${u.name}"`);
            console.log(`ProfileImage: "${u.profileImage}"`);

            if (!u.profileImage) {
                console.log('=> RESULT: profileImage is empty/missing in API response.');
            } else {
                console.log('=> RESULT: profileImage is PRESENT in API response.');
            }
        } else {
            console.log('=> RESULT: User not found in search.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
};

verifyApi();

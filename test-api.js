// Test script để kiểm tra API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testAPI = async () => {
  try {
    // Test MongoDB connection
    console.log('🔍 Testing MongoDB connection...');
    const mongoResponse = await fetch('http://localhost:8080/api/users/test');
    const mongoData = await mongoResponse.json();
    console.log('MongoDB Test Result:', mongoData);

    // Test sync user endpoint
    console.log('\n🔄 Testing user sync endpoint...');
    const userData = {
      userId: 'test_user_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: '',
      provider: 'clerk',
      role: 'user'
    };

    const syncResponse = await fetch('http://localhost:8080/api/users/sync-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const syncData = await syncResponse.text();
    console.log('Sync Response Status:', syncResponse.status);
    console.log('Sync Response:', syncData);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAPI(); 
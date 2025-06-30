"use client";

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export default function TestSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSync = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      setResult('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setResult('No token available');
        return;
      }

      const userData = {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || 'test@example.com',
        username: user.username || 'testuser',
        firstName: user.firstName || 'Test',
        lastName: user.lastName || 'User',
        imageUrl: user.imageUrl || '',
        provider: 'clerk',
        role: 'user'
      };

      const response = await fetch('http://localhost:8080/api/users/sync-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      if (response.ok) {
        setResult(`✅ Success: ${responseText}`);
      } else {
        setResult(`❌ Error (${response.status}): ${responseText}`);
      }
    } catch (error) {
      setResult(`❌ Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testMongoDB = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/test');
      let data = await response.json();
      if (data && Array.isArray(data.users)) {
        data.users = data.users.map((user: any) => {
          const { _class, ...rest } = user;
          return rest;
        });
      }
      setResult(`MongoDB Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`MongoDB Test Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn || !user) {
    return <div>Please sign in first</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test User Sync</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Info:</h2>
        <p>ID: {user.id}</p>
        <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
        <p>Username: {user.username}</p>
        <p>Name: {user.firstName} {user.lastName}</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={testSync}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Sync User'}
        </button>
        <button
          onClick={testMongoDB}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
        >
          {loading ? 'Testing...' : 'Test MongoDB'}
        </button>
      </div>
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap text-sm text-black">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
} 
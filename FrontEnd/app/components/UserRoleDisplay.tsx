'use client';

import { useEffect, useState } from 'react';
import { useApi } from '../api/apiClient';

export function UserRoleDisplay() {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = useApi();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/users/me');
                setUserInfo(response);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching user info:', err);
                setError(err.message || 'Failed to fetch user information');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [api]);

    if (loading) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    if (error) {
        return <div className="text-red-500">Lỗi: {error}</div>;
    }

    if (!userInfo?.authenticated) {
        return <div>Chưa xác thực</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>
            <div className="space-y-2">
                <p><span className="font-medium">Tên đăng nhập:</span> {userInfo.username}</p>
                <div>
                    <span className="font-medium">Vai trò:</span>
                    <ul className="list-disc list-inside ml-4">
                        {userInfo.roles?.map((role: string, index: number) => (
                            <li key={index} className="text-blue-600">{role}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 
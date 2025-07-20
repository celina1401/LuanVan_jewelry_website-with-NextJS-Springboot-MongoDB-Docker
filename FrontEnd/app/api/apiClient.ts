// // Client-side REST API client for making requests to the backend
// import { useAuth } from '@clerk/nextjs';

// const API_URL = 'http://localhost:8080/api';  // Địa chỉ API của backend

// export const useApi = () => {
//   const { getToken, isLoaded } = useAuth();

//   // Hàm gửi yêu cầu API chung
//   const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
//     if (!isLoaded) {
//       throw new Error('Auth not loaded');
//     }

//     try {
//       const token = await getToken();
      
//       if (!token) {
//         throw new Error('No authentication token available');
//       }

//       const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         ...(options.headers || {}),
//       };
      
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         ...options,
//         headers,
//         credentials: 'include',
//       });
      
//       if (response.status === 401) {
//         throw new Error('Unauthorized access');
//       }
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(
//           data.message || data.error || response.statusText || JSON.stringify(data) || 'API request failed'
//         );
//       }
      
//       return data;
//     } catch (error) {
//       console.error('API request error:', error);
//       throw error;
//     }
//   };

//   return {
//     get: (endpoint: string) => makeRequest(endpoint),
//     post: (endpoint: string, data: any) => makeRequest(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     }),
//     put: (endpoint: string, data: any) => makeRequest(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     }),
//     delete: (endpoint: string) => makeRequest(endpoint, {
//       method: 'DELETE',
//     }),
//   };
// };

// hooks/useApi.ts
import { useAuth } from '@clerk/nextjs';

const API_URL = 'http://localhost:8080/api'; // Địa chỉ Gateway API

export const useApi = () => {
  const { getToken, isLoaded } = useAuth();

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    if (!isLoaded) {
      throw new Error('Clerk chưa sẵn sàng. Vui lòng thử lại.');
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const headers = new Headers({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      });

      // Gộp thêm headers từ options nếu có
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // có thể bỏ nếu backend không dùng cookie
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(
          (isJson && data?.message) ||
          (isJson && data?.error) ||
          response.statusText ||
          'Yêu cầu thất bại'
        );
      }

      return data;
    } catch (error) {
      console.error('Lỗi gọi API:', error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => makeRequest(endpoint),
    post: (endpoint: string, data: any) => makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    put: (endpoint: string, data: any) => makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (endpoint: string) => makeRequest(endpoint, {
      method: 'DELETE',
    }),
  };
};


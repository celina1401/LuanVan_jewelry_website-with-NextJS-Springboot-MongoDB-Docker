// Client-side REST API client for making requests to the backend
import { useAuth } from '@clerk/nextjs';

const API_URL = 'http://localhost:8080/api';  // Địa chỉ API của backend

export const useApi = () => {
  const { getToken, isLoaded } = useAuth();  // Sử dụng hook từ Clerk để lấy token và trạng thái load

  // Hàm gửi yêu cầu API chung
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Kiểm tra nếu Clerk chưa tải xong hoặc người dùng chưa đăng nhập
    if (!isLoaded) {
      throw new Error('Auth not loaded');
    }

    try {
      // Lấy token xác thực từ Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Cấu hình headers với token xác thực
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Thêm token vào header dưới dạng Bearer token
        ...(options.headers || {}),  // Kết hợp các header nếu có thêm từ options
      };
      
      // Gửi yêu cầu tới backend
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',  // Đảm bảo gửi cookie với mỗi yêu cầu
      });
      
      // Kiểm tra lỗi 401 Unauthorized nếu người dùng không có quyền
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      
      // Đọc dữ liệu trả về từ API dưới dạng JSON
      const data = await response.json();
      
      // Nếu phản hồi không hợp lệ, ném lỗi
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;  // Trả về dữ liệu API
    } catch (error) {
      console.error('API request error:', error);  // Ghi lỗi khi có lỗi xảy ra
      throw error;
    }
  };
  
  // Các phương thức HTTP (GET, POST, PUT, DELETE)
  return {
    // Phương thức GET
    get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),

    // Phương thức POST
    post: (endpoint: string, body: any) => makeRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body),  // Chuyển đối tượng thành JSON
    }),

    // Phương thức PUT
    put: (endpoint: string, body: any) => makeRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body),  // Chuyển đối tượng thành JSON
    }),

    // Phương thức DELETE
    delete: (endpoint: string) => makeRequest(endpoint, { method: 'DELETE' }),
  };
};

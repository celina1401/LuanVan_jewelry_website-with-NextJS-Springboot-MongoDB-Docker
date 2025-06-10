package com.example.fullstackapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 1️⃣ Thêm @PreAuthorize để chỉ ADMIN mới truy cập được.
 * 
 * REST Controller cho API quản lý admin. Chỉ cho phép những người dùng có vai trò 'ADMIN'
 * được truy cập các API liên quan đến quản lý admin, trong đó có phương thức xác thực quyền admin.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /**
     * Phương thức này sẽ chỉ được truy cập khi người dùng có token hợp lệ và vai trò là 'ROLE_ADMIN'.
     * Phương thức này xác nhận rằng người dùng có quyền truy cập vào các API liên quan đến admin.
     *
     * @return ResponseEntity chứa thông tin xác thực quyền admin.
     */
    // @PreAuthorize("hasRole('ADMIN')") // Chỉ người dùng có vai trò 'ROLE_ADMIN' mới có thể truy cập.
    @GetMapping("/verify")
    public ResponseEntity<AdminVerificationResponse> verifyAdminAccess() {
        return ResponseEntity.ok(new AdminVerificationResponse(true)); // Trả về phản hồi xác thực admin
    }

    // DTO cho response JSON
    // Chứa thông tin về việc người dùng có phải là admin hay không
    public static class AdminVerificationResponse {
        private final boolean isAdmin;

        // Constructor để tạo đối tượng phản hồi
        public AdminVerificationResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }

        // Getter để lấy thông tin về vai trò admin
        public boolean isAdmin() {
            return isAdmin;
        }
    }
}

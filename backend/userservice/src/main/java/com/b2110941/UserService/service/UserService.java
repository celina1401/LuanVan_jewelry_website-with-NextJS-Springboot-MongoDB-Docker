package com.b2110941.UserService.service;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserService() {
        System.out.println("🚀 UserService: Đã khởi tạo");
    }

    /**
     * Lấy user theo ID
     */
    public UserEntity getUserById(String userId) {
        System.out.println("🔍 UserService: Đang tìm user với ID: " + userId);
        try {
            Optional<UserEntity> user = userRepository.findByUserId(userId);
            if (user.isPresent()) {
                System.out.println("✅ UserService: Tìm thấy user: " + user.get().getUsername());
                return user.get();
            } else {
                System.out.println("❌ UserService: Không tìm thấy user với ID: " + userId);
                return null;
            }
        } catch (Exception e) {
            System.err.println("❌ UserService: Lỗi khi tìm user: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Lấy tất cả users
     */
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Cập nhật user
     */
    public UserEntity updateUser(UserEntity user) {
        return userRepository.save(user);
    }

    /**
     * Xóa user
     */
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    /**
     * Lấy user theo email
     */
    public UserEntity getUserByEmail(String email) {
        Optional<UserEntity> user = userRepository.findByEmail(email);
        return user.orElse(null);
    }

    /**
     * Lưu user mới
     */
    public UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }
}

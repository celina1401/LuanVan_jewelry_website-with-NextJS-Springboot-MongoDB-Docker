package com.b2110941.UserService.service;

import com.b2110941.UserService.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class MonthlyResetService {

    @Autowired
    private UserService userService;

    /**
     * 🗓️ Tự động reset hạng thành viên cho tất cả users vào ngày 1 hàng tháng lúc 00:00
     * Cron: "0 0 1 * * ?" = mỗi ngày 1 hàng tháng lúc 00:00 (Spring Boot 6.x format)
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void resetAllUsersMembershipMonthly() {
        try {
            System.out.println("🔄 Bắt đầu reset hạng thành viên theo tháng cho tất cả users...");
            
            String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            System.out.println("📅 Tháng hiện tại: " + currentMonth);
            
            List<UserEntity> allUsers = userService.getAllUsers();
            int resetCount = 0;
            
            for (UserEntity user : allUsers) {
                if (user.needsMonthlyReset()) {
                    user.resetMonthlyStats();
                    userService.updateUser(user);
                    resetCount++;
                    System.out.println("✅ Đã reset hạng thành viên cho user: " + user.getUsername());
                }
            }
            
            System.out.println("🎉 Hoàn thành reset hạng thành viên theo tháng!");
            System.out.println("📊 Tổng số users được reset: " + resetCount + "/" + allUsers.size());
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi reset hạng thành viên theo tháng: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 🔧 Reset thủ công hạng thành viên cho một user cụ thể
     */
    public void resetUserMembershipManually(String userId) {
        try {
            UserEntity user = userService.getUserById(userId);
            if (user != null) {
                user.resetMonthlyStats();
                userService.updateUser(user);
                System.out.println("✅ Đã reset thủ công hạng thành viên cho user: " + user.getUsername());
            } else {
                System.err.println("❌ Không tìm thấy user với ID: " + userId);
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi reset thủ công hạng thành viên: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 🔍 Kiểm tra trạng thái reset của một user
     */
    public String getUserResetStatus(String userId) {
        try {
            UserEntity user = userService.getUserById(userId);
            if (user != null) {
                String lastReset = user.getLastResetMonth();
                String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                boolean needsReset = user.needsMonthlyReset();
                
                return String.format(
                    "User: %s, Last Reset: %s, Current Month: %s, Needs Reset: %s",
                    user.getUsername(),
                    lastReset != null ? lastReset : "Chưa reset",
                    currentMonth,
                    needsReset ? "Có" : "Không"
                );
            } else {
                return "Không tìm thấy user với ID: " + userId;
            }
        } catch (Exception e) {
            return "Lỗi khi kiểm tra trạng thái reset: " + e.getMessage();
        }
    }
}

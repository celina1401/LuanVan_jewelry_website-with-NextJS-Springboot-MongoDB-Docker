package com.b2110941.UserService.controller;

import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.payload.MembershipInfo;
import com.b2110941.UserService.service.MembershipService;
import com.b2110941.UserService.service.UserService;
import com.b2110941.UserService.service.MonthlyResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    },
    allowCredentials = "true"
)
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @Autowired
    private UserService userService;

    @Autowired
    private MonthlyResetService monthlyResetService;

    public MembershipController() {
        System.out.println("🚀 MembershipController: Đã khởi tạo");
    }

    /**
     * Lấy thông tin hạng thành viên của user
     */
    @GetMapping("/membership/{userId}")
    public ResponseEntity<?> getMembershipInfo(@PathVariable String userId) {
        try {
            System.out.println("🔍 Đang tìm user với ID: " + userId);
            
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                System.out.println("❌ Không tìm thấy user với ID: " + userId);
                return ResponseEntity.notFound().build();
            }

            System.out.println("✅ Tìm thấy user: " + user.getUsername() + ", purchaseCount: " + user.getPurchaseCount());
            
            MembershipInfo membershipInfo = membershipService.getMembershipInfo(user);
            System.out.println("✅ Tạo thành công MembershipInfo: " + membershipInfo.getTierDisplayName());
            
            return ResponseEntity.ok(membershipInfo);
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi lấy thông tin hạng thành viên: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy thông tin hạng thành viên: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Cập nhật thông tin mua hàng (được gọi từ OrderService khi đơn hàng thành công)
     */
    @PostMapping("/membership/{userId}/purchase")
    public ResponseEntity<?> updatePurchaseInfo(
            @PathVariable String userId,
            @RequestBody Map<String, Object> request) {
        try {
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Double orderAmount = Double.valueOf(request.get("orderAmount").toString());
            Integer purchaseCount = request.get("purchaseCount") != null ? 
                Integer.valueOf(request.get("purchaseCount").toString()) : 1;
            String orderIdentifier = null;
            if (request.get("orderId") != null) {
                orderIdentifier = request.get("orderId").toString();
            } else if (request.get("orderNumber") != null) {
                orderIdentifier = request.get("orderNumber").toString();
            }
            
            // Idempotent: nếu đã tính đơn này rồi thì bỏ qua
            if (orderIdentifier != null && user.hasCountedOrder(orderIdentifier)) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đơn hàng đã được ghi nhận trước đó, bỏ qua để tránh đếm trùng");
                response.put("membershipInfo", membershipService.getMembershipInfo(user));
                return ResponseEntity.ok(response);
            }

            // Cập nhật thông tin mua hàng
            MembershipInfo newMembershipInfo = membershipService.updatePurchaseInfo(user, orderAmount, purchaseCount);
            if (orderIdentifier != null) {
                user.addCountedOrder(orderIdentifier);
            }
            
            // Lưu user đã cập nhật
            userService.updateUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật thông tin mua hàng thành công!");
            response.put("membershipInfo", newMembershipInfo);
            response.put("discountAmount", membershipService.calculateDiscount(user, orderAmount));
            
            // Kiểm tra xem có được lên hạng không
            if (membershipService.isEligibleForUpgrade(user)) {
                response.put("upgradeMessage", "🎉 Chúc mừng! Bạn đã được lên hạng " + 
                    newMembershipInfo.getTierDisplayName() + "!");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể cập nhật thông tin mua hàng: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Tính discount cho đơn hàng
     */
    @PostMapping("/membership/{userId}/calculate-discount")
    public ResponseEntity<?> calculateDiscount(
            @PathVariable String userId,
            @RequestBody Map<String, Object> request) {
        try {
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Double orderAmount = Double.valueOf(request.get("orderAmount").toString());
            double discountAmount = membershipService.calculateDiscount(user, orderAmount);
            double finalAmount = orderAmount - discountAmount;

            Map<String, Object> response = new HashMap<>();
            response.put("originalAmount", orderAmount);
            response.put("discountRate", user.getDiscountRate() * 100); // Chuyển thành phần trăm
            response.put("discountAmount", discountAmount);
            response.put("finalAmount", finalAmount);
            response.put("membershipTier", user.getMembershipTier().getDisplayName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể tính discount: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy thông tin hạng tiếp theo
     */
    @GetMapping("/membership/{userId}/next-tier")
    public ResponseEntity<?> getNextTierInfo(@PathVariable String userId) {
        try {
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            String nextTierInfo = membershipService.getNextTierInfo(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("nextTierInfo", nextTierInfo);
            response.put("currentTier", user.getMembershipTier().getDisplayName());
            response.put("currentPurchaseCount", user.getPurchaseCount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy thông tin hạng tiếp theo: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy thống kê hạng thành viên
     */
    @GetMapping("/membership/stats")
    public ResponseEntity<?> getMembershipStats() {
        try {
            // Lấy thống kê từ service
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userService.getAllUsers().size());
            stats.put("bronzeUsers", 0); // TODO: Implement counting by tier
            stats.put("silverUsers", 0);
            stats.put("goldUsers", 0);
            stats.put("diamondUsers", 0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể lấy thống kê: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 🔧 Reset thủ công hạng thành viên cho một user (Admin only)
     */
    @PostMapping("/membership/{userId}/reset")
    public ResponseEntity<?> resetUserMembership(@PathVariable String userId) {
        try {
            monthlyResetService.resetUserMembershipManually(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đã reset hạng thành viên thành công cho user " + userId);
            response.put("resetTime", java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể reset hạng thành viên: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 🔍 Kiểm tra trạng thái reset của một user
     */
    @GetMapping("/membership/{userId}/reset-status")
    public ResponseEntity<?> getUserResetStatus(@PathVariable String userId) {
        try {
            String status = monthlyResetService.getUserResetStatus(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", status);
            response.put("currentMonth", java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM")));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể kiểm tra trạng thái reset: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 🗓️ Reset hạng thành viên cho tất cả users (Admin only)
     */
    @PostMapping("/membership/reset-all")
    public ResponseEntity<?> resetAllUsersMembership() {
        try {
            monthlyResetService.resetAllUsersMembershipMonthly();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đã reset hạng thành viên cho tất cả users thành công");
            response.put("resetTime", java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Không thể reset hạng thành viên cho tất cả users: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}


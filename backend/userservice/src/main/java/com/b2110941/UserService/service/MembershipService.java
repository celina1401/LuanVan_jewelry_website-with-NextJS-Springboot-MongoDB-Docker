package com.b2110941.UserService.service;

import com.b2110941.UserService.entity.MembershipTier;
import com.b2110941.UserService.entity.UserEntity;
import com.b2110941.UserService.payload.MembershipInfo;
import org.springframework.stereotype.Service;

@Service
public class MembershipService {

    public MembershipService() {
        System.out.println("🚀 MembershipService: Đã khởi tạo");
    }

    /**
     * Cập nhật thông tin mua hàng của user
     * @param user User cần cập nhật
     * @param orderAmount Số tiền đơn hàng
     * @param purchaseCount Số lần mua hàng (mặc định là 1)
     * @return MembershipInfo mới
     */
    public MembershipInfo updatePurchaseInfo(UserEntity user, double orderAmount, int purchaseCount) {
        // 🗓️ Kiểm tra và reset hạng thành viên theo tháng
        if (user.needsMonthlyReset()) {
            user.resetMonthlyStats();
            System.out.println("🔄 Đã reset hạng thành viên cho user " + user.getUsername() + " theo tháng mới");
        }
        
        // Tăng số lần mua hàng
        int newPurchaseCount = user.getPurchaseCount() + purchaseCount;
        user.setPurchaseCount(newPurchaseCount);
        
        // Cập nhật tổng tiền đã chi
        double newTotalSpent = user.getTotalSpent() + orderAmount;
        user.setTotalSpent(newTotalSpent);
        
        // Tự động cập nhật hạng thành viên
        MembershipTier newTier = MembershipTier.getTierByPurchaseCount(newPurchaseCount);
        user.setMembershipTier(newTier);
        
        return new MembershipInfo(newTier, newPurchaseCount, newTotalSpent);
    }

    /**
     * Cập nhật thông tin mua hàng của user (overload với purchaseCount mặc định là 1)
     * @param user User cần cập nhật
     * @param orderAmount Số tiền đơn hàng
     * @return MembershipInfo mới
     */
    public MembershipInfo updatePurchaseInfo(UserEntity user, double orderAmount) {
        return updatePurchaseInfo(user, orderAmount, 1);
    }

    /**
     * Lấy thông tin hạng thành viên hiện tại
     * @param user User cần kiểm tra
     * @return MembershipInfo
     */
    public MembershipInfo getMembershipInfo(UserEntity user) {
        // Khởi tạo membershipTier nếu chưa có
        user.initializeMembershipTier();
        
        return new MembershipInfo(
            user.getMembershipTier(), 
            user.getPurchaseCount(), 
            user.getTotalSpent()
        );
    }

    /**
     * Tính discount cho đơn hàng dựa trên hạng thành viên
     * @param user User cần tính discount
     * @param orderAmount Số tiền đơn hàng
     * @return Số tiền được giảm
     */
    public double calculateDiscount(UserEntity user, double orderAmount) {
        double discountRate = user.getDiscountRate();
        return orderAmount * discountRate;
    }

    /**
     * Kiểm tra xem user có được lên hạng không
     * @param user User cần kiểm tra
     * @return true nếu được lên hạng
     */
    public boolean isEligibleForUpgrade(UserEntity user) {
        int currentCount = user.getPurchaseCount();
        MembershipTier currentTier = user.getMembershipTier();
        
        switch (currentTier) {
            case BRONZE:
                return currentCount >= 5;
            case SILVER:
                return currentCount >= 10;
            case GOLD:
                return currentCount >= 15;
            case DIAMOND:
                return false; // Đã ở hạng cao nhất
            default:
                return false;
        }
    }

    /**
     * Lấy thông tin hạng tiếp theo
     * @param user User cần kiểm tra
     * @return Thông tin hạng tiếp theo
     */
    public String getNextTierInfo(UserEntity user) {
        int currentCount = user.getPurchaseCount();
        
        if (currentCount < 5) {
            int remaining = 5 - currentCount;
            return String.format("Cần mua thêm %d lần để lên hạng Bạc (giảm 1%%)", remaining);
        } else if (currentCount < 10) {
            int remaining = 10 - currentCount;
            return String.format("Cần mua thêm %d lần để lên hạng Vàng (giảm 3%%)", remaining);
        } else if (currentCount < 15) {
            int remaining = 15 - currentCount;
            return String.format("Cần mua thêm %d lần để lên hạng Kim cương (giảm 5%%)", remaining);
        } else {
            return "Bạn đã ở hạng cao nhất! 🎉";
        }
    }
}


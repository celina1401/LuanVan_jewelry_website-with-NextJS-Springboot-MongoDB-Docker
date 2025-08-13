package com.b2110941.UserService.entity;

public enum MembershipTier {
    BRONZE("Đồng", 0, 0.0),      // 0-4 lần mua, không giảm giá
    SILVER("Bạc", 5, 0.01),      // 5-9 lần mua, giảm 1%
    GOLD("Vàng", 10, 0.03),      // 10-14 lần mua, giảm 3%
    DIAMOND("Kim cương", 15, 0.05); // 15+ lần mua, giảm 5%

    private final String displayName;
    private final int minPurchaseCount;
    private final double discountRate;

    MembershipTier(String displayName, int minPurchaseCount, double discountRate) {
        this.displayName = displayName;
        this.minPurchaseCount = minPurchaseCount;
        this.discountRate = discountRate;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinPurchaseCount() {
        return minPurchaseCount;
    }

    public double getDiscountRate() {
        return discountRate;
    }

    public static MembershipTier getTierByPurchaseCount(int purchaseCount) {
        if (purchaseCount >= 15) return DIAMOND;
        if (purchaseCount >= 10) return GOLD;
        if (purchaseCount >= 5) return SILVER;
        return BRONZE;
    }

    public static double getDiscountRateByPurchaseCount(int purchaseCount) {
        return getTierByPurchaseCount(purchaseCount).getDiscountRate();
    }
}


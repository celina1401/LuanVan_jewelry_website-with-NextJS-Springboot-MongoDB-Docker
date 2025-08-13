package com.b2110941.UserService.payload;

import com.b2110941.UserService.entity.MembershipTier;

public class MembershipInfo {
    private String tierName;
    private String tierDisplayName;
    private double discountRate;
    private int currentPurchaseCount;
    private int purchasesToNextTier;
    private String nextTierName;
    private double totalSpent;
    private String tierIcon;

    public MembershipInfo() {}

    public MembershipInfo(MembershipTier tier, int purchaseCount, double totalSpent) {
        this.tierName = tier.name();
        this.tierDisplayName = tier.getDisplayName();
        this.discountRate = tier.getDiscountRate();
        this.currentPurchaseCount = purchaseCount;
        this.totalSpent = totalSpent;
        
        // Tính hạng tiếp theo
        if (purchaseCount < 5) {
            this.purchasesToNextTier = 5 - purchaseCount;
            this.nextTierName = "Bạc";
        } else if (purchaseCount < 10) {
            this.purchasesToNextTier = 10 - purchaseCount;
            this.nextTierName = "Vàng";
        } else if (purchaseCount < 15) {
            this.purchasesToNextTier = 15 - purchaseCount;
            this.nextTierName = "Kim cương";
        } else {
            this.purchasesToNextTier = 0;
            this.nextTierName = "Đã ở hạng cao nhất";
        }

        // Set icon cho từng hạng
        switch (tier) {
            case BRONZE:
                this.tierIcon = "🥉";
                break;
            case SILVER:
                this.tierIcon = "🥈";
                break;
            case GOLD:
                this.tierIcon = "🥇";
                break;
            case DIAMOND:
                this.tierIcon = "💎";
                break;
            default:
                this.tierIcon = "👤";
        }
    }

    // Getters and Setters
    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }

    public String getTierDisplayName() {
        return tierDisplayName;
    }

    public void setTierDisplayName(String tierDisplayName) {
        this.tierDisplayName = tierDisplayName;
    }

    public double getDiscountRate() {
        return discountRate;
    }

    public void setDiscountRate(double discountRate) {
        this.discountRate = discountRate;
    }

    public int getCurrentPurchaseCount() {
        return currentPurchaseCount;
    }

    public void setCurrentPurchaseCount(int currentPurchaseCount) {
        this.currentPurchaseCount = currentPurchaseCount;
    }

    public int getPurchasesToNextTier() {
        return purchasesToNextTier;
    }

    public void setPurchasesToNextTier(int purchasesToNextTier) {
        this.purchasesToNextTier = purchasesToNextTier;
    }

    public String getNextTierName() {
        return nextTierName;
    }

    public void setNextTierName(String nextTierName) {
        this.nextTierName = nextTierName;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public String getTierIcon() {
        return tierIcon;
    }

    public void setTierIcon(String tierIcon) {
        this.tierIcon = tierIcon;
    }
}


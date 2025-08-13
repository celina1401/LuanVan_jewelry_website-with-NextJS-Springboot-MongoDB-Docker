export interface MembershipTier {
  name: string;
  displayName: string;
  minPurchaseCount: number;
  discountRate: number;
}

export interface MembershipInfo {
  tierName: string;
  tierDisplayName: string;
  discountRate: number;
  currentPurchaseCount: number;
  purchasesToNextTier: number;
  nextTierName: string;
  totalSpent: number;
  tierIcon: string;
}

export interface DiscountCalculation {
  originalAmount: number;
  discountRate: number;
  discountAmount: number;
  finalAmount: number;
  membershipTier: string;
}

export interface NextTierInfo {
  nextTierInfo: string;
  currentTier: string;
  currentPurchaseCount: number;
}

export interface MembershipStats {
  totalUsers: number;
  bronzeUsers: number;
  silverUsers: number;
  goldUsers: number;
  diamondUsers: number;
}

export interface PurchaseUpdateRequest {
  orderAmount: number;
}

export interface PurchaseUpdateResponse {
  message: string;
  membershipInfo: MembershipInfo;
  discountAmount: number;
  upgradeMessage?: string;
}

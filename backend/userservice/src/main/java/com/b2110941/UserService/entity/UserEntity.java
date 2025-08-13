package com.b2110941.UserService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import com.b2110941.UserService.entity.Address;
import com.b2110941.UserService.entity.MembershipTier;

@Document(collection = "users")
public class UserEntity {

    @Id
    private String userId; // Dùng làm _id

    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String imageUrl;
    private String provider;
    private Set<String> roles = new HashSet<>();
    private String role;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String phone;
    private List<Address> addresses;
    private String avatarUrl;
    private byte[] avatarImage;
    private Boolean active = true; // Mặc định tài khoản hoạt động
    private String dateOfBirth;
    private String gender;
    private Integer purchaseCount = 0;
    private MembershipTier membershipTier = MembershipTier.BRONZE;
    private Double totalSpent = 0.0;
    // Lưu tháng cuối cùng được reset hạng thành viên (format: "yyyy-MM")
    private String lastResetMonth;
    // Lưu các mã đơn hàng đã được tính vào membership để tránh đếm trùng
    private Set<String> countedOrders = new HashSet<>();


    // Getters & Setters

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<Address> getAddresses() {
        return addresses;
    }
    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public byte[] getAvatarImage() {
        return avatarImage;
    }
    public void setAvatarImage(byte[] avatarImage) {
        this.avatarImage = avatarImage;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getPurchaseCount() {
        return purchaseCount;
    }

    public void setPurchaseCount(Integer purchaseCount) {
        this.purchaseCount = purchaseCount;
        // Tự động cập nhật hạng thành viên khi số lần mua thay đổi
        this.membershipTier = MembershipTier.getTierByPurchaseCount(purchaseCount);
    }

    public MembershipTier getMembershipTier() {
        return membershipTier;
    }

    public void setMembershipTier(MembershipTier membershipTier) {
        this.membershipTier = membershipTier;
    }

    public Double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }

    // Helper method để tính discount
    public double getDiscountRate() {
        return membershipTier.getDiscountRate();
    }

    // Helper method để tính số lần mua cần thiết để lên hạng tiếp theo
    public int getPurchasesToNextTier() {
        int currentCount = purchaseCount;
        if (currentCount < 5) return 5 - currentCount;
        if (currentCount < 10) return 10 - currentCount;
        if (currentCount < 15) return 15 - currentCount;
        return 0; // Đã ở hạng cao nhất
    }

    // Helper method để khởi tạo membershipTier nếu chưa có
    public void initializeMembershipTier() {
        if (this.membershipTier == null) {
            this.membershipTier = MembershipTier.getTierByPurchaseCount(this.purchaseCount);
        }
    }

    // Các helper cho idempotency của membership
    public Set<String> getCountedOrders() {
        return countedOrders;
    }

    public void setCountedOrders(Set<String> countedOrders) {
        this.countedOrders = countedOrders;
    }

    public boolean hasCountedOrder(String identifier) {
        if (identifier == null) return false;
        if (this.countedOrders == null) this.countedOrders = new HashSet<>();
        return this.countedOrders.contains(identifier);
    }

    public void addCountedOrder(String identifier) {
        if (identifier == null) return;
        if (this.countedOrders == null) this.countedOrders = new HashSet<>();
        this.countedOrders.add(identifier);
    }

    // Helper methods for monthly reset
    public String getLastResetMonth() {
        return lastResetMonth;
    }

    public void setLastResetMonth(String lastResetMonth) {
        this.lastResetMonth = lastResetMonth;
    }

    public boolean needsMonthlyReset() {
        if (this.lastResetMonth == null) return true;
        
        String currentMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
        return !this.lastResetMonth.equals(currentMonth);
    }

    public void resetMonthlyStats() {
        this.purchaseCount = 0;
        this.totalSpent = 0.0;
        this.membershipTier = MembershipTier.BRONZE;
        this.countedOrders.clear();
        this.lastResetMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}

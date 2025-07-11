package com.b2110941.UserService.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Address {
    private String receiverName;
    private String phone;
    private String street;
    private String ward;
    private String district;
    private String province;
    @JsonProperty("isDefault")
    private boolean isDefault;

    // Getters and setters
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
} 
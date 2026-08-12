package com.farmersportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserProfileDto {

    @NotBlank(message = "Name is required")
    private String name;

    private String email;

    private String mobileNumber;

    @NotBlank(message = "State is required")
    private String state = "Tamil Nadu";

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Taluk is required")
    private String taluk;

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "Preferred language is required")
    private String preferredLanguage = "Tamil";

    public UserProfileDto() {}

    public UserProfileDto(String name, String email, String mobileNumber, String state, String district, String taluk, String village, String preferredLanguage) {
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.state = state != null ? state : "Tamil Nadu";
        this.district = district;
        this.taluk = taluk;
        this.village = village;
        this.preferredLanguage = preferredLanguage != null ? preferredLanguage : "Tamil";
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
}

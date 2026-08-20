package com.farmersportal.dto;

public class UserDto {

    private Long id;
    private String email;
    private String role;
    private String name;
    private String mobileNumber;
    private String state;
    private String district;
    private String taluk;
    private String village;
    private String preferredLanguage;

    public UserDto() {}

    public UserDto(Long id, String email, String role, String name, String mobileNumber, String state, String district, String taluk, String village, String preferredLanguage) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
        this.mobileNumber = mobileNumber;
        this.state = state;
        this.district = district;
        this.taluk = taluk;
        this.village = village;
        this.preferredLanguage = preferredLanguage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

package com.farmersportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "government_schemes")
public class GovernmentScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String category;

    @Column(name = "benefit_amount")
    private Double benefitAmount;

    @Column(name = "eligibility_criteria", length = 1000)
    private String eligibilityCriteria;

    private String state;

    @Column(name = "application_link")
    private String applicationLink;

    public GovernmentScheme() {}

    public GovernmentScheme(Long id, String title, String description, String category, Double benefitAmount, String eligibilityCriteria, String state, String applicationLink) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.benefitAmount = benefitAmount;
        this.eligibilityCriteria = eligibilityCriteria;
        this.state = state;
        this.applicationLink = applicationLink;
    }

    public static GovernmentSchemeBuilder builder() {
        return new GovernmentSchemeBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getBenefitAmount() { return benefitAmount; }
    public void setBenefitAmount(Double benefitAmount) { this.benefitAmount = benefitAmount; }
    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getApplicationLink() { return applicationLink; }
    public void setApplicationLink(String applicationLink) { this.applicationLink = applicationLink; }

    public static class GovernmentSchemeBuilder {
        private Long id;
        private String title;
        private String description;
        private String category;
        private Double benefitAmount;
        private String eligibilityCriteria;
        private String state;
        private String applicationLink;

        GovernmentSchemeBuilder() {}

        public GovernmentSchemeBuilder id(Long id) { this.id = id; return this; }
        public GovernmentSchemeBuilder title(String title) { this.title = title; return this; }
        public GovernmentSchemeBuilder description(String description) { this.description = description; return this; }
        public GovernmentSchemeBuilder category(String category) { this.category = category; return this; }
        public GovernmentSchemeBuilder benefitAmount(Double benefitAmount) { this.benefitAmount = benefitAmount; return this; }
        public GovernmentSchemeBuilder eligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; return this; }
        public GovernmentSchemeBuilder state(String state) { this.state = state; return this; }
        public GovernmentSchemeBuilder applicationLink(String applicationLink) { this.applicationLink = applicationLink; return this; }

        public GovernmentScheme build() {
            return new GovernmentScheme(id, title, description, category, benefitAmount, eligibilityCriteria, state, applicationLink);
        }
    }
}

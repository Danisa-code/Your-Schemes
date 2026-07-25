import { Scheme, LandAsset } from "./types";

export const SCHEMES: Scheme[] = [
  {
    id: "kisan_credit_card",
    title: "Kisan Credit Card",
    description: "Timely credit support to farmers for their cultivation, equipment purchase, and other urgent farming needs with low interest rates.",
    category: "Banking",
    badge: "Active",
    badgeType: "active",
    icon: "CreditCard",
    criteria: "Small & Marginal Farmers",
    benefit: "Up to ₹3,00,000",
    documents: [
      "Aadhaar Card (Identity & Address Proof)",
      "Pattadar Passbook / Land Holding Record Copy",
      "No-Due Certificate from local financial institutions",
      "Passport-sized photograph of applicant"
    ],
    process: [
      "Submit application form on Krishi Sahay or visit nearest commercial/cooperative bank.",
      "Submit land ownership documents and crop cultivation details for appraisal.",
      "Verification of land records and creditworthiness by the agricultural officer.",
      "Sanction of limit and issuance of Kisan Credit Card with up to 7% (effective 4% with timely repayment subsidy) interest rates."
    ],
    lastDate: "2026-08-31"
  },
  {
    id: "pm_fasal_bima",
    title: "PM Fasal Bima Yojana",
    description: "Comprehensive insurance coverage and financial support to farmers in the unfortunate event of failure of any of the notified crops.",
    category: "Insurance",
    badge: "Open",
    badgeType: "open",
    icon: "ShieldAlert",
    criteria: "All Land-owning Farmers",
    benefit: "Sum Insured Per Acre",
    documents: [
      "Land Patta / Land Registry / Possession Certificate",
      "Sowing Certificate issued by Patwari/Agricultural Officer",
      "Bank Account details (with cancelled cheque/passbook copy)",
      "Aadhaar Card"
    ],
    process: [
      "Obtain sowing certificate from your local village authority.",
      "Submit details online on Crop Insurance Portal or via partner bank.",
      "Pay premium share (1.5% for Rabi, 2.0% for Kharif, 5.0% for commercial crops).",
      "Policy active. In case of localized calamity or yield loss, automatic appraisal and direct DBT bank settlement."
    ],
    lastDate: "2026-07-31"
  },
  {
    id: "agri_gold_loan",
    title: "Agri Gold Loan",
    description: "Instant, hassle-free liquidity against gold ornaments for various agricultural inputs, seed sowing, and urgent machinery repairs.",
    category: "Banking",
    badge: "Banking",
    badgeType: "banking",
    icon: "Coins",
    criteria: "Quick Disbursement",
    benefit: "7.5% Int. Rate p.a.",
    documents: [
      "Gold Ornaments to pledge as security",
      "Aadhaar Card or Voter ID Card",
      "Proof of Agricultural Land holding / Cultivation status"
    ],
    process: [
      "Present gold ornaments for evaluation at bank branch.",
      "On-the-spot appraisal of gold weight and purity.",
      "Sign simple single-page loan agreement with land proof.",
      "Receive cash in hand or bank credit within 45 minutes of valuation."
    ],
    lastDate: "2026-12-15"
  },
  {
    id: "pm_kusum",
    title: "PM-KUSUM Scheme",
    description: "Substantial financial assistance for installation of solar water pumps and grid-connected solar power plants in fields.",
    category: "Government",
    badge: "Govt Subsidy",
    badgeType: "subsidy",
    icon: "Sun",
    criteria: "Irrigation Focus",
    benefit: "60% Subsidy",
    documents: [
      "Land Ownership Documents (Mutation Copy / Khata)",
      "Aadhaar Card",
      "Active bank account details",
      "Affidavit affirming dry land status or groundwater source"
    ],
    process: [
      "Apply through the State Nodal Agency or Designated MNRE Portal.",
      "Technical site feasibility study for solar radiation and groundwater source.",
      "Deposit farmer’s share (approx. 40% of the pump cost).",
      "Official agency installs the complete high-efficiency solar pump system with a 5-year warranty."
    ],
    lastDate: "2026-09-15"
  },
  {
    id: "tractor_loan",
    title: "Tractor Loan",
    description: "Finance your next major agricultural machinery with flexible, comfortable and low-interest EMI repayment structures.",
    category: "Machinery",
    badge: "Machinery",
    badgeType: "machinery",
    icon: "Truck",
    criteria: "Up to 7 Years Tenure",
    benefit: "90% On-road Funding",
    documents: [
      "Proforma Invoice of chosen Tractor model from authorised dealer",
      "7/12 Extract or land possession holding proof",
      "Last 6 months bank statement showing transactions",
      "Aadhaar & PAN card copy"
    ],
    process: [
      "Obtain quotation invoice from authorized tractor dealer.",
      "Submit tractor loan application with land holding documents.",
      "Hypothecation & verification of asset by bank executive.",
      "Loan disbursal directly to dealer, take home tractor with monthly/half-yearly EMI options."
    ],
    lastDate: "2026-10-30"
  },
  {
    id: "pkvy_organic",
    title: "PKVY Organic Farming",
    description: "Promoting cluster-based certified organic farming practices with extensive direct-benefit financial assistance for farmers.",
    category: "Government",
    badge: "Govt",
    badgeType: "govt",
    icon: "Leaf",
    criteria: "Minimum 20 Hectares Cluster",
    benefit: "₹50,000 / Hectare",
    documents: [
      "Soil Health Card",
      "Consent letter from local farmer group/cluster leader",
      "Aadhaar Card & Bank Passbook details"
    ],
    process: [
      "Form a farmer group cluster (minimum 20 hectares or 50 farmers).",
      "Register group with local Agriculture Department supervisor.",
      "Adopt PGS certification organic farming practices.",
      "Receive ₹50,000 subsidy per hectare in instalments over 3 years for seeds, organic fertilizers, and packaging."
    ],
    lastDate: "2026-08-15"
  }
];

export const LAND_ASSETS: LandAsset[] = [
  {
    name: "Northern Field Alpha",
    size: "4.2 Acres",
    crop: "Wheat Crop",
    status: "Healthy",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdendN2O32ekujtWVnMjJly_U6Jo2ahpTAfnDW8pbT7aWt5GdmLJT0mTpZ1mw7htEaEQBrv0GYAZhBWnJrycb8Gj4U1g8m-kwBmZkiB6X5gE3qXdSUC-cl1OuHeBM-Hpq_EQsDGtBhfv9HBX2UEj7KNZggh53HQdendMqYYkbCSToZdYKDth_2KFxodbsgJMIQv-ApNbQ-5i-VXFy_6wUcWKwYXwXvQHgEaUeFdnAVGm-11AR6gvvK_u65fRsGYvt2W-yZIxmQ00g8",
  }
];

import { Scheme, LandAsset } from "./types";

/**
 * SCHEMES DATABASE
 *
 * Every scheme entry contains:
 *  - official_info_url        : Official government page explaining the scheme
 *  - official_application_url : Actual portal where a farmer applies (null if unavailable/offline)
 *  - verification_status      : VERIFIED | VERIFICATION_REQUIRED | OFFLINE | LINK_UNAVAILABLE
 *  - last_verified_date       : ISO date of last URL verification (YYYY-MM-DD)
 *  - application_type         : ONLINE | OFFLINE | BOTH | INFORMATION_ONLY
 *
 * URL POLICY:
 *   - Only https:// URLs from .gov.in / .nic.in / official state portals
 *   - NEVER guess a URL — if not verifiable, set to null and mark VERIFICATION_REQUIRED
 *   - Do NOT use blogs, news sites, private listing sites, or affiliate links
 *
 * Last audit: 2026-08-13
 */
export const SCHEMES: Scheme[] = [
  {
    // ── PM-KISAN ──────────────────────────────────────────────────────────────
    id: "pm_kisan",
    scheme_id: "PM-KISAN-001",
    title: "PM-KISAN Samman Nidhi",
    name_ta: "பிரதம மந்திரி கிசான் சம்மான் நிதி",
    description: "Direct income support of ₹6,000 per year to land-holding farmer families, paid in three equal installments of ₹2,000 directly to the farmer's bank account.",
    description_ta: "விவசாயிகளுக்கு வருடத்திற்கு ₹6,000 நேரடி வருமான உதவி, ₹2,000 மூன்று தவணைகளாக நேரடியாக வங்கி கணக்கில் வழங்கப்படும்.",
    category: "Government",
    badge: "Central Govt",
    badgeType: "govt",
    icon: "Sun",
    department: "Ministry of Agriculture & Farmers Welfare, Government of India",
    government_level: "CENTRAL",
    criteria: "All land-holding farmer families",
    benefit: "₹6,000/Year",
    eligibility_en: "All land-holding farmer families whose names appear in the land records of the respective State/UT, subject to exclusion criteria for income-tax payers and government employees.",
    eligibility_ta: "மாநில நில பதிவேட்டில் பெயர் உள்ள அனைத்து விவசாயிகளுக்கும் (வருமான வரி செலுத்துவோர் மற்றும் அரசு ஊழியர்கள் தவிர) பொருந்தும்.",
    benefits_en: "₹6,000 per year in three equal installments of ₹2,000 every 4 months, directly credited to the farmer's Aadhaar-linked bank account via Direct Benefit Transfer (DBT).",
    benefits_ta: "₹6,000 வருடாந்திர உதவி — 4 மாதத்திற்கு ஒருமுறை ₹2,000 மூன்று தவணைகளாக ஆதார் இணைக்கப்பட்ட வங்கி கணக்கில் நேரடியாக வரவுவைக்கப்படும்.",
    documents: [
      "Aadhaar Card",
      "Land Records / Pattadar Passbook",
      "Bank Account details (Aadhaar-linked)",
      "Mobile Number linked with Aadhaar"
    ],
    documents_ta: [
      "ஆதார் அட்டை",
      "நில பதிவேடு / பட்டாதார் பாஸ்புக்",
      "வங்கி கணக்கு விவரங்கள் (ஆதார் இணைப்பு)",
      "ஆதாருடன் இணைக்கப்பட்ட மொபைல் எண்"
    ],
    process: [
      "Visit pmkisan.gov.in and click 'New Farmer Registration'.",
      "Enter your Aadhaar number and State details.",
      "Fill in personal, land, and bank details and submit.",
      "After verification by State/District authorities, installments are credited directly."
    ],
    application_type: "ONLINE",
    official_info_url: "https://pmkisan.gov.in/",
    official_application_url: "https://pmkisan.gov.in/NewFarmerRegistration.aspx",
    official_source_domain: "pmkisan.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-12-31"
  },

  {
    // ── PM FASAL BIMA YOJANA (PMFBY) ─────────────────────────────────────────
    id: "pm_fasal_bima",
    scheme_id: "PMFBY-001",
    title: "PM Fasal Bima Yojana",
    name_ta: "பிரதம மந்திரி பசல் பீமா யோஜனா",
    description: "Comprehensive crop insurance coverage and financial support to farmers in the event of failure of any notified crop due to natural calamities, pests and diseases.",
    description_ta: "இயற்கை சீற்றங்கள், பூச்சிகள் மற்றும் நோய்களால் பயிர் சேதம் ஏற்பட்டால் விவசாயிகளுக்கு விரிவான பயிர் காப்பீடு மற்றும் நிதி உதவி வழங்கப்படும்.",
    category: "Insurance",
    badge: "Open",
    badgeType: "open",
    icon: "ShieldAlert",
    department: "Ministry of Agriculture & Farmers Welfare, Government of India",
    government_level: "CENTRAL",
    criteria: "All notified crop growers",
    benefit: "Sum Insured Per Acre",
    eligibility_en: "All farmers — both loanee and non-loanee — growing notified crops in notified areas. Tenant and sharecropper farmers are also eligible.",
    eligibility_ta: "அறிவிக்கப்பட்ட பகுதிகளில் அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் அனைத்து விவசாயிகளும் — கடன் பெற்றவர்கள் மற்றும் கடன் பெறாதவர்கள் இருவரும் தகுதியுடையவர்கள். குத்தகை விவசாயிகளும் தகுதியுடையவர்கள்.",
    benefits_en: "Full crop insurance against natural calamities, pests and diseases. Premium: 1.5% for Rabi, 2% for Kharif, 5% for commercial/horticultural crops (farmer's share only). Remaining premium borne by Central & State Government.",
    benefits_ta: "இயற்கை சீற்றங்கள், பூச்சிகள் மற்றும் நோய்களுக்கு எதிரான முழு பயிர் காப்பீடு. பிரீமியம்: ராபி: 1.5%, காரீப்: 2%, வணிக/தோட்டக்கலை: 5% (விவசாயி பங்கு மட்டும்). மீதமுள்ள பிரீமியம் மத்திய மற்றும் மாநில அரசால் ஏற்கப்படும்.",
    documents: [
      "Land Patta / Land Registry / Possession Certificate",
      "Sowing Certificate issued by Patwari/Agricultural Officer",
      "Bank Account details (with cancelled cheque/passbook copy)",
      "Aadhaar Card"
    ],
    documents_ta: [
      "நில பட்டா / நில பதிவு / ஆட்சி சான்றிதழ்",
      "பாட்வாரி/வேளாண்மை அதிகாரியால் வழங்கப்பட்ட விதை நடவு சான்றிதழ்",
      "வங்கி கணக்கு விவரங்கள் (ரத்துசெய்யப்பட்ட காசோலை/பாஸ்புக் நகல்)",
      "ஆதார் அட்டை"
    ],
    process: [
      "Visit pmfby.gov.in and click 'Farmer Corner' to register.",
      "Select your State, District, Season, and Crop.",
      "Fill in land and bank details and pay premium online.",
      "Policy is activated. Claims are settled automatically after crop loss assessment."
    ],
    application_type: "ONLINE",
    official_info_url: "https://pmfby.gov.in/",
    official_application_url: "https://pmfby.gov.in/farmerRegistrationForm",
    official_source_domain: "pmfby.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-07-31"
  },

  {
    // ── PM-KUSUM ──────────────────────────────────────────────────────────────
    id: "pm_kusum",
    scheme_id: "PMKUSUM-001",
    title: "PM-KUSUM Scheme",
    name_ta: "பிரதம மந்திரி கிசான் உர்ஜா சுரக்ஷா மற்றும் உத்தம் மகாபியான்",
    description: "Substantial financial assistance for installation of solar water pumps and grid-connected solar power plants in fields, providing clean energy and additional income.",
    description_ta: "விவசாய நிலங்களில் சோலார் நீர் பம்புகள் மற்றும் சோலார் மின் உற்பத்தி நிலையங்களை நிறுவ குறிப்பிடத்தக்க நிதி உதவி, சுத்தமான ஆற்றல் மற்றும் கூடுதல் வருமானம்.",
    category: "Government",
    badge: "Govt Subsidy",
    badgeType: "subsidy",
    icon: "Sun",
    department: "Ministry of New and Renewable Energy (MNRE) / Tamil Nadu Energy Development Agency (TEDA)",
    government_level: "CENTRAL_AND_STATE",
    criteria: "Irrigation Focus",
    benefit: "60% Subsidy",
    eligibility_en: "Individual farmers, groups of farmers, FPOs, Panchayats, Cooperatives, and Water User Associations with agricultural land seeking solar pump or solar power plant installation.",
    eligibility_ta: "வேளாண் நிலம் உள்ள தனிப்பட்ட விவசாயிகள், விவசாயிகள் குழுக்கள், FPO, பஞ்சாயத்துக்கள், கூட்டுறவுகள் மற்றும் நீர் பயனர் சங்கங்கள்.",
    benefits_en: "60% subsidy (30% Central + 30% State) on standalone solar pumps up to 7.5 HP. Farmer pays only 40% cost. Installed by empanelled vendor with 5-year warranty.",
    benefits_ta: "7.5 HP வரை சுயமான சோலார் பம்புகளில் 60% மானியம் (30% மத்திய + 30% மாநில). விவசாயி 40% மட்டும் செலுத்தினால் போதும். 5 ஆண்டு உத்தரவாதத்துடன் நிறுவல்.",
    documents: [
      "Land Ownership Documents (Mutation Copy / Khata)",
      "Aadhaar Card",
      "Active bank account details",
      "Affidavit affirming dry land status or groundwater source"
    ],
    documents_ta: [
      "நில உரிமை ஆவணங்கள் (முத்திரை நகல் / கட்டா)",
      "ஆதார் அட்டை",
      "செயலில் உள்ள வங்கி கணக்கு விவரங்கள்",
      "வறண்ட நிலம் அல்லது நில நீர் ஆதாரத்தை உறுதிப்படுத்தும் பிரமாண பத்திரம்"
    ],
    process: [
      "Apply through Tamil Nadu Energy Development Agency (TEDA) at teda.in.",
      "Technical site feasibility study for solar radiation and groundwater source.",
      "Deposit farmer's share (approx. 40% of the pump cost) to TEDA.",
      "Official agency installs the complete high-efficiency solar pump system with a 5-year warranty."
    ],
    application_type: "BOTH",
    official_info_url: "https://mnre.gov.in/pm-kusum/",
    official_application_url: "https://www.teda.in/",
    official_source_domain: "teda.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-09-15"
  },

  {
    // ── PKVY ORGANIC FARMING ──────────────────────────────────────────────────
    id: "pkvy_organic",
    scheme_id: "PKVY-001",
    title: "PKVY Organic Farming",
    name_ta: "பரம்பரகத் கிருஷி விகாஸ் யோஜனா - இயற்கை வேளாண்மை",
    description: "Promoting cluster-based certified organic farming practices with extensive direct-benefit financial assistance for farmers transitioning to organic methods.",
    description_ta: "இயற்கை வேளாண்மை முறைகளுக்கு மாறும் விவசாயிகளுக்கு கொத்து அடிப்படையிலான சான்றளிக்கப்பட்ட இயற்கை வேளாண்மையை ஊக்குவிக்கும் நேரடி நிதி உதவி.",
    category: "Government",
    badge: "Govt",
    badgeType: "govt",
    icon: "Leaf",
    department: "Ministry of Agriculture & Farmers Welfare, Government of India",
    government_level: "CENTRAL",
    criteria: "Minimum 20 Hectares Cluster",
    benefit: "₹50,000/Hectare (3 years)",
    eligibility_en: "Farmer clusters of minimum 20 hectares (50 farmers) willing to adopt organic farming and obtain PGS (Participatory Guarantee System) certification.",
    eligibility_ta: "குறைந்தது 20 ஹெக்டேர் (50 விவசாயிகள்) கொண்ட விவசாயிகள் கொத்துக்கள், இயற்கை வேளாண்மை நடைமுறைகளை கடைப்பிடிக்க மற்றும் PGS சான்று பெற தயாரானவர்கள்.",
    benefits_en: "Financial assistance of ₹50,000 per hectare over 3 years for organic inputs (seeds, biofertilizers, organic pesticides), certification, and value addition activities.",
    benefits_ta: "3 ஆண்டுகளில் ஒரு ஹெக்டேருக்கு ₹50,000 — இயற்கை இடுபொருள்கள் (விதைகள், இயற்கை உரங்கள், இயற்கை பூச்சிக்கொல்லிகள்), சான்றிதழ் மற்றும் மதிப்பு கூட்டல் செயல்பாடுகளுக்கு.",
    documents: [
      "Soil Health Card (mandatory)",
      "Consent letter from local farmer group/cluster leader",
      "Aadhaar Card & Bank Passbook details"
    ],
    documents_ta: [
      "மண் சுகாதார அட்டை (கட்டாயம்)",
      "விவசாயி கொத்து குழு / தலைவரிடமிருந்து ஒப்புதல் கடிதம்",
      "ஆதார் அட்டை மற்றும் வங்கி பாஸ்புக் விவரங்கள்"
    ],
    process: [
      "Form a farmer cluster of at least 50 farmers covering 20 hectares.",
      "Register the cluster at the official PGS India portal (pgsindia-ncof.gov.in).",
      "Adopt organic farming practices and start PGS certification process.",
      "Receive financial assistance in instalments over 3 years from the Agriculture Department."
    ],
    application_type: "ONLINE",
    official_info_url: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
    official_application_url: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
    official_source_domain: "pgsindia-ncof.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-08-15"
  },

  {
    // ── KISAN CREDIT CARD ─────────────────────────────────────────────────────
    id: "kisan_credit_card",
    scheme_id: "KCC-001",
    title: "Kisan Credit Card",
    name_ta: "கிசான் கிரெடிட் கார்டு",
    description: "Timely and adequate credit support to farmers for their cultivation needs, post-harvest expenses, maintenance of farm assets and allied activities at low interest rates.",
    description_ta: "விவசாயிகளின் பயிரிடல் தேவைகள், அறுவடைக்கு பிந்தைய செலவுகள், விவசாய சொத்துக்கள் பராமரிப்பு மற்றும் நுகர்வு தேவைகளுக்கு குறைந்த வட்டியில் சரியான நேரத்தில் கடன் உதவி.",
    category: "Banking",
    badge: "Active",
    badgeType: "active",
    icon: "CreditCard",
    department: "Ministry of Agriculture & Farmers Welfare / NABARD / Commercial & Cooperative Banks",
    government_level: "CENTRAL",
    criteria: "Small & Marginal Farmers",
    benefit: "Up to ₹3,00,000 @ 4% p.a.",
    eligibility_en: "All farmers — individual, joint borrowers, tenant farmers, oral lessees, share croppers, and self-help groups of farmers/joint liability groups.",
    eligibility_ta: "அனைத்து விவசாயிகளும் — தனி கடனாளிகள், கூட்டு கடனாளிகள், குத்தகை விவசாயிகள், வாய்மொழி குத்தகைதாரர்கள், பங்கு பயிரிடுபவர்கள் மற்றும் விவசாயிகளின் சுய உதவி குழுக்கள்.",
    benefits_en: "Revolving credit up to ₹3,00,000 at 7% interest (effective 4% with 3% interest subvention for timely repayment). Covers cultivation, post-harvest, maintenance, and consumption needs.",
    benefits_ta: "₹3,00,000 வரை 7% வட்டியில் சுழலும் கடன் (சரியான நேரத்தில் திருப்பிச் செலுத்தினால் 3% வட்டி மானியத்துடன் 4% செயல்படும்). பயிரிடல், அறுவடைக்கு பிந்தைய, பராமரிப்பு மற்றும் நுகர்வு தேவைகளை உள்ளடக்கியது.",
    documents: [
      "Aadhaar Card (Identity & Address Proof)",
      "Pattadar Passbook / Land Holding Record Copy",
      "No-Due Certificate from local financial institutions",
      "Passport-sized photograph of applicant"
    ],
    documents_ta: [
      "ஆதார் அட்டை (அடையாள மற்றும் முகவரி சான்று)",
      "பட்டாதார் பாஸ்புக் / நில வைத்திருப்பு பதிவு நகல்",
      "உள்ளூர் நிதி நிறுவனங்களிடமிருந்து நடுநிலை சான்றிதழ்",
      "விண்ணப்பதாரரின் கடவுச்சீட்டு அளவு புகைப்படம்"
    ],
    process: [
      "Apply online at pmkisan.gov.in/KCC.aspx or visit nearest commercial/cooperative bank.",
      "Submit land ownership documents and crop cultivation details for appraisal.",
      "Verification of land records and creditworthiness by the agricultural officer.",
      "Sanction and issuance of Kisan Credit Card with revolving credit facility."
    ],
    application_type: "BOTH",
    official_info_url: "https://www.nabard.org/content1.aspx?id=572&catid=23&mid=530",
    official_application_url: "https://www.pmkisan.gov.in/KCC.aspx",
    official_source_domain: "pmkisan.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-08-31"
  },

  {
    // ── AGRI GOLD LOAN ────────────────────────────────────────────────────────
    id: "agri_gold_loan",
    scheme_id: "AGRIGOLD-001",
    title: "Agri Gold Loan",
    name_ta: "விவசாய தங்க கடன்",
    description: "Instant, hassle-free liquidity against gold ornaments for various agricultural inputs, seed sowing, and urgent machinery repairs at concessional interest rates.",
    description_ta: "விவசாய இடுபொருள்கள், விதை நடவு மற்றும் அவசர இயந்திர பழுதுபார்ப்புகளுக்கு தங்க நகைகளை அடமானமாக வைத்து உடனடி, எளிதான பணம் கிடைக்கும்.",
    category: "Banking",
    badge: "Banking",
    badgeType: "banking",
    icon: "Coins",
    department: "Commercial Banks / Cooperative Banks / Regional Rural Banks",
    government_level: "CENTRAL",
    criteria: "Quick Disbursement",
    benefit: "7.5% Int. Rate p.a.",
    eligibility_en: "Any farmer with gold ornaments to pledge and proof of agricultural activity (land records or cultivation certificate).",
    eligibility_ta: "தங்க நகைகளை அடமானமாக வைக்க தயாரான மற்றும் வேளாண்மை செயல்பாட்டின் சான்று உள்ள எந்த விவசாயியும்.",
    benefits_en: "Instant credit against gold ornaments at concessional interest rate. No income proof required. Loan disbursed within 1 hour of valuation. Repayable on crop harvest schedule.",
    benefits_ta: "தங்க நகைகளை அடமானமாக வைத்து சலுகை வட்டி விகிதத்தில் உடனடி கடன். வருமான சான்று தேவையில்லை. மதிப்பீட்டிற்கு பிறகு 1 மணி நேரத்தில் கடன் வழங்கப்படும்.",
    documents: [
      "Gold Ornaments to pledge as security",
      "Aadhaar Card or Voter ID Card",
      "Proof of Agricultural Land holding / Cultivation status"
    ],
    documents_ta: [
      "பாதுகாப்பாக அடமானமாக வைக்க தங்க நகைகள்",
      "ஆதார் அட்டை அல்லது வாக்காளர் அட்டை",
      "வேளாண்மை நில வைத்திருப்பு / சாகுபடி நிலை சான்று"
    ],
    process: [
      "Visit your nearest commercial or cooperative bank branch with gold ornaments.",
      "On-the-spot appraisal of gold weight and purity by bank officials.",
      "Sign simple loan agreement with land proof.",
      "Receive cash in hand or bank credit within 45 minutes of valuation."
    ],
    // This scheme is processed at bank branches — no central online application portal
    application_type: "OFFLINE",
    official_info_url: "https://www.nabard.org/content1.aspx?id=572",
    official_application_url: null,
    official_source_domain: null,
    last_verified_date: "2026-08-13",
    verification_status: "OFFLINE",
    lastDate: "2026-12-15"
  },

  {
    // ── TRACTOR LOAN / SMAM ───────────────────────────────────────────────────
    id: "tractor_loan",
    scheme_id: "SMAM-001",
    title: "Tractor Loan (SMAM Subsidy)",
    name_ta: "டிராக்டர் கடன் (SMAM மானியம்)",
    description: "Finance your agricultural machinery purchase with flexible, low-interest EMI structures and government subsidy under Sub-Mission on Agricultural Mechanization (SMAM).",
    description_ta: "SMAM (வேளாண் இயந்திரமயமாக்கல் துணை-பணி) கீழ் அரசு மானியத்துடன் நெகிழ்வான, குறைந்த வட்டி தவணைகளுடன் விவசாய இயந்திரங்களை வாங்க நிதி உதவி.",
    category: "Machinery",
    badge: "Machinery",
    badgeType: "machinery",
    icon: "Truck",
    department: "Ministry of Agriculture & Farmers Welfare (SMAM) / Commercial Banks / NABARD",
    government_level: "CENTRAL_AND_STATE",
    criteria: "Up to 7 Years Tenure",
    benefit: "25–50% Subsidy + 90% Funding",
    eligibility_en: "Individual farmers, farmer groups, and agricultural enterprises. SC/ST and small/marginal farmers receive 50% subsidy; general farmers receive 25% subsidy under SMAM.",
    eligibility_ta: "தனி விவசாயிகள், விவசாயி குழுக்கள் மற்றும் வேளாண் நிறுவனங்கள். SC/ST மற்றும் சிறு/குறு விவசாயிகள் 50% மானியம்; பொது விவசாயிகள் 25% மானியம் SMAM கீழ்.",
    benefits_en: "25–50% subsidy on tractor and agricultural machinery under SMAM. Up to 90% of on-road price financed at subsidized interest rates. Repayment tenure up to 7 years.",
    benefits_ta: "SMAM கீழ் டிராக்டர் மற்றும் வேளாண் இயந்திரங்களில் 25-50% மானியம். சாலை விலையில் 90% வரை சலுகை வட்டி விகிதத்தில் நிதியளிப்பு. 7 ஆண்டுகள் வரை திரும்பச் செலுத்தும் காலம்.",
    documents: [
      "Proforma Invoice of chosen Tractor model from authorised dealer",
      "7/12 Extract or land possession holding proof",
      "Last 6 months bank statement showing transactions",
      "Aadhaar & PAN card copy"
    ],
    documents_ta: [
      "அங்கீகரிக்கப்பட்ட விற்பனையாளரிடமிருந்து டிராக்டர் மாதிரியின் ப்ரோ-ஃபார்மா இன்வாய்ஸ்",
      "7/12 சாரம் அல்லது நில வைத்திருப்பு சான்று",
      "கடந்த 6 மாத வங்கி அறிக்கை",
      "ஆதார் மற்றும் பான் அட்டை நகல்"
    ],
    process: [
      "Apply for SMAM subsidy online at agrimachinery.nic.in.",
      "Obtain tractor quotation from authorized dealer.",
      "Submit loan application with land holding documents to a participating bank.",
      "After approval and subsidy credit, loan disbursed directly to dealer."
    ],
    application_type: "BOTH",
    official_info_url: "https://agricoop.nic.in/en/smam",
    official_application_url: "https://agrimachinery.nic.in/",
    official_source_domain: "agrimachinery.nic.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-10-30"
  },

  {
    // ── TN MICRO IRRIGATION ───────────────────────────────────────────────────
    id: "tn_micro_irrigation",
    scheme_id: "TNMI-001",
    title: "TN Micro Irrigation Scheme",
    name_ta: "தமிழ்நாடு நுண் நீர்ப்பாசன திட்டம்",
    description: "Financial assistance for installation of drip and sprinkler irrigation systems on farmland to promote water-use efficiency and increase agricultural productivity.",
    description_ta: "நீர் பயன்பாட்டு திறனை மேம்படுத்தவும் வேளாண் உற்பத்தியை அதிகரிக்கவும் வயல்களில் சொட்டு நீர்ப்பாசனம் மற்றும் தெளிப்பு நீர்ப்பாசன அமைப்புகள் நிறுவ நிதி உதவி.",
    category: "Government",
    badge: "Tamil Nadu",
    badgeType: "govt",
    icon: "Sun",
    department: "Tamil Nadu Agriculture Department / Tamil Nadu Horticulture Department",
    government_level: "TAMIL_NADU",
    criteria: "Farmers with irrigated land",
    benefit: "45–90% Subsidy",
    eligibility_en: "All farmers in Tamil Nadu. SC/ST farmers and small/marginal farmers receive up to 90% subsidy. General category farmers receive 45% subsidy on drip/sprinkler irrigation installation.",
    eligibility_ta: "தமிழ்நாட்டின் அனைத்து விவசாயிகளும். SC/ST விவசாயிகள் மற்றும் சிறு/குறு விவசாயிகள் 90% வரை மானியம். பொது வகை விவசாயிகள் 45% மானியம் பெறுவார்கள்.",
    benefits_en: "45% to 90% subsidy on purchase and installation of drip/sprinkler irrigation systems. Components covered include laterals, emitters, filters, and mainlines.",
    benefits_ta: "சொட்டு/தெளிப்பு நீர்ப்பாசன அமைப்புகளை வாங்குவதற்கும் நிறுவுவதற்கும் 45% முதல் 90% வரை மானியம். பக்க குழாய்கள், நீர்வழங்கிகள், வடிகட்டிகள் மற்றும் முதன்மை குழாய்கள் உள்ளடக்கப்படுகின்றன.",
    documents: [
      "Land ownership documents / Pattadar Passbook",
      "Aadhaar Card",
      "Bank Passbook copy",
      "Community certificate (for SC/ST farmers)"
    ],
    documents_ta: [
      "நில உரிமை ஆவணங்கள் / பட்டாதார் பாஸ்புக்",
      "ஆதார் அட்டை",
      "வங்கி பாஸ்புக் நகல்",
      "சமுதாய சான்றிதழ் (SC/ST விவசாயிகளுக்கு)"
    ],
    process: [
      "Apply online through the Tamil Nadu Agriculture Department e-Portal (apps.tn.gov.in/agriportal).",
      "District Agriculture Officer inspects land and verifies application.",
      "Empanelled vendor installs the drip/sprinkler system.",
      "Subsidy credited directly to bank account after installation verification."
    ],
    application_type: "ONLINE",
    official_info_url: "https://www.tn.gov.in/scheme/data_view/3",
    official_application_url: "https://apps.tn.gov.in/agriportal/",
    official_source_domain: "apps.tn.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-09-30"
  },

  {
    // ── SPECIAL DROUGHT RELIEF & NATURAL CALAMITY SUBSIDY ─────────────────────
    id: "special_drought_relief",
    scheme_id: "TNDR-001",
    title: "Special Drought Relief & Input Subsidy",
    name_ta: "சிறப்பு வறட்சி நிவாரணம் மற்றும் இடுபொருள் மானியம்",
    description: "Emergency financial assistance, crop damage input subsidy, and fodder/water support for farmers in declared drought-hit and deficit monsoon districts.",
    description_ta: "வறட்சியால் பாதிக்கப்பட்ட மாவட்டங்களில் உள்ள விவசாயிகளுக்கு அவசர நிதி உதவி, பயிர் சேத இடுபொருள் நிவாரணம் மற்றும் தீவன/நீர்ப்பாசன உதவி.",
    category: "Government",
    badge: "Urgent Relief",
    badgeType: "active",
    icon: "ShieldAlert",
    department: "Revenue & Disaster Management Department / Tamil Nadu Agriculture Department",
    government_level: "TAMIL_NADU",
    criteria: "Farmers in Drought Declared Blocks (33%+ crop loss)",
    benefit: "Up to ₹13,500/Hectare Direct DBT",
    eligibility_en: "All small, marginal, and tenant farmers holding agricultural land in notified drought-affected revenue blocks with assessed crop loss of 33% or more.",
    eligibility_ta: "வறட்சியால் பாதிக்கப்பட்டதாக அறிவிக்கப்பட்ட வருவாய் வட்டங்களில் 33% அல்லது அதற்கு மேல் பயிர் சேதம் அடைந்த அனைத்து சிறு, குறு மற்றும் குத்தகை விவசாயிகள்.",
    benefits_en: "Input subsidy of ₹8,500/hectare for rainfed crops, ₹17,000/hectare for irrigated crops under SDRF norms, plus 100% fodder subsidy for livestock farmers.",
    benefits_ta: "மழைசார் பயிர்களுக்கு ஹெக்டேருக்கு ₹8,500, பாசன பயிர்களுக்கு ஹெக்டேருக்கு ₹17,000 இடுபொருள் மானியம் (SDRF விதிமுறைகள்), மற்றும் கால்நடைகளுக்கு 100% இலவச தீவன உதவி.",
    documents: [
      "Land Ownership Documents / Adangal / Chitta",
      "Village Administrative Officer (VAO) Crop Damage Certificate",
      "Aadhaar Card",
      "Aadhaar-linked Bank Passbook copy"
    ],
    documents_ta: [
      "நில உரிமை ஆவணங்கள் / அடங்கல் / சிட்டா",
      "கிராம நிர்வாக அலுவலர் (VAO) பயிர் சேத சான்றிதழ்",
      "ஆதார் அட்டை",
      "ஆதார் இணைக்கப்பட்ட வங்கி பாஸ்புக் நகல்"
    ],
    process: [
      "District Collectorate and Agriculture Department conduct joint enumeration of drought-affected fields.",
      "Submit crop loss verification claim with VAO or at the local e-Sevai / Uzhavan portal.",
      "Field inspection and geo-tagged verification by agricultural revenue team.",
      "Direct Benefit Transfer (DBT) credit directly into the farmer's bank account."
    ],
    application_type: "ONLINE",
    official_info_url: "https://www.tn.gov.in/department/30",
    official_application_url: "https://tnhorticulture.tn.gov.in/",
    official_source_domain: "tnhorticulture.tn.gov.in",
    last_verified_date: "2026-08-13",
    verification_status: "VERIFIED",
    lastDate: "2026-11-30"
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

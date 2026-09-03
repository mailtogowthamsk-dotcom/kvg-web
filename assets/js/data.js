/* ============================================================
   கொங்கு வேட்டுவ கவுண்டர் சமூகம் — Content Data Layer
   All page content lives in these arrays so the site can later
   be connected to a CMS / API / Firebase without touching markup.

   NOTE ON CONTENT:
   - All entries below are DEMO / PLACEHOLDER data.
   - Kulam names, temple details and statistics are samples.
   - Replace with community-verified information before publishing.
   - Historical / genealogical facts must be independently verified.
   ============================================================ */

/* ---------- Quick statistics (DEMO DATA) ---------- */
const communityStats = [
  { id: "members",   labelTa: "பதிவு செய்த உறுப்பினர்கள்", value: 4820, suffix: "+" },
  { id: "matri",     labelTa: "திருமணப் பதிவுகள்",        value: 1360, suffix: "+" },
  { id: "kulams",    labelTa: "ஆவணப்படுத்திய குலங்கள்",   value: 359,  suffix: ""  },
  { id: "temples",   labelTa: "பட்டியலிட்ட கோயில்கள்",     value: 118,  suffix: ""  },
  { id: "articles",  labelTa: "செய்திக் கட்டுரைகள்",       value: 260,  suffix: "+" },
  { id: "events",    labelTa: "சமூக நிகழ்வுகள்",           value: 75,   suffix: "+" }
];

/* ---------- App features (DEMO — edit before claiming) ---------- */
const appFeatures = [
  { icon: "👥", titleTa: "உறுப்பினர் இணைப்பு",  descTa: "சமூக உறுப்பினர்களை ஒன்றிணைத்து தொடர்பில் இருக்க உதவுகிறது." },
  { icon: "📰", titleTa: "செய்திகள் & அறிவிப்புகள்", descTa: "சமூகச் செய்திகள் மற்றும் அறிவிப்புகளை உடனுக்குடன் பெறலாம்." },
  { icon: "🗨️", titleTa: "சமூக பகிர்வு",        descTa: "படங்கள் மற்றும் காணொளிகளைப் பகிரும் பகிர்வுத் தளம்." },
  { icon: "💍", titleTa: "திருமணப் பதிவுகள்",     descTa: "பாதுகாப்பான திருமணப் பதிவுகள் மற்றும் தேடல் வசதி." },
  { icon: "🔍", titleTa: "சுயவிவரத் தேடல்",       descTa: "கல்வி, தொழில், இடம் அடிப்படையில் தேடல் வடிகட்டிகள்." },
  { icon: "🏛️", titleTa: "குலம் & கோயில் தகவல்",  descTa: "குலம் மற்றும் கோயில் தொடர்பான தகவல்கள்." },
  { icon: "📅", titleTa: "நிகழ்வுகள்",           descTa: "சமூக நிகழ்வுகள் மற்றும் விழாத் தகவல்கள்." },
  { icon: "🔔", titleTa: "அறிவிப்புகள்",          descTa: "முக்கிய தகவல்களுக்கான உடனடி அறிவிப்புகள்." },
  { icon: "🔒", titleTa: "தனியுரிமைக் கட்டுப்பாடு", descTa: "உங்கள் தகவலைப் பகிர்வது குறித்த முழுக் கட்டுப்பாடு." }
];

/* ---------- App screenshots (placeholders) ---------- */
const appScreens = [
  "assets/images/app/screen-1.svg",
  "assets/images/app/screen-2.svg",
  "assets/images/app/screen-3.svg"
];

/* ---------- Testimonials (SAMPLE CONTENT — clearly labelled) ---------- */
const testimonials = [
  { nameTa: "மாதிரி உறுப்பினர் 1", roleTa: "உறுப்பினர் (மாதிரி)", initial: "ம", textTa: "இந்தத் தளம் சமூக உறவுகளை இணைக்க உதவுகிறது. (மாதிரி உள்ளடக்கம்)" },
  { nameTa: "மாதிரி உறுப்பினர் 2", roleTa: "பெற்றோர் (மாதிரி)",   initial: "உ", textTa: "செய்திகளையும் நிகழ்வுகளையும் எளிதாக அறிந்துகொள்ள முடிகிறது. (மாதிரி உள்ளடக்கம்)" },
  { nameTa: "மாதிரி உறுப்பினர் 3", roleTa: "மாணவர் (மாதிரி)",    initial: "மா", textTa: "கல்வி தொடர்பான தகவல்கள் பயனுள்ளதாக உள்ளன. (மாதிரி உள்ளடக்கம்)" }
];

/* ---------- App / config placeholders (single source of truth) ---------- */
const appConfig = {
  appNameTa:       "[செயலி பெயர்]",
  version:         "[பதிப்பு எ.கா. 1.0.0]",
  releaseDate:     "[வெளியீட்டு தேதி]",
  size:            "[அளவு எ.கா. 18 MB]",
  minAndroid:      "[Android பதிப்பு எ.கா. 7.0+]",
  developer:       "[டெவலப்பர் பெயர்]",
  playStoreUrl:    "",         /* Add Google Play URL when available */
  apkUrl:          "",         /* Optional direct APK, only if officially offered */
  supportEmail:    "contact@konguvettuvagounder.com",
  qrImage:         "assets/images/app/qr-placeholder.svg"
};

/* ---------- Contact config ---------- */
function resolveWebsiteContactEndpoint() {
  try {
    const h = typeof location !== "undefined" ? location.hostname : "";
    if (!h || h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:4000/api/website/contact";
    }
  } catch (_) { /* ignore */ }
  return "https://www.infosensetechnologies.com/digitalhouse/backend/api/website/contact";
}

const contactConfig = {
  email:      "contact@konguvettuvagounder.com",
  hoursTa:    "திங்கள் – சனி, காலை 10:00 – மாலை 6:00",
  formEndpoint: resolveWebsiteContactEndpoint()
};

/* Expose (for clarity in browser console / future modules) */
window.CommunityData = {
  communityStats,
  appFeatures, appScreens, testimonials, appConfig, contactConfig
};

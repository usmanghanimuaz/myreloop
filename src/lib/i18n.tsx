import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * ReLoop interface translations.
 *
 * Scope (kept honest): navigation, footer, common buttons/labels, empty states
 * and the homepage are translated for every language below. Long-form content
 * (articles, policies, About story) is written in English only for now; those
 * pages show a clear note when viewed in another language instead of showing
 * broken or machine-translated legal text.
 */

export const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANG: Lang = "en";
const STORAGE_KEY = "reloop-language";

const en = {
  "nav.home": "Home",
  "nav.exchange": "Available Items — I Have",
  "nav.needs": "Community Needs — I Need",
  "nav.finder": "Material Guidance",
  "nav.about": "Waste & Evidence",
  "nav.actions": "Community Activity",
  "nav.impact": "Impact Tracker",
  "nav.blog": "Learning Blog",
  "nav.main": "Main",
  "nav.open": "Open navigation",
  "nav.skip": "Skip to content",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.language": "Language",
  "common.tagline": "Local waste → local resources",
  "common.free": "FREE",
  "common.exchange": "EXCHANGE",
  "common.loading": "Loading your saved records…",
  "common.browseAll": "Browse all items",
  "common.seeAllNeeds": "See all needs",
  "common.photoCredit": "Illustrative photo via Unsplash",
  "common.langNote":
    "This page's full text is currently available in English. Interface translations cover navigation and common actions; detailed articles and policies remain in English for accuracy.",
  "home.eyebrow": "ReLoop — waste prevention through reuse",
  "home.heroTitle": "Don't throw useful things away. Pass them on.",
  "home.heroText":
    "Usable items are often thrown away simply because their owner no longer needs them — wasting their remaining useful life and adding to the waste problem. ReLoop helps you list them for FREE or EXCHANGE so a neighbour can give them another life, and guides you to repair, recycle or dispose responsibly when reuse isn't possible.",
  "home.ctaExplore": "Explore available items",
  "home.ctaShare": "Share an item",
  "home.ctaNeed": "Post a need",
  "home.howTitle": "How ReLoop works",
  "home.howText":
    "Four simple steps that keep usable things out of bins, drains and dumps — and help a neighbour at the same time.",
  "home.step1Title": "Before you throw it away",
  "home.step1Text":
    "If an item is still usable, list it instead of discarding it. Every reused item is one less thing burned, dumped or buried.",
  "home.step2Title": "Reuse before buying new",
  "home.step2Text":
    "Looking for something? Check existing usable items nearby first — someone may already have what you need.",
  "home.step3Title": "Give it another life",
  "home.step3Text":
    "Offer it FREE or arrange an EXCHANGE. Meet locally, hand over safely, and both sides confirm so the record is real.",
  "home.step4Title": "Manage waste responsibly",
  "home.step4Text":
    "When reuse isn't possible: repair, recycle through the right stream, or use designated collection points for hazardous items.",
  "home.communityTitle": "Happening in the community",
  "home.communityText":
    "Real records from this ReLoop community. Impact counts only handovers confirmed by both participants.",
  "home.noListings": "Nothing listed yet — be the first to pass something on.",
  "home.noNeeds": "No open needs right now — post one if you're looking for something.",
  "home.noActivity": "No activity recorded yet.",
  "footer.explore": "Explore",
  "footer.learn": "Learn",
  "footer.about": "About",
  "footer.policies": "Policies",
  "footer.home": "Home",
  "footer.items": "Available Items",
  "footer.needs": "Community Needs",
  "footer.guidance": "Material Guidance",
  "footer.activity": "Community Activity",
  "footer.impact": "Impact Tracker",
  "footer.evidence": "Waste & Evidence",
  "footer.blog": "Learning Blog",
  "footer.faq": "FAQ",
  "footer.how": "How ReLoop Works",
  "footer.aboutUs": "About Us",
  "footer.mission": "Our Mission",
  "footer.contact": "Contact Us",
  "footer.report": "Report a Problem",
  "footer.terms": "Terms & Conditions",
  "footer.privacy": "Privacy Policy",
  "footer.cookies": "Cookie Policy",
  "footer.guidelines": "Community Guidelines",
  "footer.safety": "Safety & Exchange Policy",
  "footer.disclaimer": "Content Disclaimer",
  "footer.tagline":
    "An environmental waste-prevention initiative: reuse first, recycle right, dispose safely.",
};

type Dict = Record<keyof typeof en, string>;

const ur: Dict = {
  "nav.home": "ہوم",
  "nav.exchange": "دستیاب اشیاء — میرے پاس ہے",
  "nav.needs": "کمیونٹی ضروریات — مجھے چاہیے",
  "nav.finder": "مواد کی رہنمائی",
  "nav.about": "کچرا اور شواہد",
  "nav.actions": "کمیونٹی سرگرمی",
  "nav.impact": "امپیکٹ ٹریکر",
  "nav.blog": "تعلیمی بلاگ",
  "nav.main": "مرکزی",
  "nav.open": "نیویگیشن کھولیں",
  "nav.skip": "مواد پر جائیں",
  "common.signIn": "سائن ان",
  "common.signOut": "سائن آؤٹ",
  "common.language": "زبان",
  "common.tagline": "مقامی کچرا → مقامی وسائل",
  "common.free": "مفت",
  "common.exchange": "تبادلہ",
  "common.loading": "آپ کے محفوظ ریکارڈ لوڈ ہو رہے ہیں…",
  "common.browseAll": "تمام اشیاء دیکھیں",
  "common.seeAllNeeds": "تمام ضروریات دیکھیں",
  "common.photoCredit": "وضاحتی تصویر — Unsplash",
  "common.langNote":
    "اس صفحے کا مکمل متن فی الحال انگریزی میں دستیاب ہے۔ انٹرفیس ترجمہ نیویگیشن اور عام اعمال تک محدود ہے؛ تفصیلی مضامین اور پالیسیاں درستگی کے لیے انگریزی میں ہیں۔",
  "home.eyebrow": "ReLoop — دوبارہ استعمال سے کچرے کی روک تھام",
  "home.heroTitle": "قابلِ استعمال چیزیں مت پھینکیں۔ آگے پہنچائیں۔",
  "home.heroText":
    "قابلِ استعمال اشیاء اکثر صرف اس لیے پھینک دی جاتی ہیں کہ مالک کو انہیں مزید ضرورت نہیں — اس سے ان کی باقی کارآمد زندگی ضائع ہوتی ہے اور کچرے کا مسئلہ بڑھتا ہے۔ ReLoop آپ کو انہیں مفت یا تبادلے پر درج کرنے میں مدد دیتا ہے تاکہ کوئی ہمسایہ انہیں نئی زندگی دے سکے، اور جب دوبارہ استعمال ممکن نہ ہو تو مرمت، ری سائیکلنگ یا محفوظ تلفی کی رہنمائی دیتا ہے۔",
  "home.ctaExplore": "دستیاب اشیاء دیکھیں",
  "home.ctaShare": "چیز شیئر کریں",
  "home.ctaNeed": "ضرورت پوسٹ کریں",
  "home.howTitle": "ReLoop کیسے کام کرتا ہے",
  "home.howText":
    "چار آسان اقدامات جو قابلِ استعمال چیزوں کو ڈبوں، نالیوں اور کچرا کنڈیوں سے بچاتے ہیں — اور ساتھ ہی کسی ہمسایہ کی مدد بھی کرتے ہیں۔",
  "home.step1Title": "پھینکنے سے پہلے سوچیں",
  "home.step1Text":
    "اگر چیز اب بھی قابلِ استعمال ہے تو پھینکنے کے بجائے اسے درج کریں۔ ہر دوبارہ استعمال شدہ چیز ایک ایسی چیز کم ہے جو جلائی، ڈمپ یا دبائی جائے۔",
  "home.step2Title": "نیا خریدنے سے پہلے دوبارہ استعمال",
  "home.step2Text":
    "کوئی چیز چاہیے؟ پہلے قریبی دستیاب اشیاء دیکھیں — ہو سکتا ہے کسی کے پاس پہلے سے موجود ہو۔",
  "home.step3Title": "اسے نئی زندگی دیں",
  "home.step3Text":
    "مفت پیش کریں یا تبادلے کا بندوبست کریں۔ مقامی ملاقات کریں، محفوظ حوالگی کریں، اور دونوں فریق تصدیق کریں تاکہ ریکارڈ حقیقی ہو۔",
  "home.step4Title": "کچرے کا ذمہ دارانہ انتظام",
  "home.step4Text":
    "جب دوبارہ استعمال ممکن نہ ہو: مرمت کریں، صحیح طریقے سے ری سائیکل کریں، یا خطرناک اشیاء کے لیے مختص جمع گاہیں استعمال کریں۔",
  "home.communityTitle": "کمیونٹی میں کیا ہو رہا ہے",
  "home.communityText":
    "اس ReLoop کمیونٹی کے حقیقی ریکارڈ۔ امپیکٹ میں صرف وہ حوالگیاں شمار ہوتی ہیں جن کی دونوں فریق تصدیق کریں۔",
  "home.noListings": "ابھی کچھ درج نہیں — سب سے پہلے آپ کوئی چیز آگے پہنچائیں۔",
  "home.noNeeds": "فی الحال کوئی کھلی ضرورت نہیں — اگر آپ کو کچھ چاہیے تو پوسٹ کریں۔",
  "home.noActivity": "ابھی کوئی سرگرمی درج نہیں۔",
  "footer.explore": "دریافت کریں",
  "footer.learn": "سیکھیں",
  "footer.about": "تعارف",
  "footer.policies": "پالیسیاں",
  "footer.home": "ہوم",
  "footer.items": "دستیاب اشیاء",
  "footer.needs": "کمیونٹی ضروریات",
  "footer.guidance": "مواد کی رہنمائی",
  "footer.activity": "کمیونٹی سرگرمی",
  "footer.impact": "امپیکٹ ٹریکر",
  "footer.evidence": "کچرا اور شواہد",
  "footer.blog": "تعلیمی بلاگ",
  "footer.faq": "عمومی سوالات",
  "footer.how": "ReLoop کیسے کام کرتا ہے",
  "footer.aboutUs": "ہمارے بارے میں",
  "footer.mission": "ہمارا مشن",
  "footer.contact": "رابطہ کریں",
  "footer.report": "مسئلے کی رپورٹ کریں",
  "footer.terms": "شرائط و ضوابط",
  "footer.privacy": "رازداری کی پالیسی",
  "footer.cookies": "کوکی پالیسی",
  "footer.guidelines": "کمیونٹی رہنما اصول",
  "footer.safety": "حفاظت اور تبادلے کی پالیسی",
  "footer.disclaimer": "مواد کا دستبرداری بیان",
  "footer.tagline":
    "کچرے کی روک تھام کی ماحولیاتی کوشش: پہلے دوبارہ استعمال، صحیح ری سائیکلنگ، محفوظ تلفی۔",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.exchange": "उपलब्ध वस्तुएँ — मेरे पास है",
  "nav.needs": "सामुदायिक ज़रूरतें — मुझे चाहिए",
  "nav.finder": "सामग्री मार्गदर्शन",
  "nav.about": "कचरा और साक्ष्य",
  "nav.actions": "सामुदायिक गतिविधि",
  "nav.impact": "इम्पैक्ट ट्रैकर",
  "nav.blog": "शैक्षणिक ब्लॉग",
  "nav.main": "मुख्य",
  "nav.open": "नेविगेशन खोलें",
  "nav.skip": "सामग्री पर जाएँ",
  "common.signIn": "साइन इन",
  "common.signOut": "साइन आउट",
  "common.language": "भाषा",
  "common.tagline": "स्थानीय कचरा → स्थानीय संसाधन",
  "common.free": "मुफ़्त",
  "common.exchange": "अदला-बदली",
  "common.loading": "आपके सहेजे रिकॉर्ड लोड हो रहे हैं…",
  "common.browseAll": "सभी वस्तुएँ देखें",
  "common.seeAllNeeds": "सभी ज़रूरतें देखें",
  "common.photoCredit": "सांकेतिक तस्वीर — Unsplash",
  "common.langNote":
    "इस पेज का पूरा पाठ फिलहाल अंग्रेज़ी में उपलब्ध है। इंटरफ़ेस अनुवाद नेविगेशन और सामान्य क्रियाओं तक सीमित है; विस्तृत लेख और नीतियाँ सटीकता के लिए अंग्रेज़ी में हैं।",
  "home.eyebrow": "ReLoop — पुनः उपयोग से कचरा रोकथाम",
  "home.heroTitle": "उपयोगी चीज़ें मत फेंकिए। आगे बढ़ाइए।",
  "home.heroText":
    "उपयोगी वस्तुएँ अक्सर सिर्फ़ इसलिए फेंक दी जाती हैं क्योंकि मालिक को अब उनकी ज़रूरत नहीं रहती — इससे उनका बचा हुआ उपयोगी जीवन बर्बाद होता है और कचरे की समस्या बढ़ती है। ReLoop आपको उन्हें मुफ़्त या अदला-बदली पर सूचीबद्ध करने में मदद करता है ताकि कोई पड़ोसी उन्हें नया जीवन दे सके, और जब पुनः उपयोग संभव न हो तो मरम्मत, रीसाइक्लिंग या सुरक्षित निपटान का मार्गदर्शन देता है।",
  "home.ctaExplore": "उपलब्ध वस्तुएँ देखें",
  "home.ctaShare": "वस्तु साझा करें",
  "home.ctaNeed": "ज़रूरत पोस्ट करें",
  "home.howTitle": "ReLoop कैसे काम करता है",
  "home.howText":
    "चार आसान कदम जो उपयोगी चीज़ों को कूड़ेदान, नालियों और कचरा-ढेर से बचाते हैं — और साथ ही किसी पड़ोसी की मदद भी करते हैं।",
  "home.step1Title": "फेंकने से पहले सोचें",
  "home.step1Text":
    "अगर वस्तु अभी भी उपयोगी है तो फेंकने के बजाय उसे सूचीबद्ध करें। हर पुनः उपयोग की गई वस्तु एक कम चीज़ है जो जलाई, डंप या दबाई जाए।",
  "home.step2Title": "नया खरीदने से पहले पुनः उपयोग",
  "home.step2Text":
    "कुछ चाहिए? पहले आस-पास की उपलब्ध वस्तुएँ देखें — हो सकता है किसी के पास पहले से मौजूद हो।",
  "home.step3Title": "उसे नया जीवन दें",
  "home.step3Text":
    "मुफ़्त दें या अदला-बदली करें। स्थानीय रूप से मिलें, सुरक्षित हैंडओवर करें, और दोनों पक्ष पुष्टि करें ताकि रिकॉर्ड असली हो।",
  "home.step4Title": "कचरे का ज़िम्मेदार प्रबंधन",
  "home.step4Text":
    "जब पुनः उपयोग संभव न हो: मरम्मत करें, सही तरीके से रीसायकल करें, या खतरनाक वस्तुओं के लिए नामित संग्रह केंद्रों का उपयोग करें।",
  "home.communityTitle": "समुदाय में क्या हो रहा है",
  "home.communityText":
    "इस ReLoop समुदाय के वास्तविक रिकॉर्ड। इम्पैक्ट में केवल वही हैंडओवर गिने जाते हैं जिनकी दोनों पक्ष पुष्टि करते हैं।",
  "home.noListings": "अभी कुछ सूचीबद्ध नहीं — सबसे पहले आप कुछ आगे बढ़ाएँ।",
  "home.noNeeds": "अभी कोई खुली ज़रूरत नहीं — अगर आपको कुछ चाहिए तो पोस्ट करें।",
  "home.noActivity": "अभी कोई गतिविधि दर्ज नहीं।",
  "footer.explore": "खोजें",
  "footer.learn": "सीखें",
  "footer.about": "परिचय",
  "footer.policies": "नीतियाँ",
  "footer.home": "होम",
  "footer.items": "उपलब्ध वस्तुएँ",
  "footer.needs": "सामुदायिक ज़रूरतें",
  "footer.guidance": "सामग्री मार्गदर्शन",
  "footer.activity": "सामुदायिक गतिविधि",
  "footer.impact": "इम्पैक्ट ट्रैकर",
  "footer.evidence": "कचरा और साक्ष्य",
  "footer.blog": "शैक्षणिक ब्लॉग",
  "footer.faq": "अक्सर पूछे जाने वाले प्रश्न",
  "footer.how": "ReLoop कैसे काम करता है",
  "footer.aboutUs": "हमारे बारे में",
  "footer.mission": "हमारा मिशन",
  "footer.contact": "संपर्क करें",
  "footer.report": "समस्या की रिपोर्ट करें",
  "footer.terms": "नियम और शर्तें",
  "footer.privacy": "गोपनीयता नीति",
  "footer.cookies": "कुकी नीति",
  "footer.guidelines": "सामुदायिक दिशानिर्देश",
  "footer.safety": "सुरक्षा और आदान-प्रदान नीति",
  "footer.disclaimer": "सामग्री अस्वीकरण",
  "footer.tagline":
    "कचरा रोकथाम की पर्यावरणीय पहल: पहले पुनः उपयोग, सही रीसाइक्लिंग, सुरक्षित निपटान।",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.exchange": "الأغراض المتاحة — لديّ",
  "nav.needs": "احتياجات المجتمع — أحتاج",
  "nav.finder": "إرشادات المواد",
  "nav.about": "النفايات والأدلة",
  "nav.actions": "نشاط المجتمع",
  "nav.impact": "متتبع الأثر",
  "nav.blog": "المدونة التعليمية",
  "nav.main": "الرئيسي",
  "nav.open": "فتح التنقل",
  "nav.skip": "تخطَّ إلى المحتوى",
  "common.signIn": "تسجيل الدخول",
  "common.signOut": "تسجيل الخروج",
  "common.language": "اللغة",
  "common.tagline": "نفايات محلية ← موارد محلية",
  "common.free": "مجاناً",
  "common.exchange": "تبادل",
  "common.loading": "جارٍ تحميل سجلاتك المحفوظة…",
  "common.browseAll": "تصفح جميع الأغراض",
  "common.seeAllNeeds": "عرض جميع الاحتياجات",
  "common.photoCredit": "صورة توضيحية عبر Unsplash",
  "common.langNote":
    "النص الكامل لهذه الصفحة متاح حالياً بالإنجليزية. تغطي ترجمات الواجهة التنقل والإجراءات الشائعة؛ تبقى المقالات والسياسات التفصيلية بالإنجليزية حفاظاً على الدقة.",
  "home.eyebrow": "ReLoop — الحد من النفايات عبر إعادة الاستخدام",
  "home.heroTitle": "لا ترمِ الأشياء الصالحة للاستخدام. مرّرها لغيرك.",
  "home.heroText":
    "غالباً ما تُرمى أغراض صالحة للاستخدام لمجرد أن مالكها لم يعد بحاجة إليها — فيضيع عمرها الافتراضي المتبقي وتتفاقم مشكلة النفايات. يساعدك ReLoop على إدراجها مجاناً أو للتبادل ليمنحها جارٌ حياة جديدة، ويرشدك إلى الإصلاح أو إعادة التدوير أو التخلص الآمن عندما لا تكون إعادة الاستخدام ممكنة.",
  "home.ctaExplore": "تصفح الأغراض المتاحة",
  "home.ctaShare": "شارك غرضاً",
  "home.ctaNeed": "انشر احتياجاً",
  "home.howTitle": "كيف يعمل ReLoop",
  "home.howText":
    "أربع خطوات بسيطة تُبقي الأشياء الصالحة بعيداً عن الحاويات والمجاري والمكبات — وتساعد جاراً في الوقت نفسه.",
  "home.step1Title": "قبل أن ترميه",
  "home.step1Text":
    "إذا كان الغرض لا يزال صالحاً للاستخدام، أدرجه بدلاً من رميه. كل غرض يُعاد استخدامه هو غرض أقل يُحرق أو يُدفن أو يُرمى.",
  "home.step2Title": "أعد الاستخدام قبل شراء الجديد",
  "home.step2Text":
    "تبحث عن شيء؟ تحقق أولاً من الأغراض المتاحة القريبة — ربما يملكها أحدهم بالفعل.",
  "home.step3Title": "امنحه حياة أخرى",
  "home.step3Text":
    "اعرضه مجاناً أو رتّب تبادلاً. التقِ محلياً، سلّم بأمان، ويؤكد الطرفان حتى يكون السجل حقيقياً.",
  "home.step4Title": "إدارة النفايات بمسؤولية",
  "home.step4Text":
    "عندما لا تكون إعادة الاستخدام ممكنة: أصلح، أو أعد التدوير بالطريقة الصحيحة، أو استخدم نقاط الجمع المخصصة للمواد الخطرة.",
  "home.communityTitle": "ماذا يحدث في المجتمع",
  "home.communityText":
    "سجلات حقيقية من مجتمع ReLoop هذا. لا يُحتسب في الأثر إلا التسليم المؤكد من الطرفين.",
  "home.noListings": "لا شيء مدرج بعد — كن أول من يمرّر شيئاً.",
  "home.noNeeds": "لا توجد احتياجات مفتوحة حالياً — انشر واحداً إذا كنت تبحث عن شيء.",
  "home.noActivity": "لم يُسجَّل أي نشاط بعد.",
  "footer.explore": "استكشف",
  "footer.learn": "تعلّم",
  "footer.about": "حول",
  "footer.policies": "السياسات",
  "footer.home": "الرئيسية",
  "footer.items": "الأغراض المتاحة",
  "footer.needs": "احتياجات المجتمع",
  "footer.guidance": "إرشادات المواد",
  "footer.activity": "نشاط المجتمع",
  "footer.impact": "متتبع الأثر",
  "footer.evidence": "النفايات والأدلة",
  "footer.blog": "المدونة التعليمية",
  "footer.faq": "الأسئلة الشائعة",
  "footer.how": "كيف يعمل ReLoop",
  "footer.aboutUs": "من نحن",
  "footer.mission": "مهمتنا",
  "footer.contact": "اتصل بنا",
  "footer.report": "الإبلاغ عن مشكلة",
  "footer.terms": "الشروط والأحكام",
  "footer.privacy": "سياسة الخصوصية",
  "footer.cookies": "سياسة ملفات تعريف الارتباط",
  "footer.guidelines": "إرشادات المجتمع",
  "footer.safety": "سياسة السلامة والتبادل",
  "footer.disclaimer": "إخلاء مسؤولية المحتوى",
  "footer.tagline":
    "مبادرة بيئية للحد من النفايات: أعد الاستخدام أولاً، وأعد التدوير بشكل صحيح، وتخلص بأمان.",
};

const es: Dict = {
  "nav.home": "Inicio",
  "nav.exchange": "Artículos disponibles — Tengo",
  "nav.needs": "Necesidades de la comunidad — Necesito",
  "nav.finder": "Guía de materiales",
  "nav.about": "Residuos y evidencia",
  "nav.actions": "Actividad comunitaria",
  "nav.impact": "Rastreador de impacto",
  "nav.blog": "Blog educativo",
  "nav.main": "Principal",
  "nav.open": "Abrir navegación",
  "nav.skip": "Saltar al contenido",
  "common.signIn": "Iniciar sesión",
  "common.signOut": "Cerrar sesión",
  "common.language": "Idioma",
  "common.tagline": "Residuos locales → recursos locales",
  "common.free": "GRATIS",
  "common.exchange": "INTERCAMBIO",
  "common.loading": "Cargando tus registros guardados…",
  "common.browseAll": "Ver todos los artículos",
  "common.seeAllNeeds": "Ver todas las necesidades",
  "common.photoCredit": "Foto ilustrativa vía Unsplash",
  "common.langNote":
    "El texto completo de esta página está disponible actualmente en inglés. Las traducciones de la interfaz cubren la navegación y las acciones comunes; los artículos y políticas detallados permanecen en inglés por precisión.",
  "home.eyebrow": "ReLoop — prevención de residuos mediante la reutilización",
  "home.heroTitle": "No tires cosas útiles. Pásalas a otros.",
  "home.heroText":
    "A menudo se tiran artículos utilizables simplemente porque su dueño ya no los necesita — desperdiciando su vida útil restante y agravando el problema de los residuos. ReLoop te ayuda a publicarlos GRATIS o en INTERCAMBIO para que un vecino les dé otra vida, y te guía para reparar, reciclar o desechar de forma responsable cuando la reutilización no es posible.",
  "home.ctaExplore": "Explorar artículos disponibles",
  "home.ctaShare": "Compartir un artículo",
  "home.ctaNeed": "Publicar una necesidad",
  "home.howTitle": "Cómo funciona ReLoop",
  "home.howText":
    "Cuatro pasos sencillos que mantienen las cosas útiles fuera de contenedores, desagües y vertederos — y ayudan a un vecino al mismo tiempo.",
  "home.step1Title": "Antes de tirarlo",
  "home.step1Text":
    "Si un artículo aún es utilizable, publícalo en lugar de desecharlo. Cada artículo reutilizado es uno menos que se quema, vierte o entierra.",
  "home.step2Title": "Reutiliza antes de comprar nuevo",
  "home.step2Text":
    "¿Buscas algo? Revisa primero los artículos disponibles cerca de ti — puede que alguien ya lo tenga.",
  "home.step3Title": "Dale otra vida",
  "home.step3Text":
    "Ofrécelo GRATIS o acuerda un INTERCAMBIO. Reúnete localmente, entrega con seguridad y ambas partes confirman para que el registro sea real.",
  "home.step4Title": "Gestiona los residuos responsablemente",
  "home.step4Text":
    "Cuando la reutilización no es posible: repara, recicla por el canal correcto o usa puntos de recogida designados para artículos peligrosos.",
  "home.communityTitle": "Lo que pasa en la comunidad",
  "home.communityText":
    "Registros reales de esta comunidad ReLoop. El impacto solo cuenta entregas confirmadas por ambas partes.",
  "home.noListings": "Nada publicado aún — sé la primera persona en pasar algo.",
  "home.noNeeds": "No hay necesidades abiertas ahora — publica una si buscas algo.",
  "home.noActivity": "Aún no hay actividad registrada.",
  "footer.explore": "Explorar",
  "footer.learn": "Aprender",
  "footer.about": "Acerca de",
  "footer.policies": "Políticas",
  "footer.home": "Inicio",
  "footer.items": "Artículos disponibles",
  "footer.needs": "Necesidades de la comunidad",
  "footer.guidance": "Guía de materiales",
  "footer.activity": "Actividad comunitaria",
  "footer.impact": "Rastreador de impacto",
  "footer.evidence": "Residuos y evidencia",
  "footer.blog": "Blog educativo",
  "footer.faq": "Preguntas frecuentes",
  "footer.how": "Cómo funciona ReLoop",
  "footer.aboutUs": "Sobre nosotros",
  "footer.mission": "Nuestra misión",
  "footer.contact": "Contáctanos",
  "footer.report": "Reportar un problema",
  "footer.terms": "Términos y condiciones",
  "footer.privacy": "Política de privacidad",
  "footer.cookies": "Política de cookies",
  "footer.guidelines": "Normas de la comunidad",
  "footer.safety": "Política de seguridad e intercambio",
  "footer.disclaimer": "Aviso de contenido",
  "footer.tagline":
    "Una iniciativa ambiental de prevención de residuos: reutiliza primero, recicla bien, desecha con seguridad.",
};

const fr: Dict = {
  "nav.home": "Accueil",
  "nav.exchange": "Articles disponibles — J'ai",
  "nav.needs": "Besoins de la communauté — Je cherche",
  "nav.finder": "Guide des matériaux",
  "nav.about": "Déchets et preuves",
  "nav.actions": "Activité communautaire",
  "nav.impact": "Suivi d'impact",
  "nav.blog": "Blog éducatif",
  "nav.main": "Principal",
  "nav.open": "Ouvrir la navigation",
  "nav.skip": "Aller au contenu",
  "common.signIn": "Se connecter",
  "common.signOut": "Se déconnecter",
  "common.language": "Langue",
  "common.tagline": "Déchets locaux → ressources locales",
  "common.free": "GRATUIT",
  "common.exchange": "ÉCHANGE",
  "common.loading": "Chargement de vos enregistrements…",
  "common.browseAll": "Voir tous les articles",
  "common.seeAllNeeds": "Voir tous les besoins",
  "common.photoCredit": "Photo d'illustration via Unsplash",
  "common.langNote":
    "Le texte intégral de cette page est actuellement disponible en anglais. Les traductions de l'interface couvrent la navigation et les actions courantes ; les articles et politiques détaillés restent en anglais par souci d'exactitude.",
  "home.eyebrow": "ReLoop — prévention des déchets par la réutilisation",
  "home.heroTitle": "Ne jetez pas les choses utiles. Transmettez-les.",
  "home.heroText":
    "Des objets encore utilisables sont souvent jetés simplement parce que leur propriétaire n'en a plus besoin — gaspillant leur durée de vie restante et aggravant le problème des déchets. ReLoop vous aide à les proposer GRATUITEMENT ou en ÉCHANGE pour qu'un voisin leur donne une seconde vie, et vous guide pour réparer, recycler ou éliminer correctement quand la réutilisation est impossible.",
  "home.ctaExplore": "Explorer les articles disponibles",
  "home.ctaShare": "Partager un article",
  "home.ctaNeed": "Publier un besoin",
  "home.howTitle": "Comment fonctionne ReLoop",
  "home.howText":
    "Quatre étapes simples qui gardent les objets utiles hors des poubelles, des caniveaux et des décharges — tout en aidant un voisin.",
  "home.step1Title": "Avant de le jeter",
  "home.step1Text":
    "Si un objet est encore utilisable, proposez-le au lieu de le jeter. Chaque objet réutilisé est un objet de moins brûlé, déversé ou enfoui.",
  "home.step2Title": "Réutilisez avant d'acheter neuf",
  "home.step2Text":
    "Vous cherchez quelque chose ? Regardez d'abord les articles disponibles près de chez vous — quelqu'un l'a peut-être déjà.",
  "home.step3Title": "Donnez-lui une autre vie",
  "home.step3Text":
    "Proposez-le GRATUITEMENT ou organisez un ÉCHANGE. Rencontrez-vous localement, remettez l'objet en sécurité, et les deux parties confirment pour que le suivi soit réel.",
  "home.step4Title": "Gérez les déchets de façon responsable",
  "home.step4Text":
    "Quand la réutilisation est impossible : réparez, recyclez par la bonne filière, ou utilisez les points de collecte prévus pour les articles dangereux.",
  "home.communityTitle": "Ce qui se passe dans la communauté",
  "home.communityText":
    "Des enregistrements réels de cette communauté ReLoop. L'impact ne compte que les remises confirmées par les deux participants.",
  "home.noListings": "Rien n'est encore proposé — soyez la première personne à transmettre quelque chose.",
  "home.noNeeds": "Aucun besoin ouvert pour le moment — publiez-en un si vous cherchez quelque chose.",
  "home.noActivity": "Aucune activité enregistrée pour le moment.",
  "footer.explore": "Explorer",
  "footer.learn": "Apprendre",
  "footer.about": "À propos",
  "footer.policies": "Politiques",
  "footer.home": "Accueil",
  "footer.items": "Articles disponibles",
  "footer.needs": "Besoins de la communauté",
  "footer.guidance": "Guide des matériaux",
  "footer.activity": "Activité communautaire",
  "footer.impact": "Suivi d'impact",
  "footer.evidence": "Déchets et preuves",
  "footer.blog": "Blog éducatif",
  "footer.faq": "FAQ",
  "footer.how": "Comment fonctionne ReLoop",
  "footer.aboutUs": "À propos de nous",
  "footer.mission": "Notre mission",
  "footer.contact": "Nous contacter",
  "footer.report": "Signaler un problème",
  "footer.terms": "Conditions générales",
  "footer.privacy": "Politique de confidentialité",
  "footer.cookies": "Politique relative aux cookies",
  "footer.guidelines": "Règles de la communauté",
  "footer.safety": "Politique de sécurité et d'échange",
  "footer.disclaimer": "Avertissement sur le contenu",
  "footer.tagline":
    "Une initiative environnementale de prévention des déchets : réutiliser d'abord, recycler correctement, éliminer en sécurité.",
};

const DICTS: Record<Lang, Dict> = { en, ur, hi, ar, es, fr };

export function langDir(lang: Lang): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === lang)?.dir === "rtl" ? "rtl" : "ltr";
}

interface I18n {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof en) => string;
  /** True when the visitor browses in a language whose long-form content is English-only. */
  longFormIsEnglish: boolean;
}

const I18nContext = createContext<I18n>({
  lang: DEFAULT_LANG,
  dir: "ltr",
  setLang: () => {},
  t: (key) => en[key],
  longFormIsEnglish: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Read the stored choice after hydration to avoid SSR/CSR mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && stored in DICTS) setLangState(stored as Lang);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — choice lasts for this tab only */
    }
  };

  const value: I18n = {
    lang,
    dir: langDir(lang),
    setLang,
    t: (key) => DICTS[lang][key] ?? en[key],
    longFormIsEnglish: lang !== "en",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

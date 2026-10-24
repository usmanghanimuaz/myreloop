import { useI18n } from "./i18n";
const copy = {
  title: [
    "Our Mission",
    "ہمارا مقصد",
    "हमारा उद्देश्य",
    "مهمتنا",
    "Nuestra misión",
    "Notre mission",
    "我们的使命",
  ],
  heading: [
    "Give useful things a second life.",
    "کارآمد چیزوں کو نئی زندگی دیں۔",
    "काम की चीज़ों को दूसरा जीवन दें।",
    "امنح الأشياء النافعة حياة ثانية.",
    "Da una segunda vida a las cosas útiles.",
    "Donnez une seconde vie aux objets utiles.",
    "让有用的物品焕发第二次生命。",
  ],
  body: [
    "Useful items should be reused, not thrown away. ReLoop connects people who have reusable items with people who need them — helping reduce avoidable waste and support community reuse.",
    "کارآمد چیزیں پھینکنے کے بجائے دوبارہ استعمال ہونی چاہئیں۔ ReLoop چیزیں رکھنے والوں کو ضرورت مندوں سے ملاتا ہے تاکہ غیر ضروری فضلہ کم ہو اور کمیونٹی میں دوبارہ استعمال بڑھے۔",
    "काम की चीज़ें फेंकने के बजाय दोबारा इस्तेमाल होनी चाहिए। ReLoop ऐसी वस्तुएँ रखने वालों को ज़रूरतमंदों से जोड़ता है, ताकि अनावश्यक कचरा घटे और समुदाय में पुनः उपयोग बढ़े।",
    "ينبغي إعادة استخدام الأشياء النافعة بدلاً من رميها. تربط ReLoop من لديهم أشياء قابلة للاستخدام بمن يحتاجونها، لتقليل النفايات الممكن تجنبها ودعم إعادة الاستخدام المجتمعية.",
    "Los objetos útiles deben reutilizarse, no tirarse. ReLoop conecta a quienes los tienen con quienes los necesitan, ayudando a reducir residuos evitables y apoyar la reutilización comunitaria.",
    "Les objets utiles doivent être réemployés, pas jetés. ReLoop relie ceux qui en ont à ceux qui en ont besoin, pour réduire les déchets évitables et soutenir le réemploi communautaire.",
    "有用的物品应该被再次使用，而不是丢弃。ReLoop 连接拥有可再利用物品的人与需要这些物品的人，帮助减少可避免的浪费，支持社区再利用。",
  ],
  modes: [
    "Free or Exchange. Reuse first, repair when possible, recycle responsibly when needed.",
    "مفت یا تبادلہ۔ پہلے دوبارہ استعمال، ممکن ہو تو مرمت، ضرورت ہو تو ذمہ دارانہ ری سائیکلنگ۔",
    "मुफ़्त या विनिमय। पहले पुनः उपयोग, संभव हो तो मरम्मत, ज़रूरत पर ज़िम्मेदार रीसाइक्लिंग।",
    "مجاناً أو بالتبادل. أعد الاستخدام أولاً، وأصلح إن أمكن، وأعد التدوير بمسؤولية عند الحاجة.",
    "Gratis o Intercambio. Primero reutiliza, repara si es posible y recicla responsablemente cuando sea necesario.",
    "Gratuit ou Échange. Réemployez d’abord, réparez si possible et recyclez de façon responsable si nécessaire.",
    "免费或交换。优先再利用，尽可能维修，必要时负责任地回收。",
  ],
  gotIt: ["Got it", "سمجھ گیا", "समझ गया", "فهمت", "Entendido", "Compris", "知道了"],
  close: [
    "Close mission popup",
    "مقصد کا پیغام بند کریں",
    "उद्देश्य का संदेश बंद करें",
    "إغلاق نافذة المهمة",
    "Cerrar la ventana de misión",
    "Fermer la fenêtre de mission",
    "关闭使命弹窗",
  ],
  credit: [
    "Illustrative photo · Unsplash",
    "علامتی تصویر · Unsplash",
    "उदाहरण तस्वीर · Unsplash",
    "صورة توضيحية · Unsplash",
    "Foto ilustrativa · Unsplash",
    "Photo illustrative · Unsplash",
    "示意照片 · Unsplash",
  ],
  syncFailed: [
    "Dismissed on this device. Account sync was unavailable; we’ll retry on your next visit.",
    "اس آلے پر بند کر دیا گیا۔ اکاؤنٹ سے مطابقت نہ ہو سکی؛ اگلی بار دوبارہ کوشش ہوگی۔",
    "इस डिवाइस पर बंद है। खाते से सिंक नहीं हो सका; अगली बार फिर कोशिश होगी।",
    "أُغلقت على هذا الجهاز. تعذرت المزامنة مع الحساب؛ سنحاول في الزيارة التالية.",
    "Cerrado en este dispositivo. No se pudo sincronizar con tu cuenta; se reintentará en la próxima visita.",
    "Fermé sur cet appareil. La synchronisation du compte a échoué ; nouvel essai à votre prochaine visite.",
    "已在此设备关闭。账户同步暂不可用，下次访问时会重试。",
  ],
} as const satisfies Record<
  string,
  readonly [string, string, string, string, string, string, string]
>;
const index = { en: 0, ur: 1, hi: 2, ar: 3, es: 4, fr: 5, zh: 6 } as const;
export function useMissionT() {
  const { lang } = useI18n();
  return (key: keyof typeof copy): string => copy[key][index[lang]];
}

window.WV_LANGS = { en: "English", ur: "اردو", ar: "العربية", hi: "हिन्दी", fr: "Français" };
window.WV_RTL = ["ur", "ar"];
window.WV_I18N = {
  en: {
    sub: "Visa Apply Directory", search: "Search country...", clear: "Clear",
    hint: "Select a country and open its visa application or official visa-information page.",
    r_all: "All", r_africa: "Africa", r_americas: "Americas", r_asia: "Asia", r_europe: "Europe", r_oceania: "Oceania",
    apply: "Open Visa Apply ↗", note: "Check the official government site before applying.",
    help: "Link not working? Search the official site",
    empty: "No country found.", emptyFor: 'No country found for "{q}"',
    count: n => `${n} ${n === 1 ? "country" : "countries"}`,
    f1: "World Visa • 195-country visa directory",
    f2: "World Visa is a directory. It is not a government website and does not process visas.",
    f3: "Always check the destination government/embassy website for the latest requirements before applying.",
    searchLabel: "Search countries", regionsLabel: "Filter by region", top: "Back to top", lang: "Change language",
    toLight: "Switch to light mode", toDark: "Switch to dark mode",
    favAdd: "Add {c} to favorites", favRemove: "Remove {c} from favorites",
    openAria: "Open visa page for {c} (opens official site in a new tab)"
  },
  ur: {
    sub: "ویزا اپلائی ڈائریکٹری", search: "ملک تلاش کریں...", clear: "صاف کریں",
    hint: "کوئی ملک منتخب کریں اور اس کی ویزا درخواست یا سرکاری ویزا معلومات کا صفحہ کھولیں۔",
    r_all: "سب", r_africa: "افریقہ", r_americas: "امریکا", r_asia: "ایشیا", r_europe: "یورپ", r_oceania: "اوشیانا",
    apply: "ویزا اپلائی کھولیں ↗", note: "درخواست دینے سے پہلے سرکاری حکومتی ویب سائٹ چیک کریں۔",
    help: "لنک نہیں کھل رہا؟ سرکاری سائٹ تلاش کریں",
    empty: "کوئی ملک نہیں ملا۔", emptyFor: '"{q}" کے لیے کوئی ملک نہیں ملا',
    count: n => `${n} ${n === 1 ? "ملک" : "ممالک"}`,
    f1: "ورلڈ ویزا • 195 ممالک کی ویزا ڈائریکٹری",
    f2: "ورلڈ ویزا صرف ایک ڈائریکٹری ہے۔ یہ سرکاری ویب سائٹ نہیں ہے اور ویزا پروسیس نہیں کرتی۔",
    f3: "درخواست دینے سے پہلے تازہ ترین تقاضوں کے لیے منزل والے ملک کی حکومتی یا ایمبیسی ویب سائٹ ضرور دیکھیں۔"
  },
  ar: {
    sub: "دليل التقديم على التأشيرة", search: "ابحث عن دولة...", clear: "مسح",
    hint: "اختر دولة وافتح صفحة طلب التأشيرة أو صفحة معلومات التأشيرة الرسمية.",
    r_all: "الكل", r_africa: "أفريقيا", r_americas: "الأمريكتان", r_asia: "آسيا", r_europe: "أوروبا", r_oceania: "أوقيانوسيا",
    apply: "افتح التقديم على التأشيرة ↗", note: "تحقق من الموقع الحكومي الرسمي قبل التقديم.",
    help: "الرابط لا يعمل؟ ابحث عن الموقع الرسمي",
    empty: "لم يتم العثور على دولة.", emptyFor: 'لم يتم العثور على دولة لـ "{q}"',
    count: n => n === 1 ? "دولة واحدة" : n === 2 ? "دولتان" : n >= 3 && n <= 10 ? `${n} دول` : `${n} دولة`,
    f1: "وورلد فيزا • دليل تأشيرات لـ 195 دولة",
    f2: "وورلد فيزا مجرد دليل. ليست موقعًا حكوميًا ولا تعالج التأشيرات.",
    f3: "تحقق دائمًا من موقع حكومة الوجهة أو السفارة لمعرفة أحدث المتطلبات قبل التقديم."
  },
  hi: {
    sub: "वीज़ा आवेदन डायरेक्टरी", search: "देश खोजें...", clear: "साफ़ करें",
    hint: "कोई देश चुनें और उसका वीज़ा आवेदन या आधिकारिक वीज़ा जानकारी पेज खोलें।",
    r_all: "सभी", r_africa: "अफ़्रीका", r_americas: "अमेरिका", r_asia: "एशिया", r_europe: "यूरोप", r_oceania: "ओशिनिया",
    apply: "वीज़ा आवेदन खोलें ↗", note: "आवेदन से पहले आधिकारिक सरकारी वेबसाइट ज़रूर देखें।",
    help: "लिंक नहीं खुल रहा? आधिकारिक साइट खोजें",
    empty: "कोई देश नहीं मिला।", emptyFor: '"{q}" के लिए कोई देश नहीं मिला',
    count: n => `${n} देश`,
    f1: "वर्ल्ड वीज़ा • 195 देशों की वीज़ा डायरेक्टरी",
    f2: "वर्ल्ड वीज़ा केवल एक डायरेक्टरी है। यह सरकारी वेबसाइट नहीं है और वीज़ा प्रोसेस नहीं करती।",
    f3: "आवेदन से पहले ताज़ा ज़रूरतों के लिए गंतव्य देश की सरकारी या दूतावास की वेबसाइट हमेशा देखें।"
  },
  fr: {
    sub: "Annuaire de demande de visa", search: "Rechercher un pays...", clear: "Effacer",
    hint: "Choisissez un pays et ouvrez sa page de demande de visa ou d'information officielle.",
    r_all: "Tous", r_africa: "Afrique", r_americas: "Amériques", r_asia: "Asie", r_europe: "Europe", r_oceania: "Océanie",
    apply: "Ouvrir la demande de visa ↗", note: "Vérifiez le site officiel du gouvernement avant de faire une demande.",
    help: "Lien inactif ? Chercher le site officiel",
    empty: "Aucun pays trouvé.", emptyFor: 'Aucun pays trouvé pour « {q} »',
    count: n => `${n} pays`,
    f1: "World Visa • annuaire de visas de 195 pays",
    f2: "World Visa est un annuaire. Ce n'est pas un site gouvernemental et il ne traite pas les visas.",
    f3: "Vérifiez toujours le site du gouvernement ou de l'ambassade de destination avant de faire une demande.",
    searchLabel: "Rechercher un pays", regionsLabel: "Filtrer par région", top: "Haut de page", lang: "Changer de langue",
    toLight: "Passer en mode clair", toDark: "Passer en mode sombre",
    favAdd: "Ajouter {c} aux favoris", favRemove: "Retirer {c} des favoris",
    openAria: "Ouvrir la page de visa de {c} (ouvre le site officiel dans un nouvel onglet)"
  }
};

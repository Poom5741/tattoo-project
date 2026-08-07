globalThis.process ??= {};
globalThis.process.env ??= {};
const nav$1 = { "gallery": "Gallery", "artists": "Artists", "book": "Book", "myWallet": "My Wallet", "artistPortal": "Artist Portal", "howItWorks": "How it works" };
const hero$1 = { "kicker": "One plate · One owner · One needle", "title": "Ink you can own.", "titleHtml": "Ink you<br />can <em>own</em>.", "description": "A gallery of one-of-one tattoo plates. Each design is drawn a single time, claimed by a single collector, and inked by the artist who made it. When it's gone, it's gone.", "exploreDrop": "Explore Drop", "viewArtists": "View Artists", "platesReleased": "Plates released", "residentArtists": "Resident artists", "oneOfOne": "One of one" };
const featured$1 = { "availableNow": "Available now", "latestPlates": "Latest plates", "allPlates": "All plates", "ofOne": "1 of 1", "featuredDrop": "Featured drop" };
const howItWorks$1 = { "housePrinciple": "The house principle", "title": "The Process", "subtitle": "From digital acquisition to physical realization.", "step1": { "title": "Claim the plate", "description": "Every design exists once. Acquire it and a certificate of authenticity is issued to your collection — the plate is retired from the gallery the moment you do." }, "step2": { "title": "Book the maker", "description": "The artist who drew your plate inks it, and only it. Schedule your session, choose placement and size, and reserve with a deposit." }, "step3": { "title": "Wear the original", "description": "You leave with a one-of-one tattoo and a signed proof. The design will never be drawn, sold, or inked again. Provenance stays on your certificate." } };
const artists$1 = { "roster": "The roster", "residentArtists": "Resident artists", "meetThemAll": "Meet them all" };
const cta$1 = { "title": "Your skin deserves an original.", "description": "One-of-one tattoo plates. Each design drawn once, claimed once, inked once.", "browseGallery": "Browse the gallery" };
const marketPage$1 = { "kicker": "The gallery", "title": "Plates for acquisition", "countLabel": "{n} PLATES · ONE OF EACH" };
const artistsPage$1 = { "kicker": "The roster", "title": "Resident artists", "subtitle": "Four artists. Each releases a limited run of one-off plates, draws them once, and inks them personally.", "plates": "Plates", "rating": "Rating", "available": "Available", "joinKicker": "Join the house", "joinTitle": "Are you a tattoo artist? Apply to release your plates on SAKNID.", "applyToSell": "Apply to sell" };
const bookingPage$1 = { "backToArtists": "← All artists", "kicker": "Book a session", "title": "Request an appointment", "subtitle": "Choose an artist, select a plate or describe your custom commission, and we'll reach out to confirm your session." };
const walletPage$1 = { "kicker": "Your collection", "title": "Held by you" };
const artistDetail$1 = { "backToArtists": "← All artists", "experience": "Experience", "platesReleased": "Plates released", "rating": "Rating", "sessionRate": "Session rate", "bookSession": "Book a session", "acquirePlate": "Acquire this plate", "bookArtist": "Book {name} to ink it", "reserved": "Reserved", "claimed": "Claimed — retired", "certificate": "Certificate of plate", "edition": "Edition", "medium": "Medium", "placement": "Placement", "watching": "{n} collectors", "digitalInkPlate": "Digital ink plate", "backToGallery": "← Back to gallery", "available": "Available", "resaleListings": "Active resale listings", "seller": "Seller", "price": "Price", "listed": "Listed", "action": "Action", "buyResale": "Buy resale", "soulbound": "SOULBOUND", "resellable": "RESELLABLE · {pct}% ROYALTY" };
const common$1 = { "by": "by", "loading": "Loading…", "error": "Something went wrong" };
const en = {
  nav: nav$1,
  hero: hero$1,
  featured: featured$1,
  howItWorks: howItWorks$1,
  artists: artists$1,
  cta: cta$1,
  marketPage: marketPage$1,
  artistsPage: artistsPage$1,
  bookingPage: bookingPage$1,
  walletPage: walletPage$1,
  artistDetail: artistDetail$1,
  common: common$1
};
const nav = { "gallery": "แกลเลอรี", "artists": "ศิลปิน", "book": "จอง", "myWallet": "กระเป๋าของฉัน", "artistPortal": "พอร์ทัลศิลปิน", "howItWorks": "วิธีการทำงาน" };
const hero = { "kicker": "หนึ่งเพลท · เจ้าของเดียว · เข็มเดียว", "title": "รอยสักที่คุณเป็นเจ้าของ", "titleHtml": "รอยสักที่คุณ<br />สามารถ <em>เป็นเจ้าของ</em>", "description": "แกลเลอรีเพลทลายสักแบบหนึ่งต่อหนึ่ง แต่ละแบบถูกวาดเพียงครั้งเดียว เป็นเจ้าของโดยนักสะสมคนเดียว และสักโดยศิลปินผู้สร้างสรรค์ เมื่อหมดแล้ว หมดเลย", "exploreDrop": "ดูคอลเลกชัน", "viewArtists": "ดูศิลปิน", "platesReleased": "เพลทที่ปล่อยแล้ว", "residentArtists": "ศิลปินประจำ", "oneOfOne": "หนึ่งต่อหนึ่ง" };
const featured = { "availableNow": "พร้อมให้เป็นเจ้าของ", "latestPlates": "เพลทล่าสุด", "allPlates": "ดูทั้งหมด", "ofOne": "1 ใน 1", "featuredDrop": "คอลเลกชันแนะนำ" };
const howItWorks = { "housePrinciple": "หลักการของร้าน", "title": "ขั้นตอนการทำงาน", "subtitle": "จากการซื้อดิจิทัลสู่รอยสักจริง", "step1": { "title": "จับจองเพลท", "description": "ทุกลายมีเพียงหนึ่งเดียวเท่านั้น เมื่อคุณได้รับเพลท ใบรับรองความแท้จะถูกออกให้คอลเลกชันของคุณ เพลทจะถูกปลดจากแกลเลอรีทันที" }, "step2": { "title": "จองคิวกับศิลปิน", "description": "ศิลปินผู้วาดเพลทของคุณจะเป็นคนสักให้คุณเท่านั้น จองวันเวลา เลือกตำแหน่งและขนาด และวางมัดจำเพื่อยืนยัน" }, "step3": { "title": "สวมใส่ต้นฉบับ", "description": "คุณจะได้รอยสักหนึ่งต่อหนึ่งพร้อมหลักฐานลงนาม แบบจะไม่ถูกวาด ขาย หรือสักซ้ำอีก ประวัติความเป็นมาจะอยู่บนใบรับรองของคุณตลอดไป" } };
const artists = { "roster": "รายชื่อศิลปิน", "residentArtists": "ศิลปินประจำ", "meetThemAll": "พบกับพวกเขาทั้งหมด" };
const cta = { "title": "ผิวของคุณสมควรได้รับของแท้", "description": "เพลทลายสักแบบหนึ่งต่อหนึ่ง แต่ละแบบวาดครั้งเดียว เป็นเจ้าของครั้งเดียว สักครั้งเดียว", "browseGallery": "เรียกดูแกลเลอรี" };
const marketPage = { "kicker": "แกลเลอรี", "title": "เพลทสำหรับสะสม", "countLabel": "{n} เพลท · หนึ่งต่อหนึ่ง" };
const artistsPage = { "kicker": "รายชื่อศิลปิน", "title": "ศิลปินประจำร้าน", "subtitle": "ศิลปินสี่ท่าน แต่ละท่านปล่อยเพลทแบบจำกัด วาดเพียงครั้งเดียว และสักด้วยตนเอง", "plates": "เพลท", "rating": "คะแนน", "available": "พร้อมขาย", "joinKicker": "ร่วมเป็นศิลปิน", "joinTitle": "คุณเป็นช่างสักใช่ไหม? สมัครเพื่อปล่อยเพลทของคุณบน SAKNID", "applyToSell": "สมัครขาย" };
const bookingPage = { "backToArtists": "← ศิลปินทั้งหมด", "kicker": "จองคิวสัก", "title": "ขอจองคิว", "subtitle": "เลือกศิลปิน เลือกเพลทหรืออธิบายแบบที่คุณต้องการ แล้วเราจะติดต่อเพื่อยืนยันการจอง" };
const walletPage = { "kicker": "คอลเลกชันของคุณ", "title": "ที่คุณถือครอง" };
const artistDetail = { "backToArtists": "← ศิลปินทั้งหมด", "experience": "ประสบการณ์", "platesReleased": "เพลทที่ปล่อยแล้ว", "rating": "คะแนน", "sessionRate": "อัตราค่าบริการ", "bookSession": "จองคิวสัก", "acquirePlate": "รับเพลทนี้", "bookArtist": "จอง {name} เพื่อสัก", "reserved": "ถูกจอง", "claimed": "ถูกครอบครอง — ปลดระวาง", "certificate": "ใบรับรองเพลท", "edition": "รุ่น", "medium": "สื่อ", "placement": "ตำแหน่ง", "watching": "{n} คนกำลังดู", "digitalInkPlate": "เพลทหมึกดิจิทัล", "backToGallery": "← กลับไปแกลเลอรี", "available": "พร้อมขาย", "resaleListings": "ประกาศขายต่อ", "seller": "ผู้ขาย", "price": "ราคา", "listed": "ลงประกาศ", "action": "ดำเนินการ", "buyResale": "ซื้อต่อ", "soulbound": "ผูกพัน", "resellable": "ขายต่อได้ · ค่าสิทธิ {pct}%" };
const common = { "by": "โดย", "loading": "กำลังโหลด…", "error": "เกิดข้อผิดพลาด" };
const th = {
  nav,
  hero,
  featured,
  howItWorks,
  artists,
  cta,
  marketPage,
  artistsPage,
  bookingPage,
  walletPage,
  artistDetail,
  common
};
const STORE = { en, th };
function resolve(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return "";
    current = current[part];
  }
  return typeof current === "string" ? current : "";
}
function isSupportedLocale(s) {
  return s === "en" || s === "th";
}
function createT(locale) {
  const data = STORE[locale] ?? STORE.en;
  const fallback = STORE.en;
  return (path) => {
    const result = resolve(data, path);
    if (result) return result;
    return resolve(fallback, path);
  };
}
function detectLocale(cookieHeader, acceptLanguage) {
  const match = cookieHeader.match(/locale=([a-z]{2})/);
  if (match && isSupportedLocale(match[1])) return match[1];
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    if (preferred && isSupportedLocale(preferred)) return preferred;
  }
  return "en";
}
function localeCookieValue(locale) {
  return `locale=${locale}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}
export {
  createT as c,
  detectLocale as d,
  isSupportedLocale as i,
  localeCookieValue as l
};

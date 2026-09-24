# Altus C2C — Frontend Application

Altus C2C (Course / Channel / Content Platform) platformasining foydalanuvchi interfeysi (Frontend). Ushbu dastur video kurslar, kanallar, pleylistlar va obunalarni boshqarish hamda tomosha qilish imkonini beradi.

---

## 🚀 Texnologik Stek (Tech Stack)

* **Framework & Library:** React 19, Vite 8
* **Til:** TypeScript (~6.0)
* **Styling:** Tailwind CSS v4, Lucide React, React Icons
* **State Management:** 
  * Client state: Zustand (v5)
  * Server state & Caching: TanStack Query / React Query (v5)
* **Form & Validation:** React Hook Form, Zod
* **Routing:** React Router DOM (v7)

---

## 📁 Loyiha Strukturasi

```text
src/
├── api/          # Backend REST API bilan ishlash client'lari
├── components/   # UI va komponentlar (auth, channel, layout, video, ui)
├── hooks/        # Custom React hook'lar (masalan, useAuthMutations)
├── pages/        # Asosiy sahifalar (Home, Subscriptions, History, MyChannel, Settings, Auth)
├── store/        # Zustand store'lar (useAuthStore, useChannelStore, useUploadStore, ...)
├── types/        # TypeScript interfeyslari va tiplari
└── utils/        # Yordamchi funksiyalar
```

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Kutubxonalarni o'rnatish
```bash
npm install
```

### 2. Atrof-muhit o'zgaruvchilari (`.env`)
Loyihaning ildiz qismida `.env` faylini yarating va backend API manzilini ko'rsating:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Local Serverni Ishga Tushirish
```bash
npm run dev
```
Dastur default holatda **http://localhost:5173** manzilida ishlaydi.

### 4. Production Build va Typecheck
```bash
npm run build
```

---

## ✨ Asosiy Imkoniyatlar

- 🎥 **Video & Pleylist:** Video kurslar va darsliklarni tomosha qilish
- 📺 **Kanal Boshqaruvi:** Kanal yaratish, profil va bannerni tahrirlash
- 📤 **Video Yuklash:** Video va pleylistlarni yuklash va boshqarish
- 🔔 **Obunalar:** Kanallarga obuna bo'lish va yangilanishlarni kuzatish
- 🔐 **Autentifikatsiya:** Telefon raqami va OTP kod orqali tizimga kirish/ro'yxatdan o'tish
- 🌙 **Dark/Light Mode:** Zamonaviy va moslashuvchan dizayn (Responsive UI)

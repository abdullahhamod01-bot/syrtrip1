# 🎛️ SyrTrip Admin Dashboard

لوحة تحكم شاملة لإدارة تطبيق SyrTrip للسفر والسياحة.

## ✨ المميزات

- 🔐 نظام مصادقة آمن مع JWT
- 👥 ثلاثة أدوار مختلفة:
  - **مدير عام**: إدارة كاملة للنظام
  - **مدير فنادق**: إدارة الفنادق والحجوزات
  - **مدير مطاعم**: إدارة المطاعم والقوائم
- 🏨 إدارة الفنادق (إضافة، تعديل، حذف)
- 🍽️ إدارة المطاعم والقوائم
- 🗺️ إدارة أماكن الجذب السياحية
- 🚗 إدارة خدمات المواصلات
- 📊 لوحة إحصائيات شاملة
- 📱 واجهة مستجيبة وسهلة الاستخدام
- 🌙 تصميم حديث مع Tailwind CSS

## 🚀 البدء السريع

### المتطلبات
- Node.js 16+ و npm
- Backend server يعمل على `http://localhost:5000`

### التثبيت

```bash
# الانتقال إلى مجلد admin-dashboard
cd admin-dashboard

# تثبيت الحزم
npm install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل سيرفر التطوير
npm run dev
```

سيفتح التطبيق على `http://localhost:3000`

## 🔧 بيانات دخول توضيحية

### مدير عام (Super Admin)
```
البريد: admin@syrtrip.com
كلمة المرور: admin123
```

### مدير الفنادق
```
البريد: hotel-manager@syrtrip.com
كلمة المرور: admin123
```

### مدير المطاعم
```
البريد: restaurant-manager@syrtrip.com
كلمة المرور: admin123
```

## 📁 البنية

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # الشريط الجانبي
│   │   ├── TopBar.jsx           # شريط العنوان
│   │   └── ProtectedRoute.jsx   # حماية المسارات
│   ├── pages/
│   │   ├── LoginPage.jsx        # صفحة تسجيل الدخول
│   │   ├── DashboardPage.jsx    # الصفحة الرئيسية
│   │   ├── HotelsPage.jsx       # إدارة الفنادق
│   │   ├── RestaurantsPage.jsx  # إدارة المطاعم
│   │   ├── PlacesPage.jsx       # إدارة الأماكن السياحية
│   │   ├── TransportPage.jsx    # إدارة المواصلات
│   │   ├── AdminsPage.jsx       # إدارة المديرين
│   │   └── SettingsPage.jsx     # الإعدادات
│   ├── services/
│   │   └── api.js              # خدمات API
│   ├── store/
│   │   └── authStore.js        # إدارة الحالة
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🌐 متغيرات البيئة

قم بإنشاء ملف `.env` مع المتغيرات التالية:

```
VITE_API_URL=http://localhost:5000/api
```

## 🏗️ البناء للإنتاج

```bash
npm run build
```

سيتم إنشاء مجلد `dist` يحتوي على ملفات الإنتاج.

## 📡 API المتصل

يتصل التطبيق بـ Backend الآتي:

- `POST /api/admin/login` - تسجيل دخول الإداري
- `GET /api/admin/dashboard` - الحصول على بيانات لوحة التحكم
- `GET /api/hotels` - قائمة الفنادق
- `POST /api/hotels` - إضافة فندق
- `PUT /api/hotels/:id` - تحديث فندق
- `DELETE /api/hotels/:id` - حذف فندق
- وغيرها من المسارات للمطاعم والأماكن والمواصلات

## 🛠️ التكنولوجيا المستخدمة

- **React 18** - مكتبة الواجهة الأمامية
- **Vite** - أداة البناء والتطوير
- **React Router** - التوجيه
- **Zustand** - إدارة الحالة
- **Axios** - طلبات HTTP
- **Tailwind CSS** - التصميم
- **Recharts** - الرسوم البيانية
- **React Icons** - الأيقونات

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. عمل Fork للمشروع
2. إنشاء فرع للميزة الجديدة
3. عمل Commit للتغييرات
4. عمل Push للفرع
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

## 📞 التواصل

للأسئلة والدعم، يرجى التواصل عبر:
- البريد الإلكتروني: support@syrtrip.com
- الموقع: www.syrtrip.com

---

تم الإنشاء بـ ❤️ من فريق SyrTrip

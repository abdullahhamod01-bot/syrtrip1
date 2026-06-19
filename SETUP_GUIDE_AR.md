# 📖 دليل الإعداد الكامل - SyrTrip Admin Dashboard

هذا الدليل يشرح كيفية إعداد وتشغيل لوحة تحكم SyrTrip بالكامل.

## ✅ المتطلبات المسبقة

- **Node.js** إصدار 16 أو أحدث
- **npm** أو **yarn**
- **MongoDB Atlas** (قاعدة البيانات السحابية)
- **Git** (اختياري)

## 🚀 خطوات الإعداد

### الخطوة 1: تثبيت Dependencies في Backend

```bash
# الانتقال إلى مجلد المشروع الرئيسي
cd syrtrip1

# الانتقال إلى مجلد Node.js Backend
cd node

# تثبيت الحزم
npm install
```

### الخطوة 2: إعداد متغيرات البيئة للـ Backend

تأكد أن ملف `.env` موجود مع البيانات التالية:

```env
PORT=5000
MONGO_URI=mongodb+srv://mdlltf43_db_user:j557sCIzlqaMPwTI@cluster0.xguyy8u.mongodb.net/syrtrip?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=supersecretkey
```

### الخطوة 3: تشغيل Seed Data (اختياري لكن مُنصح)

```bash
# تشغيل ملف البذر لإضافة بيانات الاختبار
node seed.js

# ستضيف هذه الخطوة:
# - 10 فنادق
# - 10 مطاعم
# - 10 أماكن جذب سياحية
# - 10 خدمات مواصلات
# - 3 حسابات إدارية جاهزة
```

### الخطوة 4: تشغيل Server Backend

```bash
# خيار 1: التشغيل العادي
npm start

# خيار 2: التشغيل مع المراقبة التلقائية (مُنصح)
npm run dev

# سيظهر: ✅ Server running on: http://localhost:5000
```

### الخطوة 5: تثبيت Dependencies لـ Dashboard

في نافذة Terminal جديدة:

```bash
# العودة إلى المجلد الرئيسي
cd ..

# الانتقال إلى مجلد Admin Dashboard
cd admin-dashboard

# تثبيت الحزم
npm install
```

### الخطوة 6: إعداد متغيرات البيئة للـ Dashboard

```bash
# نسخ ملف البيئة
cp .env.example .env

# تحرير .env إذا احتاج الأمر (اختياري)
# VITE_API_URL=http://localhost:5000/api
```

### الخطوة 7: تشغيل Dashboard

```bash
npm run dev

# سيظهر: VITE v5.0.8 ready in XXX ms
# ➜  Local:   http://localhost:3000/
```

## 🔑 بيانات تسجيل الدخول

الآن يمكنك فتح المتصفح على `http://localhost:3000` واستخدام أحد الحسابات التالية:

### 1️⃣ مدير عام (Super Admin)
- **البريد**: admin@syrtrip.com
- **كلمة المرور**: admin123
- **الصلاحيات**: إدارة كاملة للنظام، جميع الميزات

### 2️⃣ مدير الفنادق
- **البريد**: hotel-manager@syrtrip.com
- **كلمة المرور**: admin123
- **الصلاحيات**: إدارة الفنادق وعرض الإحصائيات

### 3️⃣ مدير المطاعم
- **البريد**: restaurant-manager@syrtrip.com
- **كلمة المرور**: admin123
- **الصلاحيات**: إدارة المطاعم وعرض الإحصائيات

## 📋 القائمة الرئيسية للـ Dashboard

بعد تسجيل الدخول، ستجد القائمة التالية (حسب الصلاحيات):

### مدير عام:
- ✅ لوحة التحكم
- ✅ الفنادق
- ✅ المطاعم
- ✅ أماكن الجذب
- ✅ المواصلات
- ✅ المديرون
- ✅ الإعدادات

### مدير الفنادق:
- ✅ لوحة التحكم
- ✅ الفنادق
- ✅ الإعدادات

### مدير المطاعم:
- ✅ لوحة التحكم
- ✅ المطاعم
- ✅ الإعدادات

## 🎨 الميزات الرئيسية

### 1. لوحة التحكم الرئيسية
- إحصائيات شاملة عن المحتوى
- رسوم بيانية وتصورات بيانية
- معلومات الحساب
- اختصارات سريعة

### 2. إدارة الفنادق
- عرض قائمة كاملة بجميع الفنادق
- إضافة فندق جديد
- تعديل بيانات الفندق (الاسم، الموقع، السعر، التقييم)
- حذف الفندق
- كل التغييرات تُحفظ مباشرة في قاعدة البيانات

### 3. إدارة المطاعم
- نفس الميزات كالفنادق
- إضافة حقول خاصة بالمطاعم (نوع الطعام)
- إدارة كاملة للمطاعم

### 4. إدارة أماكن الجذب (للمدير العام فقط)
- إضافة أماكن سياحية جديدة
- تعديل البيانات
- حذف الأماكن

### 5. إدارة المواصلات (للمدير العام فقط)
- إدارة خدمات النقل والمواصلات
- تحديث الأسعار والتقييمات

### 6. إدارة المديرين (للمدير العام فقط)
- عرض جميع المديرين
- إضافة مدير جديد
- تعديل بيانات المدير
- حذف المدير
- إسناد الصلاحيات والأدوار

### 7. الإعدادات
- تغيير كلمة المرور
- عرض معلومات الحساب
- معلومات النظام

## 🔄 API Endpoints المتوفرة

### Admin API
```
POST   /api/admin/login              - تسجيل الدخول
GET    /api/admin/dashboard          - بيانات لوحة التحكم
POST   /api/admin/change-password    - تغيير كلمة المرور
POST   /api/admin/create             - إضافة مدير جديد (Super Admin فقط)
GET    /api/admin/all                - قائمة جميع المديرين (Super Admin فقط)
PUT    /api/admin/:id                - تحديث المدير (Super Admin فقط)
DELETE /api/admin/:id                - حذف المدير (Super Admin فقط)
```

### Hotels API
```
GET    /api/hotels                   - قائمة الفنادق
GET    /api/hotels/:id               - تفاصيل الفندق
POST   /api/hotels                   - إضافة فندق
PUT    /api/hotels/:id               - تحديث الفندق
DELETE /api/hotels/:id               - حذف الفندق
```

### Restaurants API
```
GET    /api/restaurants              - قائمة المطاعم
GET    /api/restaurants/:id          - تفاصيل المطعم
POST   /api/restaurants              - إضافة مطعم
PUT    /api/restaurants/:id          - تحديث المطعم
DELETE /api/restaurants/:id          - حذف المطعم
```

### Places API
```
GET    /api/places                   - قائمة الأماكن
GET    /api/places/:id               - تفاصيل المكان
POST   /api/places                   - إضافة مكان
PUT    /api/places/:id               - تحديث المكان
DELETE /api/places/:id               - حذف المكان
```

### Transport API
```
GET    /api/transport                - قائمة المواصلات
GET    /api/transport/:id            - تفاصيل المواصلة
POST   /api/transport                - إضافة مواصلة
PUT    /api/transport/:id            - تحديث المواصلة
DELETE /api/transport/:id            - حذف المواصلة
```

## 🐛 استكشاف الأخطاء

### المشكلة: لا يمكن الاتصال بـ Backend
**الحل:**
```bash
# تأكد أن Backend يعمل على port 5000
npm run dev  # في مجلد node

# تحقق من أن .env يحتوي على البيانات الصحيحة
```

### المشكلة: خطأ في قاعدة البيانات
**الحل:**
```bash
# تأكد من أن MONGO_URI صحيح في .env
# تحقق من اتصالك بالإنترنت
# تأكد أن IP الحالي مضاف في MongoDB Atlas
```

### المشكلة: بيانات تسجيل الدخول غير صحيحة
**الحل:**
```bash
# شغّل seed.js لإعادة تعيين البيانات
node seed.js
```

## 📦 البناء للإنتاج

### بناء Dashboard
```bash
cd admin-dashboard
npm run build

# سيتم إنشاء مجلد `dist` جاهز للنشر
```

### نشر على Render.com أو Vercel
```bash
# اتبع تعليمات المنصة الخاصة بك
# عادة يتم ربط مستودع GitHub
```

## 🔐 نصائح الأمان

⚠️ **للإنتاج فقط، غيّر القيم التالية:**

1. **تغيير `JWT_SECRET` في .env**
   ```
   JWT_SECRET=your-super-secret-key-here-very-long-and-random
   ```

2. **تغيير كلمات مرور الإداريين الافتراضية**
   - عدم استخدام `admin123`
   - استخدام كلمات مرور قوية

3. **تفعيل HTTPS في الإنتاج**
   - استخدام شهادة SSL
   - إعادة توجيه HTTP → HTTPS

4. **حماية متغيرات البيئة**
   - عدم مشاركة ملف `.env`
   - استخدام `.env.example` فقط

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من جميع البيانات المدخلة
2. اقرأ الأخطاء في Console بعناية
3. تأكد من تثبيت جميع الحزم
4. جرّب إعادة تشغيل الخوادم

## ✨ ملخص سريع

```bash
# Terminal 1: Backend
cd node
npm install
node seed.js        # مرة واحدة فقط
npm run dev        # تشغيل مستمر

# Terminal 2: Dashboard
cd admin-dashboard
npm install
npm run dev        # تشغيل مستمر

# ثم افتح http://localhost:3000 في المتصفح
```

---

تم الإعداد! استمتع بإدارة تطبيق SyrTrip 🎉

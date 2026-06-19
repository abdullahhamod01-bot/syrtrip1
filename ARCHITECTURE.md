# 🏗️ البنية الفنية - SyrTrip Admin Dashboard

## 📊 مخطط المشروع

```
syrtrip1/
├── node/                          # Backend Server (Node.js + Express)
│   ├── models/
│   │   ├── userModel.js          # نموذج المستخدم العادي
│   │   ├── hotelModel.js         # نموذج الفندق
│   │   ├── restaurantModel.js    # نموذج المطعم
│   │   ├── placeModel.js         # نموذج مكان الجذب
│   │   ├── transportModel.js     # نموذج المواصلة
│   │   └── adminModel.js         # ✨ نموذج الإداري الجديد
│   ├── controllers/
│   │   ├── authController.js     # تحكم المصادقة العام
│   │   ├── hotelsController.js   # تحكم الفنادق
│   │   ├── restaurantsController.js
│   │   ├── placesController.js
│   │   ├── transportController.js
│   │   └── adminController.js    # ✨ تحكم الإداريين الجديد
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── hotelsRoutes.js
│   │   ├── restaurantsRoutes.js
│   │   ├── placesRoutes.js
│   │   ├── transportRoutes.js
│   │   └── adminRoutes.js        # ✨ مسارات الإداريين الجديدة
│   ├── middleware/
│   │   ├── authMiddleware.js     # حماية المسارات
│   │   └── adminMiddleware.js    # ✨ حماية مسارات الإداريين الجديدة
│   ├── config/
│   │   └── db.js                 # إعدادات قاعدة البيانات
│   ├── server.js                 # ملف التشغيل الرئيسي (محدّث)
│   ├── package.json
│   └── seed.js                   # ملف البذر (محدّث)
│
└── admin-dashboard/              # ✨ تطبيق React Dashboard الجديد
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx       # الشريط الجانبي مع التنقل
    │   │   ├── TopBar.jsx        # شريط العنوان العلوي
    │   │   └── ProtectedRoute.jsx # حماية المسارات في Frontend
    │   ├── pages/
    │   │   ├── LoginPage.jsx     # صفحة تسجيل الدخول
    │   │   ├── DashboardPage.jsx # لوحة التحكم الرئيسية
    │   │   ├── HotelsPage.jsx    # إدارة الفنادق (CRUD)
    │   │   ├── RestaurantsPage.jsx # إدارة المطاعم (CRUD)
    │   │   ├── PlacesPage.jsx    # إدارة أماكن الجذب (CRUD)
    │   │   ├── TransportPage.jsx # إدارة المواصلات (CRUD)
    │   │   ├── AdminsPage.jsx    # إدارة المديرين (CRUD)
    │   │   └── SettingsPage.jsx  # الإعدادات الشخصية
    │   ├── services/
    │   │   └── api.js            # خدمات API Axios
    │   ├── store/
    │   │   └── authStore.js      # إدارة الحالة (Zustand)
    │   ├── App.jsx               # المكون الرئيسي
    │   ├── main.jsx              # نقطة الدخول
    │   └── index.css             # الأنماط العام
    ├── vite.config.js            # إعدادات Vite
    ├── tailwind.config.js        # إعدادات Tailwind CSS
    ├── postcss.config.js         # إعدادات PostCSS
    ├── package.json
    ├── index.html
    └── README.md
```

## 🔐 نموذج الأمان والتحكم في الوصول

### Role-Based Access Control (RBAC)

```javascript
// الأدوار المتاحة:
1. super_admin      - مدير عام (صلاحيات كاملة)
2. hotel_manager    - مدير فنادق (إدارة الفنادق فقط)
3. restaurant_manager - مدير مطاعم (إدارة المطاعم فقط)
```

### جدول الصلاحيات

| الميزة | Super Admin | Hotel Manager | Restaurant Manager |
|-------|:-----------:|:-------------:|:------------------:|
| لوحة التحكم | ✅ | ✅ | ✅ |
| إدارة الفنادق | ✅ | ✅ | ❌ |
| إدارة المطاعم | ✅ | ❌ | ✅ |
| إدارة الأماكن | ✅ | ❌ | ❌ |
| إدارة المواصلات | ✅ | ❌ | ❌ |
| إدارة المديرين | ✅ | ❌ | ❌ |
| الإعدادات | ✅ | ✅ | ✅ |

## 📡 تدفق المصادقة

```
┌─────────────┐
│  Login Page │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ POST /api/admin/login    │
│ (email, password)        │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────────┐
│ bcrypt.compare()           │
│ تحقق من كلمة المرور       │
└──────┬─────────────────────┘
       │
       ▼ ✅
┌────────────────────────────┐
│ jwt.sign()                 │
│ إصدار JWT Token           │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ localStorage.setItem()     │
│ حفظ الـ Token               │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ setAdmin(user data)        │
│ تحديث الحالة               │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Navigate to /dashboard     │
└────────────────────────────┘
```

## 🔄 دورة حياة طلب HTTP

```
Frontend               Authorization               Backend
   │                      │                          │
   ├─ GET /api/hotels ────┼──────────────────────────▶ 
   │   (with token)       │                          │
   │                      ▼                          │
   │               Check JWT Token                   │
   │                      │                          │
   │                      ├─ Valid? ───────────────▶ 
   │                      │                        Query DB
   │                      │                          │
   │                      │ ◀─────────────────────── 
   │                      │                    [Hotels Array]
   │                      │                          │
   │ ◀────────────────────────────────────────────── 
   │ [200 OK] {hotels}   │                          │
   │                      │                          │
```

## 🗄️ بنية قاعدة البيانات

### Admin Collection

```javascript
{
  _id: ObjectId,
  name: String,           // اسم الإداري
  email: String,          // البريد الإلكتروني (فريد)
  password: String,       // كلمة المرور المشفرة
  role: String,          // "super_admin" | "hotel_manager" | "restaurant_manager"
  phone: String,         // رقم الهاتف (اختياري)
  avatar: String,        // رابط الصورة الشخصية (اختياري)
  isActive: Boolean,     // هل الحساب مفعل
  lastLogin: Date,       // آخر دخول
  managedHotels: [ObjectId], // قائمة الفنادق المُدارة
  managedRestaurants: [ObjectId], // قائمة المطاعم المُدارة
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 تدفق البيانات في React

```
┌─────────────────────────────┐
│   HotelsPage Component      │
└──────────────┬──────────────┘
               │
               ▼
      ┌────────────────────┐
      │ useEffect Hook     │
      │ fetchHotels()      │
      └────────┬───────────┘
               │
               ▼
      ┌────────────────────┐
      │ hotelsAPI.getAll() │
      │ (Axios Request)    │
      └────────┬───────────┘
               │
               ▼
      ┌────────────────────┐
      │ setHotels(data)    │
      │ (setState)         │
      └────────┬───────────┘
               │
               ▼
      ┌────────────────────┐
      │ Re-render HTML     │
      └────────────────────┘
```

## 🛡️ الحماية والتشفير

### 1. تشفير كلمات المرور
```javascript
// عند الإنشاء:
const hashed = await bcrypt.hash(password, 10);

// عند التحقق:
const match = await bcrypt.compare(inputPassword, hashed);
```

### 2. التوكن (JWT)
```javascript
// الإصدار:
const token = jwt.sign(
  { id: admin._id, role: admin.role },
  process.env.JWT_SECRET,
  { expiresIn: "30d" }
);

// التحقق:
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. تخزين التوكن
```javascript
// في LocalStorage:
localStorage.setItem('adminToken', token);

// إرسال مع كل طلب:
Authorization: Bearer {token}
```

## 📱 الاستجابة والتوافقية

- **استجابة كاملة** مع Tailwind CSS
- **محسّن للهواتف الذكية** (Mobile First)
- **دعم الاتجاه من اليمين إلى اليسار** (RTL)
- **متوافق مع جميع المتصفحات الحديثة**

## 🎨 نظام الألوان

```css
/* Tailwind Config */
primary: #3b82f6    /* الأزرق الأساسي */
secondary: #1f2937  /* الرمادي الغامق */
accent: #10b981     /* الأخضر */
danger: #ef4444     /* الأحمر */
warning: #f59e0b    /* البرتقالي */
```

## 📊 الرسوم البيانية

استخدام **Recharts** لعرض الإحصائيات:
- Bar Charts (الفنادق، المطاعم، الخ)
- Pie Charts (النسب المئوية)
- Line Charts (الاتجاهات الزمنية)

## 🚀 الأداء والتحسينات

### 1. Code Splitting
```javascript
// React Router يدعم lazy loading تلقائياً
```

### 2. API Caching
```javascript
// في المستقبل، يمكن إضافة caching:
// - Redis على Backend
// - React Query على Frontend
```

### 3. Pagination
```javascript
// للتطبيقات الكبيرة:
// GET /api/hotels?page=1&limit=10
```

## 🔌 التكامل مع Services

### API Interceptors
```javascript
// إضافة Token تلقائياً
// معالجة الأخطاء الموحدة
// إعادة محاولة الطلبات المفشلة
```

## 📝 التوثيق والـ Comments

- جميع الدوال موثقة
- JSDoc comments للمكونات
- تعليقات باللغة العربية

## 🧪 الاختبار (Future Enhancement)

```javascript
// يمكن إضافة:
// - Jest للـ Unit Tests
// - React Testing Library للـ Component Tests
// - Playwright للـ E2E Tests
```

---

**ملاحظة**: هذا المشروع مصمم لكون قابل للتوسع والتطوير مستقبلاً

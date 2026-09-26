# 📋 دليل النشر والتثبيت

## 🚀 البدء السريع

### المتطلبات
- Node.js v14+ و npm
- MongoDB (محلي أو MongoDB Atlas)
- متصفح ويب حديث

### خطوات التثبيت

#### 1. استنساخ المشروع
```bash
git clone https://github.com/majdfatihy/ptc-website.git
cd ptc-website
```

#### 2. تثبيت المتعلقات
```bash
cd backend
npm install
```

#### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env
```

ثم عدّل ملف `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ptc-database
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
NODE_ENV=development
```

#### 4. تشغيل الخادم
```bash
npm start
```

سيعمل الخادم على `http://localhost:5000`

---

## 🌐 نشر على الإنترنت

### خيار 1: Railway.app (موصى به)

1. اذهب إلى https://railway.app
2. سجل دخولاً باستخدام GitHub
3. اختر "New Project" → "Deploy from GitHub repo"
4. اختر `ptc-website`
5. أضف المتغيرات البيئية في Dashboard
6. اضغط Deploy

**الرابط**: `https://your-app.railway.app`

### خيار 2: Render.com

1. اذهب إلى https://render.com
2. اختر "New+" → "Web Service"
3. أوصّل GitHub
4. اختر المستودع
5. أضف البيانات البيئية
6. Deploy

### خيار 3: Heroku (بديل)

```bash
heroku login
heroku create ptc-website-app
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

---

## 🔗 ربط الواجهة الأمامية بالـ API

في ملف `public/js/config.js`، عدّل:

```javascript
const API_URL = 'https://your-api-url.railway.app/api';
```

---

## 📱 الميزات الرئيسية

### للعملاء
- ✅ تسجيل دخول وإنشاء حساب
- ✅ عرض المهام المتاحة
- ✅ إكمال المهام وكسب الأرباح
- ✅ تتبع الأرباح
- ✅ برنامج الإحالات
- ✅ طلب السحب

### للمسؤولين
- ✅ لوحة تحكم إحصائية
- ✅ إدارة المستخدمين
- ✅ إنشاء ومراقبة المهام
- ✅ معالجة طلبات السحب
- ✅ التقارير والإحصائيات

---

## 🔐 الأمان

- JWT للمصادقة
- تشفير كلمات المرور بـ bcryptjs
- CORS محمي
- التحقق من صلاحيات الأدمن

---

## 📊 هيكل قاعدة البيانات

### Collections

**Users**
- name, email, password
- balance, totalEarned
- referralCode, referredBy
- tasksCompleted, adsViewed
- role (user/admin), status

**Tasks**
- title, description, type
- reward, duration, link
- maxCompletions, completedCount
- status (active/paused/completed)

**Earnings**
- user, task, amount, type
- status (pending/approved/rejected)

**Withdrawals**
- user, amount, method
- accountDetails, status

---

## 🛠️ نقاط النهاية (Endpoints)

### المصادقة
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/login` - تسجيل دخول

### المستخدمون
- `GET /api/users/profile` - الملف الشخصي
- `PUT /api/users/profile` - تحديث الملف
- `GET /api/users/referrals` - الإحالات

### المهام
- `GET /api/tasks` - جميع المهام
- `POST /api/tasks/:id/complete` - إكمال مهمة
- `POST /api/tasks` - إنشاء مهمة (إدمن)

### الأرباح
- `GET /api/earnings` - سجل الأرباح

### السحب
- `POST /api/withdrawals` - طلب سحب
- `GET /api/withdrawals` - سجل السحب

### الإدارة
- `GET /api/admin/dashboard` - إحصائيات
- `GET /api/admin/users` - جميع المستخدمين
- `GET /api/admin/withdrawals` - جميع الطلبات
- `PUT /api/admin/withdrawals/:id/approve` - موافقة

---

## 🐛 استكشاف الأخطاء

### خطأ: `Cannot connect to MongoDB`
- تحقق من رابط `MONGODB_URI`
- تأكد من السماح بـ IP عنوانك في MongoDB Atlas

### خطأ: `401 Unauthorized`
- تأكد من إرسال `Authorization: Bearer <token>`
- تحقق من انتهاء صلاحية التوكن

### خطأ: `404 Not Found`
- تحقق من المسار الصحيح للـ endpoint
- تأكد من تشغيل الخادم

---

## 📞 الدعم

للمساعدة والدعم، تواصل معنا:
- 📧 البريد: support@ptcearn.com
- 💬 Discord: [قريباً]

---

**آخر تحديث**: 2026-09-26
**الإصدار**: 1.0.0
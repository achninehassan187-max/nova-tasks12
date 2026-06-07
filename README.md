# 🎉 NOVA GMAIL - منصة المهام الدقيقة

منصة متكاملة لإدارة المهام مع تكامل بوت تليجرام وواجهة ويب حديثة.

## 🚀 المميزات

✅ **مهام Gmail** - إنشاء وإدارة حسابات Gmail  
✅ **روابط مختصرة** - مهام التحقق من الروابط  
✅ **مهام خاصة** - مهام مخصصة ومتعددة الأنواع  
✅ **نظام سحب** - دعم USDT و Telegram Stars  
✅ **نظام إحالات** - مكافآت الإحالات التلقائية  
✅ **لوحة إدارة** - 20 ميزة إدارية متقدمة  
✅ **بوت تليجرام** - تحكم كامل عبر البوت  
✅ **قاعدة بيانات موحدة** - MongoDB Atlas  

## 📦 التثبيت

### المتطلبات
- Node.js v14+
- MongoDB Atlas Account
- Telegram Bot Token

### الخطوات

```bash
# استنساخ المستودع
git clone https://github.com/achninehassan187-max/nova-tasks12.git
cd nova-tasks12

# تثبيت الحزم
npm install

# إنشاء ملف .env
cp .env.example .env

# ملء البيانات في .env
PORT=3000
MONGODB_URI=your_mongodb_connection
TOKEN=your_telegram_bot_token
ADMIN_ID=your_admin_id

# تشغيل الخادم
npm start

# تشغيل البوت (في نافذة جديدة)
npm run bot
```

## 📚 الهيكل

```
nova-tasks12/
├── config/           # إعدادات قاعدة البيانات
├── models/           # نماذج MongoDB
├── routes/           # مسارات API
├── web/              # واجهة المستخدم
├── bot/              # بوت تليجرام
├── public/           # ملفات ثابتة
└── package.json      # الحزم والتبعيات
```

## 🔐 الأمان

- ✅ تشفير كلمات المرور بـ bcrypt
- ✅ JWT Token Authentication
- ✅ HTTPS Only Cookies
- ✅ CORS Protection
- ✅ Rate Limiting

## 📞 التواصل

**المطور:** [@ApeloXIT](https://t.me/ApeloXIT)

## 📄 الترخيص

MIT License - جميع الحقوق محفوظة

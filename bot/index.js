const { Telegraf } = require('telegraf');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// تحميل المتغيرات البيئية
dotenv.config({ path: path.join(__dirname, '../.env') });

// استيراد قاعدة البيانات والنماذج
const connectDB = require(path.join(__dirname, '../config/database'));
const User = require(path.join(__dirname, '../models/User'));

const bot = new Telegraf(process.env.TOKEN);
const ADMIN_ID = process.env.ADMIN_ID || '6713604795';

// اتصال قاعدة البيانات
connectDB();

// قائمة القائمة الرئيسية
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📊 لوحة المراقبة' }, { text: '💰 الرصيد' }],
      [{ text: '📝 المهام' }, { text: '💵 السحب' }],
      [{ text: '👥 الإحالات' }, { text: '⚙️ الإعدادات' }],
      [{ text: '📧 تواصل معي' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

const adminKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '🔧 لوحة الإدارة' }],
      [{ text: '📊 إحصائيات' }, { text: '⚙️ الإعدادات' }],
      [{ text: '👥 المستخدمين' }, { text: '💰 المسحوبات' }],
      [{ text: '🚫 الحظر' }, { text: '📝 المهام' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

// الرد على الأوامر الأساسية
bot.start(async (ctx) => {
  try {
    const telegramId = ctx.from.id.toString();
    let user = await User.findOne({ telegramId });

    if (!user) {
      // إنشاء مستخدم جديد
      user = new User({
        telegramId,
        username: ctx.from.username || ctx.from.first_name,
      });
      await user.save();

      // عرض مكافأة الانضمام
      ctx.reply(
        `🎉 مرحباً بك في NOVA GMAIL!\n\nانضم إلى مجموعتنا واحصل على مكافأة 0.02$\n\n${process.env.TELEGRAM_GROUP_LINK}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ تحقق من الانضمام',
                  callback_data: 'check_group_join',
                },
              ],
            ],
          },
        }
      );
    }

    ctx.reply(
      `👋 مرحباً بك في NOVA GMAIL\n\nرصيدك: ${user.mainBalance}$\n\nاختر من الخيارات التالية:`,
      mainKeyboard
    );
  } catch (error) {
    console.error('خطأ:', error);
    ctx.reply('❌ حدث خطأ. يرجى المحاولة لاحقاً.');
  }
});

// التعامل مع الرسائل النصية
bot.hears('💰 الرصيد', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id.toString() });
    if (!user) return ctx.reply('❌ لم يتم العثور على الحساب');

    ctx.reply(
      `💰 **الرصيد الحالي:**\n\n🟢 الرصيد الأساسي: ${user.mainBalance}$\n🟡 رصيد الحجز: ${user.escrowBalance}$\n🔵 الإجمالي: ${user.mainBalance + user.escrowBalance}$`
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// معالج المهام
bot.hears('📝 المهام', async (ctx) => {
  try {
    ctx.reply(
      '📝 **اختر نوع المهمة:**\n\n1️⃣ مهام Gmail\n2️⃣ مهام الروابط المختصرة\n3️⃣ مهام خاصة',
      {
        reply_markup: {
          keyboard: [
            [{ text: '📧 مهام Gmail' }, { text: '🔗 الروابط' }],
            [{ text: '⭐ مهام خاصة' }],
            [{ text: '🔙 رجوع' }],
          ],
          resize_keyboard: true,
        },
      }
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// السحب
bot.hears('💵 السحب', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id.toString() });
    if (!user) return ctx.reply('❌ لم يتم العثور على الحساب');

    if (user.mainBalance < 0.45) {
      return ctx.reply('❌ الحد الأدنى للسحب هو 0.45$');
    }

    ctx.reply(
      '💵 **اختر طريقة السحب:**',
      {
        reply_markup: {
          keyboard: [
            [{ text: '🪙 USDT' }, { text: '🤖 Nova Bot' }],
            [{ text: '⭐ نجوم تليجرام' }],
            [{ text: '🔙 رجوع' }],
          ],
          resize_keyboard: true,
        },
      }
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// الإحالات
bot.hears('👥 الإحالات', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id.toString() });
    if (!user) return ctx.reply('❌ لم يتم العثور على الحساب');

    const referralLink = `https://t.me/meadmineBot?start=${user.referralLink}`;

    ctx.reply(
      `👥 **نظام الإحالات:**\n\nعدد الإحالات الناجحة: ${user.referralCount}\n\n🔗 رابط الإحالة الخاص بك:\n\n\`${referralLink}\`\n\nمكافأة لكل إحالة: 0.01$`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📋 نسخ الرابط',
                callback_data: `copy_referral_${user.referralLink}`,
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// الإعدادات
bot.hears('⚙️ الإعدادات', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id.toString() });
    if (!user) return ctx.reply('❌ لم يتم العثور على الحساب');

    ctx.reply(
      `⚙️ **الإعدادات:**\n\n👤 معرف المستخدم: \`${user._id}\`\n🌍 اللغة: ${user.language === 'ar' ? 'العربية' : user.language}\n🌙 المظهر: ${user.theme === 'dark' ? 'الوضع الليلي' : 'الوضع النهاري'}\n🚫 الحظر: ${user.accountBanned ? 'نعم' : 'لا'}`,
      {
        reply_markup: {
          keyboard: [
            [{ text: '🔐 تغيير اللغة' }, { text: '🌙 تغيير المظهر' }],
            [{ text: '💬 تواصل معي' }],
            [{ text: '🔙 رجوع' }],
          ],
          resize_keyboard: true,
        },
      }
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// تواصل معي
bot.hears('📧 تواصل معي', (ctx) => {
  ctx.reply(
    `📧 تواصل مع المطور:\n\n@${process.env.DEVELOPER_ID || 'ApeloXIT'}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💬 اكتب رسالة',
              url: `https://t.me/${process.env.DEVELOPER_ID || 'ApeloXIT'}`,
            },
          ],
        ],
      },
    }
  );
});

// معالج لوحة الإدارة
bot.command('admin', async (ctx) => {
  try {
    const telegramId = ctx.from.id.toString();
    if (telegramId !== ADMIN_ID) {
      return ctx.reply('❌ ليس لديك صلاحيات إدارية');
    }

    ctx.reply(
      '🔧 **لوحة الإدارة:**\n\nمرحباً أيها الإداري',
      adminKeyboard
    );
  } catch (error) {
    ctx.reply('❌ حدث خطأ.');
  }
});

// معالج أزرار رد الاتصال
bot.action('check_group_join', async (ctx) => {
  try {
    const user = await User.findOne({ telegramId: ctx.from.id.toString() });
    if (!user) return ctx.answerCbQuery('❌ خطأ');

    user.joinedTelegramGroup = true;
    user.mainBalance += 0.02;
    user.telegramGroupBonus = 0.02;
    await user.save();

    ctx.answerCbQuery('✅ تم الانضمام بنجاح! تم إضافة 0.02$');
    ctx.reply('✅ شكراً لانضمامك! تم إضافة 0.02$ لرصيدك');
  } catch (error) {
    ctx.answerCbQuery('❌ حدث خطأ');
  }
});

// Keep-Alive
setInterval(() => {
  console.log('🔄 Keep-Alive Ping (Bot):', new Date().toISOString());
}, 5 * 60 * 1000);

// بدء البوت
bot.launch({
  polling: {
    interval: 300,
    timeout: 30,
  },
});

console.log('🤖 بوت NOVA GMAIL قيد التشغيل...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;

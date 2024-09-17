const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

// تابع برای تبدیل ورودی زمان دقیقه به فرمت کرون‌تب
const convertMinutesToCron = (minutes) => {
  if (minutes <= 0) return '* * * * *'; // اگر زمان صفر یا کمتر باشد، هر دقیقه اجرا شود
  return `*/${minutes} * * * *`; // تبدیل زمان به فرمت "هر n دقیقه"
};

// استخراج شناسه از خط کرون‌جاب
const extractIdFromCronLine = (line) => {
  const match = line.match(/# (\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// اعتبارسنجی لینک
const isValidUrl = (url) => {
  return urlRegex.test(url);
};

module.exports = {
  convertMinutesToCron,
  extractIdFromCronLine,
  isValidUrl
};

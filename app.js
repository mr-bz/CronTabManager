const express = require('express');
const cronManager = require('./cronManager');
const app = express();

app.use(express.json());

// افزودن کرون‌جاب
app.post('/cron/add', cronManager.addCronJob);

// لیست کردن کرون‌جاب‌ها
app.get('/cron/list', cronManager.listCronJobs);

// حذف کرون‌جاب
app.post('/cron/delete', cronManager.deleteCronJob);

// سرور را روی پورت 3000 اجرا کنید
app.listen(80, () => {
  console.log('Server running on port 80');
});



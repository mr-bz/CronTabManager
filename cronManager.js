const { exec } = require('child_process');
const { convertMinutesToCron, extractIdFromCronLine, isValidUrl } = require('./utils');

// خواندن تمام کرون‌جاب‌ها از فایل
const getCronJobs = (callback) => {
  exec('crontab -l', (error, stdout, stderr) => {
    if (error) {
      if (stderr.includes('no crontab for')) {
        // اگر هیچ کرون‌جابی وجود ندارد
        return callback(null, '');
      }
      console.error(`Error fetching cron jobs: ${stderr}`);
      return callback(error);
    }
    callback(null, stdout);
  });
};

// پیدا کردن آخرین ID موجود
const getLastId = (cronJobs) => {
  const lines = cronJobs.split('\n');
  const ids = lines
    .filter(line => line.includes('#'))
    .map(line => extractIdFromCronLine(line))
    .filter(id => id !== null);

  return ids.length > 0 ? Math.max(...ids) : 0;
};

// افزودن کرون‌جاب جدید با ID و title
const addCronJob = (req, res) => {
  const { title, intervalInMinutes, link } = req.body;

  if (!title || !intervalInMinutes || !link) {
    return res.status(400).json({ message: 'Title, interval in minutes, and link are required.' });
  }

  if (!isValidUrl(link)) {
    return res.status(400).json({ message: 'Invalid URL.' });
  }

  getCronJobs((err, cronJobs) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cron jobs.', error: err });
    }

    const lastId = getLastId(cronJobs);
    const newId = lastId + 1;
    const schedule = convertMinutesToCron(intervalInMinutes);

    // دستور کرون برای افزودن جاب با ID به عنوان کامنت
    const cronCommand = `(crontab -l ; echo "${schedule} /usr/bin/curl -s --max-time 60 ${link} > /dev/null 2>&1 # ${newId} ${title}") | crontab -`;

    exec(cronCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error adding cron job: ${stderr}`);
        return res.status(500).json({ message: 'Error adding cron job.', error: stderr });
      }
      res.json({ message: 'Cron job added successfully.', id: newId, title, schedule });
    });
  });
};

// لیست کردن کرون‌جاب‌ها
const listCronJobs = (req, res) => {
  getCronJobs((err, cronJobs) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cron jobs.', error: err });
    }

    // هر خط از کرون‌تب را به صورت جداگانه تحلیل می‌کنیم
    const jobs = cronJobs.split('\n').filter(job => job.includes('#')).map(job => {
      const parts = job.split(' '); // جدا کردن بخش‌های مختلف
      const schedule = parts.slice(0, 5).join(' '); // استخراج بخش زمان‌بندی
      const command = parts.slice(5).join(' ').split(' # ')[0].trim(); // استخراج بخش دستور
      const idAndTitle = job.split(' # ')[1]; // استخراج ID و title
      const id = idAndTitle ? idAndTitle.split(' ')[0] : null;
      const title = idAndTitle ? idAndTitle.split(' ').slice(1).join(' ') : null;

      return {
        schedule: schedule,
        command: command,
        id: id,
        title: title
      };
    });

    res.json({ cronJobs: jobs });
  });
};

// حذف کرون‌جاب با استفاده از ID
const deleteCronJob = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required.' });
  }

  getCronJobs((err, cronJobs) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cron jobs.', error: err });
    }

    // بررسی وجود کرون‌جاب با ID مشخص شده
    const jobExists = cronJobs.split('\n').some(job => job.includes(`# ${id}`));

    if (!jobExists) {
      return res.status(404).json({ message: 'Cron job not found.' });
    }

    // حذف کرون‌جاب بر اساس ID
    const updatedCrons = cronJobs.split('\n').filter(job => !job.includes(`# ${id}`)).join('\n');

    exec(`echo "${updatedCrons}" | crontab -`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error updating cron jobs: ${stderr}`);
        return res.status(500).json({ message: 'Error updating cron jobs.', error: stderr });
      }

      res.json({ message: 'Cron job deleted successfully.' });
    });
  });
};

module.exports = {
  addCronJob,
  listCronJobs,
  deleteCronJob
};

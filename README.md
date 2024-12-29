 git clone https://github.com/mr-bz/CronTabManager.git
cd CronTabManager
--------------------------------
Ubuntu و Debian:
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

sudo apt install -y nodejs

 CentOS، RHEL و Fedora:
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

sudo yum install -y nodejs

-------------------------------------
 npm install express
 
 node app.js

Run npm : 
   pm2 start app.js --name "CronTabManager"

# TradingNodeApp

blog
[] publish morning insights daily
( 5-minute pre-open market analysis from nifty Invest)

    [] price of gift nifty during initial hour

    [] pre open market data ( need to analyze)

    [] most traded stock with volume data

    [] publish the same on facebook

[] publish blog end of the day
( 5-minute post market analysis from nifty Invest)

    [] how the market closed. closing value of different index

    [] top 5 loser and gainers

    [] stock near 52-week low and high

    [] stocks with highest change in option data

    [] stocks in oversold region with RSI, WR and Macd data
        promote screener  page

    [] any 200 sma crossover

    [] any important announcements today

[] pull news from nse

    [] todays news
        [] show in respective company page related news sectiom
        [] show in stock news section
            (right hand side)
        [] send mail to subscribed user

    [] upcoming event
        [] show in respective company page  right hand side
        [] also on home page somewhere

# AWS Commands

eb ssh
sudo su

# viewing nginx logs

tail -f /var/log/web.stdout.log

ssh-keygen -R 13.126.202.179

# crontab -e

30 2 \* \* _ (date +"\%Y-\%m-\%d \%H:\%M:\%S" && (sleep 5s && docker container restart prod_niftyinvestbatch)) >> /var/log/job_docker_cron.log 2>&1
30 18 _ \* _ (date +"\%Y-\%m-\%d \%H:\%M:\%S" && sleep 5s && docker container restart prod_niftyinvestui) >> /var/log/job_docker_cron.log 2>&1
20 22 _ \* _ (date +"\%Y-\%m-\%d \%H:\%M:\%S" && docker build -t mongodb-backup /var/myprojects/database_repo/mongodb/backup && docker run --rm mongodb-backup) > /var/log/job_mongo_cron.log 2>&1
0 _ \* \* _ (date +"\%Y-\%m-\%d \%H:\%M:\%S" && /var/myprojects/niftyinvestui_uat/docker-stop-uat.sh) > /var/log/job_uat_cron.log 2>&1
40 18 _ \* 6 docker system prune -af --volumes >/dev/null 2>&1

# certbot

sudo certbot --nginx -d your_domain.com

// sets cron job for auto renewal
sudo certbot renew --dry-run

# For restoring backup

mongorestore --host 91.108.105.210:1003 --username niuat --authenticationDatabase admin ~/Downloads/backup 2/db_backup/

mongorestore --host 91.108.105.210:1003 --username niuat --authenticationDatabase admin --db Niftyinvest --collection option_chain_historical ~/Downloads/backup/db_backup/Niftyinvest/option_chain_historical.bson

# Encrption

openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/uat/env.list -out deployment/uat/sec1.enc
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/local/www -out deployment/local/www.enc
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in .env -out deployment/local/.env.enc
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in env.list -out env.list.enc
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/prod/env.list -out .prod/sec1.enc

openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in .prod/lib/serviceAccountKey.json -out .prod/lib/sec2.enc

# Decryption

openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/uat/sec1.enc -out deployment/uat/env.list
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in lib/sec2.enc -out lib/serviceAccountKey.json
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/local/.env.enc -out .env
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in env.list.enc -out env.list
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in deployment/prod/sec1.enc -out deployment/prod/env.list

openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 -in .prod/lib/sec2.enc -out .prod/lib/serviceAccountKey.json



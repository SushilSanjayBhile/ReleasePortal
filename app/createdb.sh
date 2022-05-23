sudo -u postgres pg_dump -h localhost -U sushil -Fc "DCX-DMC-Master" > /data/testing1.sql
sudo -u postgres pg_restore -h localhost -d DMC-3.3 -U sushil /data/testing1.sql

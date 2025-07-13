[[AlphaHub]]
## Configuring Docker

### Install Docker

```
sudo apt update
sudo apt install -y docker.io
```

### Enable and start Docker

```
sudo systemctl enable docker
sudo systemctl start docker
```

### Install Docker Compose (v2)

```
sudo apt install -y docker-compose
```


---

## Setup PostgreSQL

### Update Your System

```
sudo apt update && sudo apt upgrade -y
```

### Install PostgreSQL

```
sudo apt install postgresql postgresql-contrib -y
```

### Start & Enable PostgreSQL

```
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

to verify:

```
sudo systemctl status postgresql
```


---
## Preparing DB

### Switch to the Postgres User

```
sudo -i -u postgres
```

Then access the PostgreSQL shell:

```
psql
```

### Create a New DB and User

```
CREATE DATABASE alphahub_db;

CREATE USER postgres WITH ENCRYPTED PASSWORD 'asdwqwe123';

// or

ALTER USER postgres WITH ENCRYPTED PASSWORD 'asdwqwe123';


GRANT ALL PRIVILEGES ON DATABASE alphahub_db TO postgres;
```

### Allow Remote Connections

```
sudo nano /etc/postgresql/*/main/postgresql.conf
```

find this line:

```
#listen_addresses = 'localhost'
```

change to:

```
listen_addresses = '*'
```


### Edit `pg_hba.conf`

```
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line at the bottom:

```
host    all             all             0.0.0.0/0               md5
```

### Restart PostgreSQL

```
sudo systemctl restart postgresql
```

---

## Setup Node

### install nvm

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

source ~/.bashrc
```

### install node 18

```
nvm install 18
nvm alias default 18
```


### install pm2

```
npm install -g pm2

pm2 startup

copy output script

pm2 save
```
---

## Setup Project Repositories

```
ssh-keygen -t rsa -b 4096 -C "crx-demo"
```

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

```
cat ~/.ssh/id_rsa.pub
```

Go to https://github.com/settings/keys

```
git clone git@github.com:mokanh/alphahub-orthanc-ohif.git

git clone git@github.com:mokanh/alphahub-api.git

git clone git@github.com:mokanh/alphahub-app.git
```

### Setup Repo Backend
Create .env file 
```
cd ~/alphahub/alphahub-api

hostname -I

nano .env

npm install

pm2 start "npm run start" -i max --name alphahub-api

```

###  Setup Repo Frontend

```
cd ~/alphahub/alphahub-app

hostname -I

nano .env

npm install

npm run build

pm2 start "npm run preview" --name alphahub-app
```

### Setup Repo Orthanc-OHIF

```
cd ~/alphahub/alphahub-orthanc-ohif

sudo usermod -aG docker $USER

sudo docker-compose up -d
```

```
cd ~/alphahub/alphahub-orthanc-ohif/ohif

corepack enable
corepack prepare yarn@4.9.2 --activate

yarn config set workspaces-experimental true

yarn install

pm2 start "npm run dev:orthanc" --name ohif-viewer
```
---



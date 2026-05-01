# Deploy на личный Linux сервер

Эта настройка деплоит frontend, backend и PostgreSQL на один Linux сервер через Docker Compose.

## Что будет работать

```text
http://SERVER_IP/       -> React frontend
http://SERVER_IP/api/*  -> FastAPI backend через Nginx proxy
PostgreSQL             -> Docker volume на сервере
```

Frontend собирается с `VITE_API_BASE_URL=/api`, поэтому браузер ходит в backend через тот же IP и порт 80.

## Что поставить на сервер

Зайди на сервер по SSH и установи Docker, Docker Compose plugin и Git.

Ubuntu/Debian пример:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Если деплоишь не от `root`, добавь пользователя в группу Docker:

```bash
sudo usermod -aG docker $USER
```

После этого выйди из SSH и зайди снова.

## SSH ключ для GitHub Actions

На своем компьютере или на сервере создай отдельный deploy key:

```bash
ssh-keygen -t ed25519 -C "github-actions-cicd-deploy" -f cicd_deploy_key
```

Публичный ключ добавь на сервер в `~/.ssh/authorized_keys` пользователя, под которым будет деплой:

```bash
cat cicd_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Приватный ключ `cicd_deploy_key` закодируй в base64 и добавь в GitHub Secrets как `SERVER_SSH_KEY_B64`.

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.ssh\cicd_deploy_key"))
```

## GitHub Secrets

В GitHub открой:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Добавь:

```text
SERVER_HOST=твой_ip
SERVER_USER=root
SERVER_APP_DIR=/opt/cicd
SERVER_SSH_KEY_B64=base64_от_приватного_ssh_ключа
POSTGRES_DB=cicd
POSTGRES_USER=postgres
POSTGRES_PASSWORD=длинный_пароль
SECRET_KEY=длинный_secret_key
CORS_ORIGINS=http://твой_ip
WEB_PORT=80
```

`SERVER_USER` может быть не `root`, если у тебя есть отдельный deploy user с доступом к Docker.

Пример production env также лежит в `deploy.env.example`. На сервере workflow создает `/opt/cicd/.env.production` автоматически из GitHub Secrets.

## GitHub Variable для включения deploy

Чтобы workflow не падал до настройки secrets, автоматический deploy выключен по умолчанию.

После добавления secrets открой:

```text
Repository -> Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

Добавь:

```text
SERVER_DEPLOY_ENABLED=true
```

После этого deploy будет запускаться автоматически после успешного CI на `main`.

## Как запускается deploy

Deploy workflow находится в `.github/workflows/deploy.yml`.

Он запускается автоматически после успешного workflow `CI` на ветке `main`:

```text
push main -> CI success -> Deploy -> docker compose up --build -d на сервере
```

## Проверка после deploy

Открой:

```text
http://твой_ip/
http://твой_ip/api/health
```

Ожидаемый healthcheck:

```json
{"status":"ok"}
```

## Ручной запуск на сервере

Если нужно проверить без GitHub Actions:

```bash
cd /opt/cicd
git pull --ff-only origin main
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

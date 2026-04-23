# 🚀 Instruções para Deploy Permanente do Equipment Genius

## Opção 1: Deploy na Vercel (RECOMENDADO - Mais Rápido)

### Passo 1: Criar Conta na Vercel
1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize a Vercel a acessar seus repositórios

### Passo 2: Importar o Projeto
1. Na dashboard da Vercel, clique em "Add New..." > "Project"
2. Selecione o repositório `equipment-genius`
3. Clique em "Import"

### Passo 3: Configurar o Projeto
1. **Framework Preset:** Selecione "Vite"
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Environment Variables:** Deixe em branco (não necessário)
5. Clique em "Deploy"

### Passo 4: Aguardar o Deploy
- A Vercel irá compilar e fazer o deploy automaticamente
- Você receberá um link como: `https://equipment-genius-xxxxx.vercel.app`
- O site estará online em poucos minutos!

### Passo 5 (Opcional): Configurar Domínio Personalizado
1. Na dashboard do projeto, vá para "Settings" > "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `equipamentos.seusite.com`)
4. Siga as instruções para configurar o DNS

---

## Opção 2: Deploy na Netlify

### Passo 1: Criar Conta na Netlify
1. Acesse https://app.netlify.com
2. Clique em "Sign up"
3. Escolha "GitHub"
4. Autorize o acesso

### Passo 2: Conectar Repositório
1. Clique em "New site from Git"
2. Selecione "GitHub"
3. Procure por `equipment-genius`
4. Clique em "Install" e autorize

### Passo 3: Configurar Build
1. **Build command:** `npm run build`
2. **Publish directory:** `dist`
3. Clique em "Deploy site"

### Passo 4: Aguardar Deploy
- Netlify irá compilar e fazer o deploy
- Você receberá um link como: `https://equipment-genius-xxxxx.netlify.app`

---

## Opção 3: Deploy em Servidor Próprio (VPS/Cloud)

### Passo 1: Preparar o Servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (para manter o app rodando)
sudo npm install -g pm2
```

### Passo 2: Clonar e Instalar
```bash
cd /var/www
git clone https://github.com/emanuelpms/equipment-genius.git
cd equipment-genius
npm install
npm run build
```

### Passo 3: Iniciar com PM2
```bash
pm2 start "npm start" --name "equipment-genius"
pm2 startup
pm2 save
```

### Passo 4: Configurar Nginx (Reverse Proxy)
```bash
sudo nano /etc/nginx/sites-available/equipment-genius
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/equipment-genius /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ Verificar o Deploy

Após o deploy, acesse o link fornecido e verifique:
- ✓ A página de login carrega corretamente
- ✓ Você consegue entrar como Admin ou Vendedor
- ✓ Os equipamentos aparecem na vitrine
- ✓ A comparação funciona
- ✓ O site é responsivo no celular

---

## 🔄 Atualizações Futuras

Após o deploy inicial, qualquer mudança que você fazer no código:

1. Faça commit no Git:
```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

2. A Vercel/Netlify irá detectar automaticamente e fazer o deploy!

---

## 🐛 Troubleshooting

### Erro: "Build failed"
- Verifique se o `package.json` está correto
- Certifique-se de que todas as dependências estão listadas
- Execute `npm install` localmente para testar

### Erro: "Cannot find module"
- Limpe o cache: `npm cache clean --force`
- Reinstale: `npm install`

### Site lento
- Verifique o tamanho dos assets em `dist/`
- Considere usar CDN para imagens grandes

---

## 📞 Suporte

Para dúvidas sobre o deploy:
- **Vercel:** https://vercel.com/support
- **Netlify:** https://docs.netlify.com
- **PM2:** https://pm2.keymetrics.io/docs

---

**Recomendação:** Use a **Opção 1 (Vercel)** para o melhor desempenho e facilidade de uso!

Versão: 1.0.0
Data: Abril 2026

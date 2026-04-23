# 🚀 Guia de Deploy Permanente - Equipment Genius

Este guia fornece instruções passo a passo para transformar o site em um domínio permanente e profissional.

## Opção 1: Deploy na Vercel (RECOMENDADO - Mais Fácil)

### Passo 1: Criar Conta Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub" (já que o código está no GitHub)
4. Autorize a Vercel a acessar seus repositórios

### Passo 2: Importar Projeto
1. Na dashboard da Vercel, clique em "Add New Project"
2. Selecione o repositório `emanuelpms/equipment-genius`
3. Clique em "Import"

### Passo 3: Configurar Variáveis de Ambiente (se necessário)
- Deixe as configurações padrão
- Clique em "Deploy"

### Passo 4: Aguardar Deploy
- O Vercel fará o build automaticamente
- Você receberá um URL temporário (ex: `equipment-genius-abc123.vercel.app`)

### Passo 5: Configurar Domínio Personalizado (Opcional)
1. Na dashboard do projeto, vá para "Settings" → "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `equipment-genius.com`)
4. Siga as instruções para configurar os registros DNS

---

## Opção 2: Deploy na Netlify

### Passo 1: Criar Conta Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"

### Passo 2: Conectar Repositório
1. Clique em "Add New Site" → "Import an existing project"
2. Selecione GitHub
3. Escolha `emanuelpms/equipment-genius`

### Passo 3: Configurar Build
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Clique em "Deploy site"

### Passo 4: Aguardar Publicação
- Netlify fará o build e publicará automaticamente
- Você receberá um URL (ex: `equipment-genius-abc.netlify.app`)

---

## Opção 3: Deploy em Seu Próprio Servidor

### Requisitos
- Servidor com Node.js 18+ instalado
- Acesso SSH ou FTP
- Domínio próprio

### Passos
1. Clone o repositório no servidor: `git clone https://github.com/emanuelpms/equipment-genius.git`
2. Instale dependências: `npm install`
3. Faça o build: `npm run build`
4. Inicie o servidor: `npm run start` ou use PM2 para manter rodando

---

## Benefícios de Cada Opção

| Opção | Custo | Facilidade | Escalabilidade | Recomendado Para |
|-------|-------|-----------|-----------------|-----------------|
| **Vercel** | Grátis (com plano pago) | ⭐⭐⭐⭐⭐ | Excelente | Startups e PMEs |
| **Netlify** | Grátis (com plano pago) | ⭐⭐⭐⭐⭐ | Excelente | Startups e PMEs |
| **Servidor Próprio** | Variável | ⭐⭐⭐ | Controlável | Empresas maiores |

---

## Próximos Passos Após Deploy

### 1. Configurar HTTPS
- Vercel e Netlify fazem automaticamente
- Servidores próprios: use Let's Encrypt

### 2. Monitorar Performance
- Vercel: Dashboard automático
- Netlify: Analíticos integrados
- Próprio: Use ferramentas como New Relic

### 3. Configurar Email Customizado
- Recomendado para contato profissional
- Use serviços como SendGrid ou Mailgun

### 4. Adicionar Analytics
- Google Analytics
- Mixpanel
- Hotjar (para heatmaps)

---

## Suporte Técnico

Se encontrar problemas durante o deploy:

1. **Vercel:** Acesse [vercel.com/docs](https://vercel.com/docs)
2. **Netlify:** Acesse [docs.netlify.com](https://docs.netlify.com)
3. **GitHub:** Verifique se o código foi atualizado: `git push origin main`

---

## Checklist Final

- [ ] Repositório GitHub atualizado
- [ ] Build local testado (`npm run build`)
- [ ] Conta criada em Vercel/Netlify
- [ ] Projeto importado
- [ ] Deploy concluído
- [ ] URL permanente funcionando
- [ ] Domínio customizado configurado (opcional)
- [ ] HTTPS ativado
- [ ] Analytics configurado

---

**Seu site estará online em minutos! 🎉**

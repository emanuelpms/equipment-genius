# 🚀 Equipment Genius - Guia de Instalação e Uso

## 📋 Pré-requisitos

- **Node.js** 18+ (https://nodejs.org/)
- **npm** ou **pnpm** (gerenciador de pacotes)
- **Git** (opcional, para clonar o repositório)

## 🔧 Instalação Rápida

### 1. Extrair o Arquivo
```bash
unzip equipment-genius-complete.zip
cd equipment-genius
```

### 2. Instalar Dependências
```bash
npm install
# ou
pnpm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

A aplicação estará disponível em: **http://localhost:8080**

## 🎯 Como Usar

### Primeiro Acesso
1. Abra http://localhost:8080
2. Escolha o perfil:
   - **Vendedor** - Acesso à vitrine e comparação de equipamentos
   - **Admin** - Acesso ao painel de gerenciamento
3. Digite seu nome (opcional)
4. Clique em "Entrar"

### 👤 Perfil Vendedor
- **Vitrine:** Visualize todos os equipamentos disponíveis
- **Filtros:** Por tier (Premium/Medium/Essential) e categoria
- **Busca:** Procure equipamentos por nome
- **Comparação:** Selecione até 5 modelos para comparar lado a lado
- **Especificações:** Veja todos os 57 campos técnicos organizados por categoria

### 🔧 Perfil Admin
- **Marcas:** Gerenciar marcas de equipamentos
- **Equipamentos:** Adicionar, editar ou remover modelos
- **Colunas:** Configurar campos de comparação
- **Categorias:** Gerenciar categorias de uso
- **Diferenciais:** Configurar diferenciais dos equipamentos
- **Dashboard:** Visualizar estatísticas do sistema

## 📦 Build para Produção

Para gerar os arquivos otimizados para produção:

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

## 🌐 Deploy em Produção

### Opção 1: Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Opção 2: Netlify
1. Faça login em https://app.netlify.com
2. Conecte seu repositório Git
3. Configure o build command: `npm run build`
4. Configure o diretório de publicação: `dist`

### Opção 3: Servidor Node.js
```bash
npm run build
npm start
```

## 🗂️ Estrutura do Projeto

```
equipment-genius/
├── src/
│   ├── lib/
│   │   ├── store.ts          # Estado centralizado (Zustand)
│   │   ├── excel_data.ts     # Dados dos equipamentos
│   │   └── import-excel.ts   # Script de importação
│   ├── routes/               # Páginas da aplicação
│   ├── components/           # Componentes reutilizáveis
│   └── styles.css           # Estilos globais
├── package.json             # Dependências do projeto
├── tsconfig.json            # Configuração TypeScript
├── vite.config.ts           # Configuração Vite
└── README_IMPLEMENTATION.md # Documentação detalhada
```

## 🔄 Dados Importados

### Marcas (11)
Samsung Medison, GE Healthcare, Philips, Siemens, SAMSUNG, GE, Mindray, BARD, BD, Fujifilm, Esaote

### Equipamentos (17)
- Samsung: HS50A, HERA W10, HM70 EVO
- Concorrentes: E10, EPIQ Elite, Affiniti 70, Sequoia, TE7, TE9, TEX20, V5, Site-Rite 8, SII, MyLab X1, Meerkat, Venue Go, Venue Fit

### Especificações (57 campos)
Hardware, Radiologia, ObGyn, Cardiologia, Urologia, Transdutores

## 🐛 Troubleshooting

### Erro: "Port 8080 already in use"
```bash
# Use uma porta diferente
npm run dev -- --port 3000
```

### Erro: "Cannot find module"
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Dados não aparecem
1. Abra o DevTools (F12)
2. Vá para Application > LocalStorage
3. Procure por `equipment-genius` e limpe os dados
4. Recarregue a página (Ctrl+F5)

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920x1080+)
- Tablet (768px+)
- Mobile (320px+)

## 🎨 Customização

### Alterar Cores
Edite as variáveis CSS em `src/styles.css`

### Adicionar Novos Equipamentos
1. Acesse o painel Admin
2. Clique em "Novo equipamento"
3. Preencha os dados
4. Clique em "Salvar"

### Modificar Especificações
1. Admin > Colunas Comparativas
2. Adicione, edite ou remova campos

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Limpe o LocalStorage
3. Reinicie o servidor

## 📝 Notas Importantes

- ✅ Dados salvos no LocalStorage (persiste entre sessões)
- ✅ Sem banco de dados necessário (pronto para integração)
- ✅ Totalmente responsivo
- ✅ Interface moderna com animações
- ✅ 57 campos técnicos configuráveis
- ✅ Suporte a até 5 equipamentos na comparação

## 🚀 Próximos Passos

1. **Adicionar Imagens:** Faça upload de fotos dos equipamentos
2. **Integrar Banco de Dados:** Conecte a um banco de dados real
3. **Autenticação:** Implemente login com credenciais
4. **Relatórios:** Exporte comparações em PDF
5. **API:** Crie endpoints para integração com outros sistemas

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para Produção  
**Última Atualização:** Abril 2026

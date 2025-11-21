# 🎨 MixMeet - Frontend (React & UX Moderna)

Interface moderna, responsiva e resiliente para o sistema de agendamento de salas **MixMeet**. Este projeto foi desenvolvido com foco em **UX (Experiência do Usuário)** de alto nível, validação de dados robusta e integração segura com uma arquitetura de backend baseada em microsserviços.

## ✨ Funcionalidades e Destaques

O frontend vai além de telas simples, implementando lógicas complexas de negócio no cliente:

* **🔐 Autenticação Passwordless (OTP):** Login via código enviado para o WhatsApp, eliminando a necessidade de senhas.
* **🌍 UX Internacional:** Input de telefone inteligente com detecção de país, máscaras automáticas e validação de formato E.164 (via `libphonenumber-js`).
* **🛡️ Resiliência de DOM:** Componentes "blindados" contra injeções de código de extensões de navegador (solução para conflitos de `removeChild`).
* **📅 Gestão de Reservas (CRUD):**
    * Listagem com indicadores visuais (Badges).
    * Criação e Edição em Modal com pré-validação.
    * Tratamento de erros de conflito (409) com feedback amigável.
* **⚙️ Painel Admin Integrado:** Interface para conexão da sessão do WhatsApp via QR Code diretamente pelo navegador.

## 🛠️ Stack Tecnológica

* **Core:** React 18 + Vite (Build tool de alta performance).
* **UI/UX:** Chakra UI (Componentização e Acessibilidade).
* **Gerenciamento de Estado:** Context API (Autenticação Global) e Hooks customizados.
* **Formulários:** React Hook Form (Performance e Validação).
* **Comunicação:** Axios (com Interceptors para injeção automática de JWT).
* **Utilitários:** `libphonenumber-js` (Validação de telefone), `react-select`.

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

* **Node.js** (versão 18 ou superior).
* **MixMeet-Backend:** O repositório do back-end deve estar rodando (via Docker) para que a autenticação e o CRUD funcionem.

## 🚀 Como Rodar a Aplicação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/JVSM-GAMES/MixMeet-Frontend
    cd MixMeet-Frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O projeto estará acessível em `http://localhost:5173/`.

## 📱 Guia de Uso (Fluxo Completo)

Para testar todas as funcionalidades, siga este fluxo:

1.  **Configuração Inicial (Admin):**
    * Na tela de login, clique no link **"Configuração do Sistema (Admin)"** no rodapé.
    * Insira a senha administrativa: **`admin4mixmeet`**.
    * Um QR Code será gerado. **Escaneie-o com seu WhatsApp** (Menu > Aparelhos Conectados > Conectar um aparelho).
    * Aguarde a confirmação de "Conectado!".

2.  **Login do Usuário:**
    * Insira seu número de telefone na tela inicial.
    * Digite o código de 6 dígitos recebido no seu WhatsApp.

3.  **Onboarding:**
    * Se for seu primeiro acesso, você será redirecionado para definir seu **Nickname**.

4.  **Dashboard:**
    * Gerencie suas reservas de sala (Criar, Editar, Excluir).
    * Teste a validação de conflito tentando criar uma reserva no mesmo horário e sala de outra existente.

## 🏗️ Decisões de Arquitetura

### 1. Axios Interceptors & API Client
A comunicação com os microsserviços (Python e C#) é centralizada em `apiClient.js`. Um **Interceptor** injeta automaticamente o Token JWT no cabeçalho `Authorization` de todas as requisições para a API de Reservas, garantindo segurança transparente.

### 2. Context API para Sessão
O estado de autenticação e o perfil do usuário são gerenciados via `AuthContext`, permitindo que a sessão persista entre recarregamentos e protegendo rotas privadas (`/dashboard`) de acesso não autorizado.

### 3. Blindagem de Componentes (Hardening)
Para evitar falhas críticas ("Tela Branca") causadas por extensões de navegador que manipulam o DOM (ex: carteiras cripto), implementamos uma renderização defensiva nos botões de ação, isolando o estado de `loading` em elementos `<span>` controlados manualmente, em vez de depender da desmontagem automática do Chakra UI.
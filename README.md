# StokyEasy

Trabalho UPX-5 — Aplicação mobile de gestão de estoque para pequenos comércios.

O StokyEasy é voltado a donos de mercados, mercearias e restaurantes que precisam controlar produtos perecíveis e não perecíveis, substituindo planilhas e métodos manuais por uma interface simples e acessível no celular. O sistema oferece controle de estoque, gestão de clientes e pedidos, com dados persistidos localmente no dispositivo.

A solução está alinhada à **ODS 12 – Consumo e Produção Responsáveis**, promovendo o uso consciente de recursos e a redução de desperdícios por meio do monitoramento de estoque.

---

## Funcionalidades

- Autenticação com persistência de sessão (login, solicitar acesso, redefinir senha)
- Tema claro/escuro com preferência salva localmente
- **Produtos:** cadastro, edição e exclusão de produtos com nome, quantidade, preço e descrição; resumo com total de itens, quantidade em estoque e valor total
- **Clientes:** cadastro e edição de clientes; criação de pedidos vinculados a produtos; controle de parcelas (adicionar, pagar, cancelar); resumo com total de clientes, pedidos ativos e valor a receber
- **Perfil:** tela de perfil do usuário logado
- Dados armazenados localmente via AsyncStorage (funciona offline)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81.5 + Expo ~54 |
| Linguagem | JavaScript (React 19) + TypeScript 5.9 |
| Navegação | React Navigation (Stack + Bottom Tabs) |
| UI | React Native Paper, FontAwesome6 (Expo Vector Icons), Styled Components |
| Armazenamento | AsyncStorage (local, offline) |
| Animações | React Native Reanimated, Lottie |
| Formulários | Formik |
| HTTP | Axios |
| Notificações | react-native-toast-message |
| Build | EAS (Expo Application Services) |

---

## Estrutura do projeto

```
├── App.js                        # Entry point: splash, tema e verificação de sessão
├── index.js
├── app.json                      # Configurações Expo / EAS
├── navigators/
│   └── NavigationRootStack.js    # Stack raiz (Login ou Tabs conforme sessão)
├── screens/
│   ├── Login.js
│   ├── RequestLogin.js
│   └── logged/
│       ├── InitialPage.js        # Home: atalhos para Produtos, Clientes e Perfil
│       ├── ProfileScreen.js
│       ├── products/             # Tela, card, modal e hook de produtos
│       └── clients/              # Tela, card, modais e hook de clientes/pedidos
├── components/
│   ├── general/                  # Componentes reutilizáveis (Input, Modal, Dropdown…)
│   ├── logged/
│   │   └── BottomTabsLayout.js   # Bottom tab navigator (Home, Produtos, Clientes, Perfil)
│   ├── ThemeContext.js
│   ├── LoginDataContext.js
│   └── LoadThemeFromStorage.js
└── functions/
    ├── general/                  # Máscaras, validações, timer
    └── logged/                   # Logout
```

---

## Pré-requisitos

- Node.js 22+
- npm (incluído com o Node)
- Expo CLI: `npm install -g expo-cli`
- Para rodar no dispositivo físico ou emulador:
  - **Android:** Android Studio + emulador configurado ou dispositivo com USB debugging ativado
  - **iOS:** Xcode (apenas macOS) ou dispositivo físico com Expo Dev Client

---

## Como rodar

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd UPX-5-StokyEasy-React-Native

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start

# Para rodar diretamente no Android
npx expo run:android

# Para rodar diretamente no iOS
npx expo run:ios
```

> O projeto usa **Expo Dev Client** (não o Expo Go), pois contém módulos nativos. É necessário buildar o cliente antes da primeira execução em um novo dispositivo/emulador.

---

## Área de abrangência

Abrangência inicial: cidade de **Sorocaba**, voltado a pequenos comércios locais. Por ser uma aplicação mobile, possui potencial de expansão regional e nacional.

---

## Contexto acadêmico

Este projeto é destinado ao uso acadêmico — UPX-5, curso de Análise e Desenvolvimento de Sistemas.

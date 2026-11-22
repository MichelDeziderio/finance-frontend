# Diagramas UML — Finan$e

Documentação para a apresentação acadêmica do sistema Finan$e, elaborada a partir dos repositórios [finance-frontend](https://github.com/MichelDeziderio/finance-frontend) (Angular) e [finance-backend](https://github.com/MichelDeziderio/finance-backend) (NestJS/MongoDB).

Os diagramas abaixo aparecem **um abaixo do outro** no GitHub. O primeiro representa classes e serviços; o segundo apresenta as funcionalidades disponíveis ao usuário.

## 1. Diagrama de classes

~~~mermaid
classDiagram
    direction LR

    class User {
        +string id
        +string name
        +string email
        +string password
        +string resetPasswordToken
        +Date resetPasswordExpires
    }

    class Wallet {
        +string id
        +string name
        +WalletType type
        +string color
    }

    class Category {
        +string id
        +string walletId
        +string name
        +MovementType type
        +string color
        +boolean isDefault
        +string defaultKey
    }

    class Movement {
        +string id
        +string walletId
        +MovementType type
        +string description
        +string categoryId
        +number amount
        +Date date
        +string paymentMethod
        +string notes
    }

    class FrontendAuthService {
        +register()
        +login()
        +forgotPassword()
        +resetPassword()
        +logout()
    }

    class FrontendFinanceService {
        +loadWallets()
        +createWallet()
        +listCategories()
        +createCategory()
        +listMovements()
        +createMovement()
        +getDashboard()
    }

    class AuthService {
        +register()
        +login()
        +forgotPassword()
        +resetPassword()
        +changePassword()
        +getMe()
    }

    class UsersService {
        +create()
        +findByEmail()
        +findById()
        +update()
    }

    class MailService {
        +sendPasswordResetEmail()
        +sendPasswordChangedConfirmation()
    }

    class WalletsService {
        +create()
        +findAll()
        +findOne()
        +update()
        +remove()
    }

    class CategoriesService {
        +list()
        +create()
        +remove()
        +findInWallet()
    }

    class MovementsService {
        +create()
        +list()
        +findOne()
        +update()
        +remove()
    }

    class DashboardService {
        +get()
    }

    Wallet "1" --> "0..*" Category : walletId
    Wallet "1" --> "0..*" Movement : walletId
    Category "1" --> "0..*" Movement : categoryId

    FrontendAuthService ..> AuthService : HTTP via AuthController
    FrontendFinanceService ..> WalletsService : HTTP via controller
    FrontendFinanceService ..> CategoriesService : HTTP via controller
    FrontendFinanceService ..> MovementsService : HTTP via controller
    FrontendFinanceService ..> DashboardService : HTTP via controller

    AuthService --> UsersService
    AuthService --> MailService
    UsersService --> User
    WalletsService --> Wallet
    WalletsService --> Category : cria padroes
    WalletsService --> Movement : remove em cascata
    CategoriesService --> Category
    MovementsService --> Movement
    DashboardService --> Movement
    DashboardService --> Category
~~~

**Leitura:** `Wallet` contém categorias e movimentações associadas pelo `walletId`, enquanto cada `Movement` referencia uma categoria por `categoryId`. Esses vínculos são referências lógicas entre documentos MongoDB, não chaves estrangeiras de um banco relacional. Os nomes `FrontendAuthService` e `FrontendFinanceService` identificam os serviços Angular e evitam confusão com os serviços NestJS. As dependências entre Front-end e Back-end representam chamadas HTTP por meio dos controllers.

## 2. Diagrama de casos de uso

A notação abaixo utiliza **três grupos em colunas** e **casos de uso em elipses** para tornar a leitura mais simples. Algumas ações foram agrupadas em um mesmo caso de uso; os dois blocos de 'Usuário autenticado' representam o mesmo ator, duplicado apenas para evitar linhas longas. Mermaid não oferece um tipo UML de caso de uso nativo.

~~~mermaid
flowchart LR
    subgraph ACESSO["01 · ACESSO"]
        direction TB
        VIS["👤 Visitante"]:::actor
        CAD(["Criar conta"]):::usecase
        LOGIN(["Entrar no sistema"]):::usecase
        REC(["Recuperar ou redefinir senha"]):::usecase

        VIS --- CAD
        VIS --- LOGIN
        VIS --- REC
    end

    subgraph GESTAO["02 · GESTÃO FINANCEIRA"]
        direction TB
        USR1["👤 Usuário autenticado"]:::actor
        CART(["Carteiras<br/>Criar · selecionar · editar · excluir"]):::usecase
        CATEG(["Categorias<br/>Consultar · criar · excluir"]):::usecase
        MOV(["Movimentações<br/>Cadastrar receitas e despesas"]):::usecase

        USR1 --- CART
        USR1 --- CATEG
        USR1 --- MOV
    end

    subgraph CONSULTAS["03 · CONSULTAS E CONTA"]
        direction TB
        USR2["👤 Usuário autenticado"]:::actor
        HIST(["Histórico<br/>Consultar · filtrar · editar · excluir"]):::usecase
        DASH(["Dashboard<br/>Resumo · gráficos · últimas 10 · período"]):::usecase
        CONTA(["Conta<br/>Alterar senha · sair"]):::usecase

        USR2 --- HIST
        USR2 --- DASH
        USR2 --- CONTA
    end

    classDef actor fill:#e8f1ff,stroke:#2563eb,color:#1e40af,stroke-width:2px
    classDef usecase fill:#ffffff,stroke:#64748b,color:#0f172a,stroke-width:1.5px
    style ACESSO fill:#eff6ff,stroke:#93c5fd,stroke-width:1px
    style GESTAO fill:#f0fdf4,stroke:#86efac,stroke-width:1px
    style CONSULTAS fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    linkStyle default stroke:#94a3b8,stroke-width:1.2px
~~~

**Observação sobre o estado atual:** o Front-end utiliza autenticação e guards de rota, mas as rotas financeiras do Back-end ainda não aplicam `JwtAuthGuard` e o schema `Wallet` não possui `ownerId`. Por isso, o diagrama não afirma isolamento de carteiras por proprietário nem inclui convites ou delegação de permissões.

---

**Código-fonte:** [Front-end](https://github.com/MichelDeziderio/finance-frontend) · [Back-end](https://github.com/MichelDeziderio/finance-backend)

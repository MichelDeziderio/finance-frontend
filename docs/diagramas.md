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

A notação abaixo é representada como **fluxograma Mermaid com casos de uso em elipses**, pois Mermaid não oferece um tipo UML de caso de uso nativo.

~~~mermaid
flowchart LR
    VIS["👤 Visitante"]:::actor
    USR["👤 Usuário autenticado"]:::actor

    subgraph SYS["Finan$e — Sistema de controle financeiro"]
        direction TB

        subgraph AUTH["Autenticação"]
            direction TB
            UC_REG([Criar conta])
            UC_LOGIN([Entrar no sistema])
            UC_FORGOT([Solicitar recuperação de senha])
            UC_RESET([Redefinir senha])
            UC_LOGOUT([Sair do sistema])
        end

        subgraph WALLET["Carteiras"]
            direction TB
            UC_WLIST([Listar e selecionar carteiras])
            UC_WCREATE([Criar carteira])
            UC_WEDIT([Editar carteira])
            UC_WDELETE([Excluir carteira])
        end

        subgraph CAT["Categorias"]
            direction TB
            UC_CLIST([Consultar categorias])
            UC_CCREATE([Criar categoria])
            UC_CDELETE([Excluir categoria personalizada])
        end

        subgraph MOV["Movimentações"]
            direction TB
            UC_INCOME([Cadastrar receita])
            UC_EXPENSE([Cadastrar despesa])
            UC_MLIST([Consultar histórico e aplicar filtros])
            UC_MEDIT([Editar movimentação])
            UC_MDELETE([Excluir movimentação])
        end

        subgraph DASH["Dashboard"]
            direction TB
            UC_DASH([Visualizar resumo financeiro])
            UC_CHART([Consultar gráficos e indicadores])
            UC_RECENT([Consultar últimas 10 movimentações])
            UC_PERIOD([Filtrar dashboard por período])
        end
    end

    VIS --- UC_REG
    VIS --- UC_LOGIN
    VIS --- UC_FORGOT
    VIS --- UC_RESET

    USR --- UC_LOGOUT
    USR --- UC_WLIST
    USR --- UC_WCREATE
    USR --- UC_WEDIT
    USR --- UC_WDELETE
    USR --- UC_CLIST
    USR --- UC_CCREATE
    USR --- UC_CDELETE
    USR --- UC_INCOME
    USR --- UC_EXPENSE
    USR --- UC_MLIST
    USR --- UC_MEDIT
    USR --- UC_MDELETE
    USR --- UC_DASH
    USR --- UC_CHART
    USR --- UC_RECENT
    USR --- UC_PERIOD

    classDef actor fill:#e5f0ff,stroke:#2563eb,color:#183153,stroke-width:2px
    style AUTH fill:#f8fafc,stroke:#94a3b8
    style WALLET fill:#f0fdf4,stroke:#86af97
    style CAT fill:#fff7ed,stroke:#e9a253
    style MOV fill:#f0f9ff,stroke:#7db1d1
    style DASH fill:#fdf4ff,stroke:#b89ac9
~~~

**Observação sobre o estado atual:** o Front-end utiliza autenticação e guards de rota, mas as rotas financeiras do Back-end ainda não aplicam `JwtAuthGuard` e o schema `Wallet` não possui `ownerId`. Por isso, o diagrama não afirma isolamento de carteiras por proprietário nem inclui convites ou delegação de permissões.

---

**Código-fonte:** [Front-end](https://github.com/MichelDeziderio/finance-frontend) · [Back-end](https://github.com/MichelDeziderio/finance-backend)

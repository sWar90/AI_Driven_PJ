# AI_Driven_PJ

AI_Driven_PJ is an ASP.NET Core Web API built with a Hybrid Clean Architecture style. The project currently includes master-data CRUD APIs for companies and banks, standard API responses, pagination support, EF Core persistence, JWT-ready configuration, CORS configuration, and optional AES request encryption middleware.

## Tech Stack

- .NET 9
- ASP.NET Core Web API
- Entity Framework Core 9
- SQL Server
- ASP.NET Core Identity
- JWT Bearer Authentication
- FluentValidation
- MediatR
- Dapper
- Scalar API documentation

## Project Structure

```text
AI_Driven_PJ
├── AI_Driven_PJ.slnx
└── src
    ├── AI_Driven_PJ.Api
    ├── AI_Driven_PJ.Application
    ├── AI_Driven_PJ.Domain
    └── AI_Driven_PJ.Infrastructure
```

## Architecture

- `AI_Driven_PJ.Api` handles HTTP endpoints, middleware, API documentation, authentication setup, and CORS setup.
- `AI_Driven_PJ.Application` contains application contracts, shared response models, pagination models, options, and master-data services.
- `AI_Driven_PJ.Domain` contains core entities and common domain base types.
- `AI_Driven_PJ.Infrastructure` contains EF Core DbContext, migrations, persistence services, encryption services, and external infrastructure registrations.

Dependency direction:

```text
Api -> Application -> Domain
Infrastructure -> Application + Domain
```

## Current API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/companies` | Get paged company list |
| GET | `/api/companies/{id}` | Get company by id |
| POST | `/api/companies` | Create company |
| PUT | `/api/companies/{id}` | Update company |
| DELETE | `/api/companies/{id}` | Delete company |
| GET | `/api/banks` | Get paged bank list |
| GET | `/api/banks/{id}` | Get bank by id |
| POST | `/api/banks` | Create bank |
| PUT | `/api/banks/{id}` | Update bank |
| DELETE | `/api/banks/{id}` | Delete bank |

## Getting Started

### Prerequisites

- .NET 9 SDK
- SQL Server
- Visual Studio 2022, Rider, or VS Code

### Configure Database

Update the connection string in `src/AI_Driven_PJ.Api/appsettings.json`, or set it with an environment variable:

```powershell
$env:ConnectionStrings__DefaultConnection="Data Source=localhost,1433;Initial Catalog=AI_Driven_PJ;Persist Security Info=True;TrustServerCertificate=true;User ID=sa;Password=<your-password>;"
```

### Restore and Build

```powershell
dotnet restore AI_Driven_PJ.slnx
dotnet build AI_Driven_PJ.slnx
```

### Apply Database Migration

```powershell
dotnet ef database update --project src/AI_Driven_PJ.Infrastructure --startup-project src/AI_Driven_PJ.Api
```

### Run the API

```powershell
dotnet run --project src/AI_Driven_PJ.Api
```

Default local URLs:

- HTTP: `http://localhost:5042`
- HTTPS: `https://localhost:7298`
- API docs: `/scalar/v1`

## Configuration Notes

- `Cors:AllowedOrigins` should be configured per environment.
- `JWT:Secret` should be set with a secure secret before enabling protected endpoints.
- `Encryption:Enabled` can be turned on when clients send encrypted request bodies.
- Do not commit real database passwords, JWT secrets, encryption keys, or IV values.

## Validation

The project can be validated with:

```powershell
dotnet build AI_Driven_PJ.slnx
```

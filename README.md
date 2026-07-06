# AI_Driven_PJ

AI_Driven_PJ is a full-stack project with an ASP.NET Core Web API backend and an Angular client. The backend follows a Hybrid Clean Architecture style with Domain, Application, Infrastructure, and Api projects. The current API includes authentication support, standard API responses, pagination, EF Core persistence, SQL Server, CORS configuration, Scalar API documentation, and optional AES request encryption middleware.

## Tech Stack

### Backend

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

### Frontend

- Angular 20
- PrimeNG 20
- NgRx Signals
- ngx-translate
- Tailwind CSS
- pnpm

## Project Structure

```text
AI_Driven_PJ/
|-- AI_Driven_PJ.slnx
|-- README.md
`-- src/
    |-- AI_Driven_PJ.Api/
    |-- AI_Driven_PJ.Application/
    |-- AI_Driven_PJ.Domain/
    |-- AI_Driven_PJ.Infrastructure/
    `-- AI_Driven_PJ.Client/
```

## Architecture

- `AI_Driven_PJ.Api` handles HTTP endpoints, middleware, API documentation, authentication setup, and CORS setup.
- `AI_Driven_PJ.Application` contains application contracts, shared response models, pagination models, options, authentication services, and master-data services.
- `AI_Driven_PJ.Domain` contains core entities and common domain base types.
- `AI_Driven_PJ.Infrastructure` contains EF Core persistence, migrations, entity configurations, Identity integration, encryption services, and infrastructure service registrations.
- `AI_Driven_PJ.Client` contains the Angular application, layout, auth screens, master-data pages, shared services, and environment configuration.

Dependency direction:

```text
Api -> Application -> Domain
Infrastructure -> Application + Domain
Client -> Api
```

`ApplicationDbContext` is the main EF Core context for Identity and application entities. Application services access persistence through `IApplicationDbContext`; controllers should stay thin and call Application services.

## Current API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/revoke-token` | Revoke refresh token |
| GET | `/api/auth/current-user` | Get current user |
| GET | `/api/auth/status` | Get auth status |
| POST | `/api/auth/select-company` | Select active company |
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

## Prerequisites

- .NET 9 SDK
- SQL Server
- Node.js
- pnpm 11
- Visual Studio 2022, Rider, or VS Code

Install EF Core CLI if it is not already installed:

```powershell
dotnet tool install --global dotnet-ef
```

Update EF Core CLI when needed:

```powershell
dotnet tool update --global dotnet-ef
```

## Backend Setup

Configure the database connection string in `src/AI_Driven_PJ.Api/appsettings.json`, or set it with an environment variable:

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Database=AI_Driven_PJ;Trusted_Connection=True;TrustServerCertificate=True;"
```

Restore and build:

```powershell
dotnet restore AI_Driven_PJ.slnx
dotnet build AI_Driven_PJ.slnx
```

Run the API:

```powershell
dotnet run --project src/AI_Driven_PJ.Api
```

Default local URLs:

- HTTP: `http://localhost:5042`
- HTTPS: `https://localhost:7298`
- API docs: `https://localhost:7298/scalar/v1`

## Database Migration

Use this workflow after changing Domain entities, EF configurations, Identity models, or `ApplicationDbContext`.

### Step 1: Open the repository root

Run EF Core commands from the repository root:

```powershell
cd C:\repos\AI_Driven_PJ
```

### Step 2: Confirm the connection string

Set the connection string for the current PowerShell session, or make sure `src/AI_Driven_PJ.Api/appsettings.json` has the correct `ConnectionStrings:DefaultConnection` value:

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Database=AI_Driven_PJ;Trusted_Connection=True;TrustServerCertificate=True;"
```

### Step 3: Build the solution

Fix any compile errors before creating a migration:

```powershell
dotnet build AI_Driven_PJ.slnx
```

### Step 4: Add a migration

Replace `MigrationName` with a meaningful name such as `AddCustomerTable`, `UpdateBankFields`, or `AddMasterDataTables`:

```powershell
dotnet ef migrations add MigrationName `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext `
  --output-dir Persistence/Migrations
```

### Step 5: Review the generated migration

Check the new files under `src/AI_Driven_PJ.Infrastructure/Persistence/Migrations`.

Make sure the migration only contains the expected schema changes. If it contains unexpected table drops, column drops, or unrelated changes, do not apply it yet.

### Step 6: Apply the migration

```powershell
dotnet ef database update `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext
```

### Step 7: Verify the migration list

This shows all migrations. If the database connection is valid, EF also shows which migrations are pending:

```powershell
dotnet ef migrations list `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext
```

### Optional: Remove the last migration

Only use this before the migration has been applied to a shared database:

```powershell
dotnet ef migrations remove `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext
```

### Optional: Generate a SQL script

Use a SQL script when DB changes need to be reviewed before deployment:

```powershell
dotnet ef migrations script `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext `
  --output artifacts/migrations.sql
```

## Database Scaffold

Use scaffolding when you need to reverse-engineer tables from an existing SQL Server database. Scaffold into a temporary folder first, review the generated code, then move only the needed entity and configuration changes into the Clean Architecture projects.

### Step 1: Open the repository root

```powershell
cd C:\repos\AI_Driven_PJ
```

### Step 2: Set the source database connection

Use the database you want to reverse-engineer:

```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Database=AI_Driven_PJ;Trusted_Connection=True;TrustServerCertificate=True;"
```

### Step 3: Scaffold into a temporary folder

Do not scaffold directly over `ApplicationDbContext` or the Domain entities. Use `Persistence/Scaffolded` as a review area:

```powershell
dotnet ef dbcontext scaffold `
  "$env:ConnectionStrings__DefaultConnection" `
  Microsoft.EntityFrameworkCore.SqlServer `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ScaffoldedDbContext `
  --context-dir Persistence/Scaffolded `
  --output-dir Persistence/Scaffolded/Entities `
  --namespace AI_Driven_PJ.Infrastructure.Persistence.Scaffolded.Entities `
  --context-namespace AI_Driven_PJ.Infrastructure.Persistence.Scaffolded `
  --no-onconfiguring `
  --force
```

### Step 4: Review the scaffolded files

Review these generated files:

- `src/AI_Driven_PJ.Infrastructure/Persistence/Scaffolded/ScaffoldedDbContext.cs`
- `src/AI_Driven_PJ.Infrastructure/Persistence/Scaffolded/Entities`

Check table names, primary keys, column types, nullable fields, max lengths, relationships, and generated navigation properties.

### Step 5: Move stable entities into Domain

Move only the required entity classes to:

```text
src/AI_Driven_PJ.Domain/Entities
```

Keep entity classes clean. Do not keep scaffold-only `DbContext` references in Domain.

### Step 6: Move mapping rules into Infrastructure

Move EF mapping rules to:

```text
src/AI_Driven_PJ.Infrastructure/Persistence/Configurations
```

Use `IEntityTypeConfiguration<TEntity>` classes, following the existing `BankConfiguration` and `CompanyConfiguration` pattern.

### Step 7: Register useful DbSets

Add a `DbSet` to `ApplicationDbContext` only when direct typed access is useful:

```csharp
public DbSet<ExampleEntity> ExampleEntities => Set<ExampleEntity>();
```

Application services can still use `context.Set<TEntity>()` through `IApplicationDbContext`.

### Step 8: Delete the temporary scaffold folder

After copying the reviewed entity and configuration changes, delete:

```text
src/AI_Driven_PJ.Infrastructure/Persistence/Scaffolded
```

### Step 9: Add an application migration when needed

If the application should manage the schema, create and review a migration:

```powershell
dotnet ef migrations add MigrationName `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext `
  --output-dir Persistence/Migrations
```

Then apply it:

```powershell
dotnet ef database update `
  --project src/AI_Driven_PJ.Infrastructure `
  --startup-project src/AI_Driven_PJ.Api `
  --context ApplicationDbContext
```

### Scaffold checklist

- Move stable domain entities to `src/AI_Driven_PJ.Domain/Entities`.
- Move EF mapping rules to `src/AI_Driven_PJ.Infrastructure/Persistence/Configurations`.
- Register new tables on `ApplicationDbContext` when direct `DbSet` access is useful.
- Keep `IApplicationDbContext` as the Application layer persistence boundary.
- Delete the temporary `Persistence/Scaffolded` folder after copying the reviewed changes.
- Add and apply a migration only when the application should manage the schema.

## Frontend Setup

Install dependencies:

```powershell
cd src/AI_Driven_PJ.Client
pnpm install
```

Run the Angular client:

```powershell
pnpm start
```

Default local URL:

- `http://localhost:4200`

Build the Angular client:

```powershell
pnpm build
```

## Angular Scaffold

Generate Angular features with the Angular CLI from the client project folder:

```powershell
cd src/AI_Driven_PJ.Client
pnpm ng generate component features/example/pages/example-page --standalone
pnpm ng generate service features/example/services/example
```

For master-data CRUD screens, follow the existing `banks` feature shape:

```text
src/app/features/<feature-name>/
|-- <feature-name>.routes.ts
`-- pages/
    |-- models/
    |-- services/
    |-- stores/
    |-- pages.html
    |-- pages.scss
    `-- pages.ts
```

## Configuration Notes

- `Cors:AllowedOrigins` should be configured per environment.
- `JWT:Secret` must be set to a secure secret before protected endpoints are enabled.
- `JWT:AccessTokenMinutes` and `JWT:RefreshTokenDays` control token lifetime.
- `Encryption:Enabled` can be turned on when clients send encrypted request bodies.
- Local appsettings, environment files, database passwords, JWT secrets, encryption keys, and IV values should not be committed.

## Validation

Backend:

```powershell
dotnet build AI_Driven_PJ.slnx
```

Frontend:

```powershell
cd src/AI_Driven_PJ.Client
pnpm lint
pnpm build
```

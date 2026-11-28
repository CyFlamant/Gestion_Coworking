# Deployment plan: Azure

Deploys the full stack (front end, app-service, database) for Spaces management on Azure, to check it works before the auth-service and Bookings management are added. The front-end and back-end changes it needs are in `pre-deployment-plan.md` (done, except the production addresses, which this plan provides).

Each step ends with a check that the deployed part works, and is committed on its own when it changes files. Azure services, prices and limits change often: check each one in the official documentation (References) before creating it.

## Architecture

| Part | Azure service | Why |
| --- | --- | --- |
| Front end (`frontend/app/dist`) | **Azure Static Web Apps**, Free plan | Static files over HTTPS, SPA fallback set in `staticwebapp.config.json`, no server to manage |
| app-service | **Azure Container Apps**, Consumption plan | Runs the Docker image of the Spring Boot app, HTTPS ingress included, environment variables and secrets, can scale to zero |
| Container image | **Azure Container Registry** (Basic), see Decisions | Where Container Apps pulls the image from |
| Database | **Azure Database for MySQL – Flexible Server**, Burstable B1ms | Azure Database for MariaDB was retired on 19 September 2025; MySQL Flexible Server is its replacement. B1ms is in the Azure for Students free services (750 hours a month, 32 GB) |

The browser loads the front end from Static Web Apps and calls the app-service directly at its Container Apps address (CORS). The app-service connects to MySQL over TLS. Flyway creates the tables on the first start.

Settings of the app-service in production (from `pre-deployment-plan.md` and `backend/app-service/README.md`):

| Environment variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://SERVER.mysql.database.azure.com:3306/gestion_coworking?sslMode=REQUIRED` |
| `SPRING_DATASOURCE_USERNAME` | the application's database user |
| `SPRING_DATASOURCE_PASSWORD` | a Container Apps secret (`secretref:`), never in a file |
| `APP_PLACEHOLDERUSERROLE` | `ADMIN`, only behind the access protection (see Decisions) |
| `APP_CORS_ALLOWEDORIGINS` | the Static Web Apps address, `https://NAME.azurestaticapps.net` |

## Steps

| Step | Content | Status |
| --- | --- | --- |
| 1. Account and tools | Azure for Students subscription; install the Azure CLI (`az`, not installed yet) and sign in; one resource group for everything, in one region allowed by the subscription (e.g. West Europe or France Central); a budget alert in Cost Management | To do |
| 2. Check on MySQL locally | Azure runs MySQL 8, the local database is MariaDB. Start MySQL 8 in Docker, run the back-end tests and the app against it (Flyway migrations, free-space query), fix any difference before going to Azure | To do |
| 3. Container image | `backend/app-service/Dockerfile` (build with Maven and JDK 21, run on a Java 21 runtime image, port 8080), `.dockerignore`, `.gitattributes` at the root (`docs/to-do.md`). Build and run it locally with the production variables against the local database (same checks as `pre-deployment-plan.md`, steps 2–3) | To do |
| 4. Database | MySQL Flexible Server B1ms, database `gestion_coworking`, an application user with rights on that database only; TLS required (`require_secure_transport` on); firewall rule (see Decisions). Check: connect with the MySQL client from your computer (temporary firewall rule for your IP) | To do |
| 5. app-service on Container Apps | Push the image to the registry; create the Container Apps environment and app: external ingress on port 8080, the environment variables and the password secret above, scale rule (see Decisions), IP restriction (see Access protection). Check: `GET /api/spaces` answers 200 over HTTPS, the log says the profile `prod` is active, Flyway created the tables | To do |
| 6. Front end on Static Web Apps | `pre-deployment-plan.md` step 4: the app-service address in `frontend/app/.env.production` (and in test 136). `frontend/app/public/staticwebapp.config.json`: `navigationFallback` to `/index.html` (refreshing `/horaires` works), `X-Robots-Tag: noindex` header (or keep `robots.txt`). Build, deploy `dist` with the Static Web Apps CLI (see Decisions). Put the Static Web Apps address in `APP_CORS_ALLOWEDORIGINS`. Check: the pages load, refreshing a page works | To do |
| 7. Smoke test | A script (`scripts/smoke-test.ps1`, addresses as parameters) to run after each deployment: the front page loads; `GET /api/spaces` answers 200; a CORS preflight from the deployed origin is accepted and one from another origin refused; as admin, a space is created then deleted. Plus, by hand: the log shows the profile `prod` | To do |
| 8. Documentation | How to deploy again (image, front end, settings) in both READMEs; `CLAUDE.md` (deployment line); `to-do.md`; the test list if test 136 changes | To do |

## Decisions

- **Access protection (until the auth-service):** every request runs as the fixed user, so with `ADMIN` anyone who reaches the API can change the spaces. Recommended: role `ADMIN` and an **IP restriction on the Container App** (allow only your own IP address): the pages stay public but only your browser can call the API. Your IP changes at home, at school or on a phone: update the rule when it does. Optional on top: Static Web Apps **password protection** (a preview feature; check whether the Free plan has it). Alternative: role empty (guest), no restriction, read-only site; admin Espaces then cannot be shown.
- **Registry:** Azure Container Registry Basic is the simplest with Container Apps (`az acr build` builds the image in Azure, no local push), but it is paid. Alternative: GitHub Container Registry (free; the image or a token must be readable by Container Apps). Recommended: Azure Container Registry, check its monthly price against the credit first.
- **Scale to zero:** with a minimum of zero replicas, the app stops when unused and costs almost nothing, but the first request after a pause waits for Spring Boot to start (several seconds; the front end may show "Impossible de joindre le serveur." once). Recommended: minimum 0, set to 1 on demonstration days.
- **Database firewall:** "allow public access from any Azure service" is the simplest, but Microsoft advises against it (any Azure customer's service passes the firewall, then only the password protects). Recommended: a rule for the outbound IP address of the Container Apps environment (check whether it can change on the Consumption plan); your own IP only temporarily, for step 4.
- **TLS to the database:** `sslMode=REQUIRED` encrypts the connection without checking the server certificate. Enough for this first deployment; `VERIFY_IDENTITY` with Azure's root certificates later.
- **Front-end deployment:** creating a Static Web App linked to GitHub adds a GitHub Actions workflow and commits it to the repository. All commits are made by hand in this project, so deploy with the Static Web Apps CLI (`swa deploy`) and a deployment token instead; GitHub Actions can come later (Out of scope).
- **Health check:** the app has Actuator, but `/actuator/health` needs a signed-in user (`SecurityConfig`), so a guest probe gets 401. For the first deployment, Container Apps' default probe on the port is enough. Opening `/actuator/health` to everyone is a back-end change (with a test) for `pre-deployment-plan.md` if needed.
- **Data:** the deployed database starts empty; the admin creates the spaces through the page. The demo spaces script stays for development only.

## Costs

To check on the pricing pages before step 1 (Azure for Students: 100 USD credit for 12 months, no credit card):

- Static Web Apps Free: free.
- MySQL Flexible Server B1ms: in the student free services (750 hours a month, 32 GB storage, 32 GB backup), as long as it stays within those limits.
- Container Apps Consumption: a monthly free grant; scale to zero keeps it within it.
- Container Registry Basic: paid monthly, from the credit.

The budget alert of step 1 warns before the credit runs out. When the credit or the 12 months end, the subscription is disabled.

## Out of scope (later)

- Continuous integration and deployment: GitHub Actions running both test suites on each push (with a MySQL service), then deploying.
- Custom domain, Key Vault for secrets, private network between Container Apps and MySQL, `VERIFY_IDENTITY` for the database certificate.
- Browser end-to-end tests (Playwright) once bookings and sign-in exist.
- Deployment of the auth-service (`docs/Plan d'implementation.md`: 3/12).
- Not blocking: Mockito self-attach warning; early error for a missing `VITE_API_MODE` (both in `docs/to-do.md`).

## References

Project documents to read with this plan (paths from the repository root):

| Document | Content |
| --- | --- |
| `CLAUDE.md` | Architecture, commands, conventions (TDD, test lists, plans, git) |
| `docs/pre-deployment-plan.md` | Front-end and back-end changes done before this deployment (profiles, environment variables, production addresses) |
| `docs/Cahier des charges.md` | Requirements (French) |
| `docs/Plan d'implementation.md` | Architecture, planning, class diagram, planned deployment (French) |
| `docs/pages accueil.md` | UI mockups (French) |
| `docs/backend-connection-plan.md` | Connecting the React app to the app-service (done) |
| `docs/backend-spaces-plan.md` | Back-end work on spaces (done) |
| `docs/react_porting-plan.md` | Port of the HTML prototype to React (done) |
| `docs/to-do.md` | Open items, including deployment (local file, not tracked by git) |
| `docs/test-lists/gestion-coworking-back-end-tests.md` | Back-end tests: behaviours (with `…-back-end-test-functions.md` for the test names) |
| `docs/test-lists/gestion-coworking-front-end-tests.md` | Front-end tests: behaviours (with `…-front-end-test-functions.md` for the test names) |
| `frontend/app/README.md` | Front end: commands, mock and real modes, `.env` files, endpoints |
| `backend/app-service/README.md` | Back end: commands, configuration and production environment variables, endpoints, schema, tests |
| `backend/app-service/src/main/resources/application.properties` | Back-end settings shared by every environment |

Official documentation (check before each step):

| Topic | Link |
| --- | --- |
| Azure for Students | https://azure.microsoft.com/en-us/free/students |
| MySQL Flexible Server overview | https://learn.microsoft.com/en-us/azure/mysql/flexible-server/overview |
| MySQL Flexible Server free offer | https://learn.microsoft.com/en-us/azure/mysql/flexible-server/how-to-deploy-on-azure-free-account |
| MySQL with Java (JDBC, TLS) | https://learn.microsoft.com/en-us/azure/mysql/flexible-server/connect-java |
| MySQL TLS settings | https://learn.microsoft.com/en-us/azure/mysql/flexible-server/how-to-connect-tls-ssl |
| MariaDB retirement | https://azure.microsoft.com/fr-fr/updates/azure-database-for-mariadb-will-be-retired-on-19-september-2025-migrate-to-azure-database-for-mysql-flexible-server/ |
| Java on Container Apps | https://learn.microsoft.com/en-us/azure/container-apps/java-overview |
| Container Apps ingress (IP restrictions) | https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to |
| Container Apps secrets | https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets |
| Container Apps scaling | https://learn.microsoft.com/en-us/azure/container-apps/scale-app |
| Static Web Apps configuration (fallback, headers) | https://learn.microsoft.com/en-us/azure/static-web-apps/configuration |
| Static Web Apps password protection | https://learn.microsoft.com/en-us/azure/static-web-apps/password-protection |
| Static Web Apps pricing | https://azure.microsoft.com/en-us/pricing/details/app-service/static/ |

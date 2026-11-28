# Deployment plan: AWS

Deploys the full stack (front end, app-service, database) for Spaces management on AWS, to check it works before the auth-service and Bookings management are added. The front-end and back-end changes it needs are in `pre-deployment-plan.md` (done, except the production addresses, which this plan provides).

Each step ends with a check that the deployed part works, and is committed on its own when it changes files. AWS services, prices and Free Tier rules change often: check each one in the official documentation (References) before creating it.

## Architecture

| Part | AWS service | Why |
| --- | --- | --- |
| Front end (`frontend/app/dist`) | **AWS Amplify Hosting**, deployed without Git | Static files over HTTPS with an `amplifyapp.com` address, rewrite rule for the SPA fallback, custom headers |
| app-service | **Amazon ECS Express Mode** (Fargate) | Runs the Docker image of the Spring Boot app from an image and a few settings; creates the HTTPS load balancer and an AWS-provided address. AWS's recommended replacement for App Runner, which stopped taking new customers on 30 April 2026 |
| Container image | **Amazon ECR** (private repository) | Where ECS pulls the image from |
| Database | **Amazon RDS for MariaDB**, `db.t4g.micro`, Single-AZ | Same engine as the local database (XAMPP MariaDB); `db.t4g.micro` is in the Free plan |

The browser loads the front end from Amplify and calls the app-service directly at its ECS Express address (CORS). The app-service connects to RDS over TLS, inside the same VPC. Flyway creates the tables on the first start.

Settings of the app-service in production (from `pre-deployment-plan.md` and `backend/app-service/README.md`):

| Environment variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://ENDPOINT.REGION.rds.amazonaws.com:3306/gestion_coworking?sslMode=REQUIRED` |
| `SPRING_DATASOURCE_USERNAME` | the application's database user |
| `SPRING_DATASOURCE_PASSWORD` | from AWS Secrets Manager or SSM Parameter Store (secret in the task definition), never in a file |
| `APP_PLACEHOLDERUSERROLE` | `ADMIN`, only behind the access protection (see Decisions) |
| `APP_CORS_ALLOWEDORIGINS` | the Amplify address, `https://main.APPID.amplifyapp.com` |

## Steps

| Step | Content | Status |
| --- | --- | --- |
| 1. Account and tools | AWS account on the **Free plan** (see Costs); MFA on the root user, then an IAM Identity Center or IAM user for daily work (never the root user); one region for everything (e.g. `eu-west-3` Paris or `eu-west-1` Ireland); install the AWS CLI v2 (`aws`) and sign in; a budget alert in AWS Budgets; estimate the monthly cost of the architecture in the AWS Pricing Calculator and compare it with the credits | To do |
| 2. Check on the RDS MariaDB version locally | The local database is MariaDB 10.4; RDS offers newer versions only (pick one, e.g. the latest 11.x LTS). Start that version in Docker, run the back-end tests and the app against it (Flyway migrations, free-space query), fix any difference before going to AWS | To do |
| 3. Container image | `backend/app-service/Dockerfile` (build with Maven and JDK 21, run on a Java 21 runtime image, port 8080), `.dockerignore`, `.gitattributes` at the root (`docs/to-do.md`). Build and run it locally with the production variables against the local database (same checks as `pre-deployment-plan.md`, steps 2–3). Build for `linux/amd64` (or match the Fargate architecture chosen in step 5) | To do |
| 4. Database | RDS for MariaDB, `db.t4g.micro`, Single-AZ, 20 GB gp2/gp3, no public access, automated backups kept short; database `gestion_coworking`, an application user with rights on that database only; TLS required (`require_secure_transport` in a parameter group). Security group: inbound 3306 only from the app-service's security group (step 5). Check: connect with the MySQL client from inside the VPC (e.g. CloudShell in the VPC), or temporarily with public access and a rule for your IP only, removed afterwards | To do |
| 5. app-service on ECS Express Mode | Create the ECR repository, push the image; create the Express Mode service: image, port 8080, the environment variables and the password secret above, minimum 1 task, CPU/memory (e.g. 0.5 vCPU, 1 GB), the database security group rule of step 4, IP restriction on the load balancer (see Decisions). Check: `GET /api/spaces` answers 200 over HTTPS, the log (CloudWatch) says the profile `prod` is active, Flyway created the tables | To do |
| 6. Front end on Amplify Hosting | `pre-deployment-plan.md` step 4: the app-service address in `frontend/app/.env.production` (and in test 136). Amplify app without Git; rewrite rule to `/index.html` (200) for every path that is not a file (refreshing `/horaires` works); `X-Robots-Tag: noindex` header (or keep `robots.txt`). Build, zip `dist`, deploy it (console drag and drop, or `aws amplify create-deployment` + `start-deployment`). Put the Amplify address in `APP_CORS_ALLOWEDORIGINS`. Check: the pages load, refreshing a page works | To do |
| 7. Smoke test | A script (`scripts/smoke-test.ps1`, addresses as parameters) to run after each deployment: the front page loads; `GET /api/spaces` answers 200; a CORS preflight from the deployed origin is accepted and one from another origin refused; as admin, a space is created then deleted. Plus, by hand: the log shows the profile `prod` | To do |
| 8. Documentation | How to deploy again (image, front end, settings) in both READMEs; `CLAUDE.md` (deployment line); `to-do.md`; the test list if test 136 changes | To do |

## Decisions

- **Host:** AWS Free plan. Azure was considered first (`docs/Plan d'implementation.md`), but the school's Azure for Students Starter subscription has no credit, the school is not eligible for Azure for Students, and the Azure free account was not available.
- **app-service service:** ECS Express Mode is the simplest container service still open to new customers: HTTPS and an address included, no load balancer to configure by hand. Its cost is the load balancer (billed every hour, even with no task running) plus Fargate. Cheaper alternative: Lightsail container service (flat monthly price, HTTPS address included, no registry needed), but it has no IP restriction (see Access protection) and its Free plan eligibility must be checked. Elastic Beanstalk on a single free-plan instance has no HTTPS without extra setup, and an `https` front end cannot call an `http` back end (mixed content).
- **Access protection (until the auth-service):** every request runs as the fixed user, so with `ADMIN` anyone who reaches the API can change the spaces. Recommended: role `ADMIN` and an **IP restriction on the load balancer's security group** (inbound 443 only from your own IP address): the pages stay public but only your browser can call the API. Your IP changes at home, at school or on a phone: update the rule when it does. Check in step 5 that Express Mode lets you change that security group. Alternative: role empty (guest), no restriction, read-only site; admin Espaces then cannot be shown.
- **Database access:** no public access; only the app-service's security group reaches port 3306. Your own IP only temporarily, for the check of step 4.
- **TLS to the database:** `sslMode=REQUIRED` encrypts the connection without checking the server certificate. Enough for this first deployment; `VERIFY_IDENTITY` with the RDS certificate bundle later.
- **Front-end deployment:** connecting Amplify to GitHub is possible without committing to the repository, but each push to `main` would deploy. Deploy manually (zip of `dist`) for this first deployment; deployment on push can come later (Out of scope).
- **Health check:** the app has Actuator, but `/actuator/health` needs a signed-in user (`SecurityConfig`), so a guest probe gets 401. The load balancer's health check needs a path answering 200 to a guest: use `/api/spaces`. Opening `/actuator/health` to everyone is a back-end change (with a test) for `pre-deployment-plan.md` if needed.
- **Saving credits between demonstrations:** stop the RDS instance (storage still billed; RDS restarts it automatically after 7 days) and set the ECS service to 0 tasks (the load balancer is still billed). Delete everything at the end of the test.
- **Data:** the deployed database starts empty; the admin creates the spaces through the page. The demo spaces script stays for development only.

## Costs

Account: **AWS Free plan** (accounts created since 15 July 2025). A credit card is needed. To check on the Free Tier pages before step 1:

- 100 USD credit at sign-up, up to 100 USD more for completing activities in the console.
- The Free plan ends after 6 months or when the credits are used up, whichever comes first. The account then closes (content kept 90 days) unless it is upgraded to the paid plan. The Free plan blocks services that could use up the credits quickly.
- On the Free plan, usage is paid from the credits: nothing is charged to the card as long as the plan is not upgraded.

Per part (amounts from the Pricing Calculator in step 1, not guessed):

- Amplify Hosting: small, from the credits.
- ECS Express Mode: Application Load Balancer (hourly, the main fixed cost) + Fargate (per vCPU and GB per hour) + CloudWatch Logs.
- ECR: storage of the image, small.
- RDS `db.t4g.micro` + 20 GB storage: from the credits.

The budget alert of step 1 warns before the credits run out; the Free Tier page of the Billing console shows the remaining credits and the days left.

## Out of scope (later)

- Continuous integration and deployment: GitHub Actions running both test suites on each push (with a MariaDB service), then deploying.
- Custom domain, `VERIFY_IDENTITY` for the database certificate, infrastructure as code (CloudFormation, CDK or Terraform).
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
| Free Tier | https://aws.amazon.com/free/ |
| Free Tier FAQs | https://aws.amazon.com/free/free-tier-faqs/ |
| Free and paid plans | https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html |
| Pricing Calculator | https://calculator.aws/ |
| AWS Budgets | https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html |
| AWS CLI install | https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html |
| RDS Free Tier | https://aws.amazon.com/rds/free/ |
| RDS for MariaDB pricing | https://aws.amazon.com/rds/mariadb/pricing/ |
| RDS for MariaDB versions | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MariaDB.Concepts.VersionMgmt.html |
| RDS TLS | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html |
| ECS Express Mode | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html |
| Resources created by Express Mode | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-work.html |
| ECS secrets in environment variables | https://docs.aws.amazon.com/AmazonECS/latest/developerguide/secrets-envvar-secrets-manager.html |
| ECR: push a Docker image | https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html |
| App Runner availability change | https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html |
| Lightsail container services | https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-container-services.html |
| Amplify Hosting: manual deploys | https://docs.aws.amazon.com/amplify/latest/userguide/manual-deploys.html |
| Amplify Hosting: redirects and rewrites | https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html |
| Amplify Hosting: custom headers | https://docs.aws.amazon.com/amplify/latest/userguide/custom-headers.html |

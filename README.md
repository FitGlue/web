# FitGlue Web

**FitGlue Web** is the frontend hosting layer for the FitGlue fitness data aggregation platform. It provides the landing page, future dashboard, and implements the Unified URL Strategy via Firebase Hosting rewrites.

## Architecture

This repository manages:
- **Static Frontend**: Landing page and future web application
- **Firebase Hosting**: Routing layer that proxies requests to Cloud Functions
- **Infrastructure**: Terraform configuration for Firebase Hosting and IAM

The web repo deploys to the **same GCP projects** as the [server repo](https://github.com/ripixel/fitglue-server), enabling Firebase Hosting rewrites to work seamlessly with Cloud Functions. See [Decision 008](https://github.com/ripixel/fitglue-server/blob/main/docs/DECISIONS.md#008---project--repository-architecture-2025-12-24) for details.

## Unified URL Strategy

All public endpoints are accessible via a single domain per environment:

- **Prod**: `https://fitglue.tech`
- **Dev**: `https://dev.fitglue.tech`

Firebase Hosting rewrites route requests to the appropriate backend:

- `/` → Static landing page
- `/hooks/{provider}` → Webhook handlers (e.g., `hevy-webhook-handler`)
- `/api/{version}/**` → API service (future)
- `/auth/{provider}/callback` → OAuth callbacks (future)

## Tech Stack

- **Frontend**: HTML, CSS (vibrant, minimalist design)
- **Hosting**: Firebase Hosting
- **Infrastructure**: Terraform
- **CI/CD**: CircleCI with OIDC authentication

## Quick Start

### Prerequisites

- Node.js 20+
- Firebase CLI
- Terraform 1.5+
- Google Cloud SDK (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Serve locally
npm run serve
# Visit http://localhost:5000

# Lint code
npm run lint
```

### Deployment

Deployment is automated via CircleCI on push to `main`:

1. **Dev**: Automatic deployment
2. **Test**: Automatic after dev succeeds
3. **Prod**: Manual approval required

Manual deployment (requires authentication):

```bash
# Deploy infrastructure
cd terraform
terraform init -backend-config=envs/dev.backend.tfvars
terraform apply -var-file=envs/dev.tfvars

# Deploy hosting
firebase deploy --only hosting --project fitglue-server-dev
```

## Project Structure

```
fitglue-web/
├── public/              # Static files
│   ├── index.html       # Landing page
│   └── styles.css       # Styles
├── terraform/           # Infrastructure as Code
│   ├── envs/            # Environment configs
│   ├── firebase.tf      # Firebase resources
│   ├── iam.tf           # IAM configuration
│   └── *.tf             # Other Terraform files
├── .circleci/           # CI/CD pipeline
├── firebase.json        # Firebase Hosting config
└── package.json         # Node.js dependencies
```

## Environment Configuration

The web repo uses the same GCP projects as the server:

- `fitglue-server-dev`
- `fitglue-server-test`
- `fitglue-server-prod`

Each environment has separate Terraform state stored in GCS with the prefix `web/terraform/state`.

## Contributing

This is a personal project, but suggestions and feedback are welcome via issues.

## License

MIT

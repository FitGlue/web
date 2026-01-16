# Deployment Guide

This document explains how to deploy the FitGlue web frontend to the three environments (dev, test, prod).

## Prerequisites

Before deploying, ensure:
1. The `circleci-web-deployer` service account exists in all environments (run `scripts/setup_web_deployer.sh` for each environment)
2. Firebase is initialized for the project
3. CircleCI is configured with OIDC authentication

## Automated Deployment (CircleCI)

Deployments are automated via CircleCI:

### Dev Environment
- **Trigger**: Push to `main` branch
- **Automatic**: Yes
- **Steps**:
  1. Lint HTML and CSS
  2. Authenticate via OIDC
  3. Deploy to Firebase Hosting

### Test Environment
- **Trigger**: After dev deployment succeeds
- **Automatic**: Yes
- **Steps**: Same as dev

### Prod Environment
- **Trigger**: Manual approval after test deployment
- **Automatic**: No (requires approval)
- **Steps**: Same as dev

## Manual Deployment

For manual deployments or local testing:

### Local Preview

```bash
# Install dependencies
npm install

# Serve locally
npm run serve
# Visit http://localhost:5000
```

### Deploy to Specific Environment

```bash
# Authenticate with GCP
gcloud auth application-default login

# Deploy to dev
firebase deploy --only hosting --project fitglue-server-dev

# Deploy to test
firebase deploy --only hosting --project fitglue-server-test

# Deploy to prod
firebase deploy --only hosting --project fitglue-server-prod
```

## Deployment Architecture

```
┌─────────────┐
│   GitHub    │
│  (main)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CircleCI   │
│ Build & Test│
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Terraform   │  │  Firebase   │
│  (IAM/APIs) │  │   Hosting   │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   GCP CDN   │
                 │ (fitglue.   │
                 │  tech)      │
                 └─────────────┘
```

## Troubleshooting

### Permission Denied Errors

If you see `Permission 'iam.serviceAccounts.getAccessToken' denied`:
1. Verify the workload identity pool binding uses wildcard pattern (`/*`)
2. Check that both `workloadIdentityUser` and `serviceAccountTokenCreator` roles are granted
3. Run `scripts/setup_web_deployer.sh <env>` to fix permissions

### Firebase Not Initialized

If Firebase commands fail:
```bash
firebase init hosting --project fitglue-server-dev
```

### Terraform Errors

The Terraform configuration is minimal - it only documents what the bootstrap script creates. If you see Terraform trying to create resources that already exist, ensure you've run the bootstrap script first.

## Rollback

To rollback a deployment:

```bash
# List previous releases
firebase hosting:channel:list --project fitglue-server-<env>

# Rollback to previous version
firebase hosting:clone <source-site-id>:<source-channel-id> <dest-site-id>:<dest-channel-id>
```

## Monitoring

- **Hosting Metrics**: Firebase Console → Hosting → Usage
- **CDN Performance**: GCP Console → Network Services → Cloud CDN
- **Deployment History**: CircleCI → Pipelines

#!/bin/bash
set -e

# GCP OIDC Setup for CircleCI Web Deployer
# This script configures the web-specific service account and binds it to the existing
# Workload Identity Pool created by the server repo.
#
# Usage: ./scripts/setup_web_deployer.sh <environment>
# Example: ./scripts/setup_web_deployer.sh dev

# Validate environment argument
ENV=${1:-dev}
if [[ ! "$ENV" =~ ^(dev|test|prod)$ ]]; then
  echo "❌ Error: Invalid environment '$ENV'"
  echo "Usage: $0 <dev|test|prod>"
  exit 1
fi

PROJECT_ID="fitglue-server-${ENV}"
CIRCLECI_ORG_ID="b2fc92f7-4f8d-4676-95b1-94d7f15c0a8e"
POOL_NAME="circleci-pool"
SA_NAME="circleci-web-deployer"

echo "🔧 Setting up Web Deployer for CircleCI -> GCP authentication"
echo "Environment: $ENV"
echo "Project: $PROJECT_ID"
echo ""

# Get project number dynamically
echo "📊 Fetching project number..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
if [ -z "$PROJECT_NUMBER" ]; then
  echo "❌ Error: Could not fetch project number for $PROJECT_ID"
  echo "Make sure the project exists and you have access to it."
  exit 1
fi
echo "Project Number: $PROJECT_NUMBER"
echo ""

# Verify the workload identity pool exists (created by server repo)
echo "🔍 Verifying Workload Identity Pool exists..."
if ! gcloud iam workload-identity-pools describe "$POOL_NAME" \
  --project="$PROJECT_ID" \
  --location="global" &>/dev/null; then
  echo "❌ Error: Workload Identity Pool '$POOL_NAME' does not exist"
  echo "Please run the server repo's setup_oidc.sh script first to create the pool."
  exit 1
fi
echo "✓ Workload Identity Pool exists"
echo ""

# Enable required APIs for web deployment
echo "🔌 Enabling required APIs..."
gcloud services enable \
  firebasehosting.googleapis.com \
  firebase.googleapis.com \
  storage.googleapis.com \
  iamcredentials.googleapis.com \
  --project="$PROJECT_ID"
echo "APIs enabled"
echo ""

# Create Service Account
echo "👤 Creating Web Deployer Service Account..."
gcloud iam service-accounts create "$SA_NAME" \
  --project="$PROJECT_ID" \
  --display-name="CircleCI Web Deployer" \
  --description="Service account for CircleCI web frontend deployments" || echo "Service account already exists, continuing..."

# Grant Firebase Hosting Admin role
echo "🔐 Granting Firebase Hosting permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebasehosting.admin" \
  --condition=None

# Grant Storage Object Admin (for hosting files)
echo "🔐 Granting Storage permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin" \
  --condition=None

echo "Permissions granted"

# Allow CircleCI to impersonate the Web Deployer Service Account
# Note: Uses the same attribute filter as the server deployer (CircleCI org ID)
# The separation between server and web deployments is handled by using different
# service accounts with different permissions, not by OIDC token attributes.
echo "🎭 Configuring Workload Identity binding..."
gcloud iam service-accounts add-iam-policy-binding \
  "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.project_id/$CIRCLECI_ORG_ID"

echo ""
echo "✅ Web Deployer Setup Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "  Workload Identity Pool: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME (shared with server)"
echo "  Service Account: $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "  Permissions: Firebase Hosting Admin, Storage Object Admin"
echo ""
echo "🔄 Next steps:"
echo "  1. Repeat for other environments: ./scripts/setup_web_deployer.sh test"
echo "  2. Repeat for other environments: ./scripts/setup_web_deployer.sh prod"
echo "  3. Push code to GitHub and configure CircleCI"
echo "  4. CircleCI will automatically authenticate using OIDC tokens"


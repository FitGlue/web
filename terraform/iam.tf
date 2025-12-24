# Service account for CircleCI web deployments
resource "google_service_account" "circleci_web_deployer" {
  account_id   = "circleci-web-deployer"
  display_name = "CircleCI Web Deployer"
  description  = "Service account for deploying web frontend via CircleCI"
}

# Grant Firebase Hosting Admin role
resource "google_project_iam_member" "circleci_firebase_admin" {
  project = var.project_id
  role    = "roles/firebasehosting.admin"
  member  = "serviceAccount:${google_service_account.circleci_web_deployer.email}"
}

# Grant Storage Object Admin for hosting files
resource "google_project_iam_member" "circleci_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.circleci_web_deployer.email}"
}

# Workload Identity Pool binding for CircleCI OIDC
# Note: This uses the existing workload identity pool created by the server repo
data "google_iam_workload_identity_pool" "circleci_pool" {
  workload_identity_pool_id = "circleci-pool"
}

data "google_iam_workload_identity_pool_provider" "circleci_provider" {
  workload_identity_pool_id          = data.google_iam_workload_identity_pool.circleci_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "circleci-provider"
}

# Allow the CircleCI OIDC tokens to impersonate the web deployer service account
# Note: Uses the same attribute filter as the server deployer (CircleCI org ID)
# Both server and web repos can use the same workload identity pool
resource "google_service_account_iam_member" "circleci_web_workload_identity" {
  service_account_id = google_service_account.circleci_web_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${data.google_iam_workload_identity_pool.circleci_pool.name}/attribute.project_id/b2fc92f7-4f8d-4676-95b1-94d7f15c0a8e"
}

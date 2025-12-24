# Firebase Hosting site
# Note: This creates the hosting site. The actual content deployment is handled by Firebase CLI.
resource "google_firebase_hosting_site" "default" {
  project = var.project_id
  site_id = var.project_id
}

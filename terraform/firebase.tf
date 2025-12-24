# Note: Firebase Hosting site is managed via firebase.json and Firebase CLI
# Terraform will not create the hosting site, but can manage other Firebase resources if needed

# Enable required APIs
resource "google_project_service" "firebase_hosting" {
  project = var.project_id
  service = "firebasehosting.googleapis.com"

  disable_on_destroy = false
}

resource "google_project_service" "firebase" {
  project = var.project_id
  service = "firebase.googleapis.com"

  disable_on_destroy = false
}

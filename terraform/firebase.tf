# Initialize Firebase for the project
# Note: Firebase APIs must be enabled first (done by bootstrap script)
# This uses null_resource with local-exec as there's no native Terraform resource
resource "null_resource" "firebase_init" {
  provisioner "local-exec" {
    command = "gcloud alpha firebase projects:addfirebase ${var.project_id} || true"
  }

  # Trigger re-run if project changes
  triggers = {
    project_id = var.project_id
  }
}

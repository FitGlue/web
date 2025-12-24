terraform {
  backend "gcs" {
    # Bucket will be specified via backend config file during terraform init
    # Example: terraform init -backend-config=envs/dev.backend.tfvars
    prefix = "web/terraform/state"
  }
}

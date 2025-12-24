variable "project_id" {
  description = "The ID of the GCP project (shared with server repo)"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy to"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The deployment environment (dev, test, prod)"
  type        = string
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}
resource "aws_lambda_function_url" "alias_url" {
  function_name      = var.function_name
  qualifier          = var.alias_name     
  authorization_type = "NONE" 
}

output "alias_function_url" {
  value       = aws_lambda_function_url.alias_url.function_url
  description = "Public Function URL bound to the alias"
}


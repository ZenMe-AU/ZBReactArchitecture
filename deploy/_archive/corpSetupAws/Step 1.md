# Step 1: Sign Up and Secure the Root AWS Account

## Overview
This step establishes the foundation for a secure AWS environment for your enterprise. It combines best practices from the original README and recommendations for automation and enterprise standards.

## 1. Create the Shared Mailbox for the AWS Root Account
1. The enterprise standard shared mailbox name would be: `awsroot@zenme.com.au` for the AWS root account email address.
1. The shared mailbox must be provisioned in M365 via Terraform for consistency and auditability.
1. Only Global admin RBAC role has read and send access to the shared mailbox.
1. The AWS root user created with this mailbox will also serve as the break-glass (emergency access) user for the AWS environment.

## 2. Register the AWS Root Account
1. Access the [AWS Account Setup][awsAccountSetupLink] page and create the new account using the shared email address and the corporate bank bank card details from keyvault.
1. Use Powershell to:
    1. Create a strong, unique password.
    1. Store root credentials securely in Azure Key Vault.
    1. Enable email based Multi-Factor Authentication (MFA) for the root account.
    1. Store credentials in a password manager or Azure Key Vault.
1. Enable account recovery options (alternate contacts).
1. Use Terraform to:
    1. Create IAM users, groups, and roles.
    1. Set account password policies (`aws_iam_account_password_policy`).
    1. Configure alternate contacts (`aws_account_alternate_contact`).
    1. Enable security services (CloudTrail, GuardDuty, etc.).
1. Store Terraform state securely (e.g., S3 bucket with versioning and encryption).
1. Reference secrets from Azure Key Vault in Terraform workflows.

1. The root user must be reserved for break-glass (emergency) scenarios only and not used for daily operations.


## 4. Set Up AWS SSO with Entra ID (Azure AD)
1. Integrate AWS Single Sign-On (SSO) with Microsoft Entra ID (formerly Azure AD) for centralized identity and access management.
1. In AWS IAM Identity Center (formerly AWS SSO), choose Azure AD as the external identity provider.
1. Register AWS as an enterprise application in Entra ID.
1. Configure SAML federation between Entra ID and AWS.
1. Assign Entra ID users and groups to the AWS application for SSO access.
1. Automate SSO configuration where possible using Terraform and the AWS/AzureAD providers.
1. Reference: [AWS SSO with Azure AD](https://docs.aws.amazon.com/singlesignon/latest/userguide/azure-ad-idp.html)

## 5. Create Administrative IAM Roles
1. Use AWS SSO (IAM Identity Center) integrated with Entra ID for all administrative access.
1. Assign administrative roles to Entra ID groups, not individual IAM users.
1. Use Azure Privileged Identity Management (PIM) to provide just-in-time, approval-based access to AWS administrative roles via SSO.
1. Automate SSO group/role mapping and PIM configuration where possible using Terraform and Azure/AWS providers.



## 7. Checklist
1. [ ] Shared mailbox `awsroot@zenme.com.au` created via Terraform
1. [ ] AWS account registered with shared mailbox
1. [ ] Root credentials stored in Azure Key Vault
1. [ ] MFA enabled for root user
1. [ ] AWS SSO integrated with Entra ID
1. [ ] Administrative IAM user(s) created
1. [ ] Account password policy set
1. [ ] Alternate contacts configured
1. [ ] Security services enabled
1. [ ] Terraform state stored securely
1. [ ] AWS SSO integrated with Entra ID

## References
- [AWS Account Setup][awsAccountSetupLink]
- [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/general/overview)


[awsAccountSetupLink]: https://portal.aws.amazon.com/billing/signup
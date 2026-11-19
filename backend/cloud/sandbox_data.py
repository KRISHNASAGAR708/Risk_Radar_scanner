"""
IBM Cloud High-Fidelity Simulated Cloud Environment Dataset
Specifically constructed to match IBM Cloud API responses for:
- IBM Cloud Object Storage (COS)
- IBM Cloud VPC & Security Groups
- IBM Cloud IAM Policies & Service IDs
- IBM Cloud Activity Tracker Event Routes
"""

SIMULATED_ACCOUNT = {
    "account_id": "ibm-acct-849302-fintech",
    "account_name": "Risk Radar Enterprise Banking Lab",
    "region": "us-south",
    "resource_group": "rg-core-production-us-south"
}

# 1. IBM Cloud Object Storage Resources
SIMULATED_COS_BUCKETS = [
    {
        "name": "fintech-raw-analytics-data",
        "crn": "crn:v1:bluemix:public:cloud-object-storage:global:a/ibm-acct-849302-fintech:cos-instance-core:bucket:fintech-raw-analytics-data",
        "location_constraint": "us-south-smart",
        "storage_class": "smart",
        "creation_date": "2025-08-14T08:15:30Z",
        "public_access": True, # VIOLATION: Publicly accessible
        "acl": {
            "grants": [
                {"grantee": {"type": "Group", "uri": "http://acs.amazonaws.com/groups/global/AllUsers"}, "permission": "READ"}
            ]
        },
        "cors_rules": [
            {
                "allowed_origins": ["*"], # VIOLATION: Overly permissive CORS wildcard
                "allowed_methods": ["GET", "PUT", "POST", "DELETE"],
                "allowed_headers": ["*"]
            }
        ],
        "encryption": {
            "type": "SSE-IBM", # Not customer-managed Key Protect
            "key_protect_crn": None
        },
        "versioning": {
            "status": "Suspended" # VIOLATION: Missing versioning for data tampering protection
        },
        "activity_tracking": {
            "read_data_events": False, # VIOLATION: Object read auditing disabled
            "write_data_events": False
        }
    },
    {
        "name": "cust-pii-records-backup",
        "crn": "crn:v1:bluemix:public:cloud-object-storage:global:a/ibm-acct-849302-fintech:cos-instance-core:bucket:cust-pii-records-backup",
        "location_constraint": "us-south-standard",
        "storage_class": "standard",
        "creation_date": "2025-05-10T12:00:00Z",
        "public_access": False,
        "acl": {"grants": []},
        "cors_rules": [],
        "encryption": {
            "type": "SSE-IBM", # VIOLATION: Sensitive PII lacking Key Protect (SSE-KP) customer-managed keys
            "key_protect_crn": None
        },
        "versioning": {
            "status": "Disabled" # VIOLATION: No object versioning
        },
        "activity_tracking": {
            "read_data_events": False,
            "write_data_events": True
        }
    },
    {
        "name": "ibm-cos-compliance-audit-logs",
        "crn": "crn:v1:bluemix:public:cloud-object-storage:global:a/ibm-acct-849302-fintech:cos-instance-logs:bucket:ibm-cos-compliance-audit-logs",
        "location_constraint": "us-south-vault",
        "storage_class": "vault",
        "creation_date": "2025-01-01T00:00:00Z",
        "public_access": False,
        "acl": {"grants": []},
        "cors_rules": [],
        "encryption": {
            "type": "SSE-KP", # Compliant: Customer-managed key
            "key_protect_crn": "crn:v1:bluemix:public:kms:us-south:a/ibm-acct-849302-fintech:kp-instance-01:key:key-99824"
        },
        "versioning": {
            "status": "Enabled" # Compliant
        },
        "activity_tracking": {
            "read_data_events": True,
            "write_data_events": True
        }
    },
    {
        "name": "public-web-assets-static",
        "crn": "crn:v1:bluemix:public:cloud-object-storage:global:a/ibm-acct-849302-fintech:cos-instance-core:bucket:public-web-assets-static",
        "location_constraint": "us-south-standard",
        "storage_class": "standard",
        "creation_date": "2025-09-20T10:11:12Z",
        "public_access": True, # Public intended for static CDN
        "acl": {"grants": [{"grantee": {"type": "Group", "uri": "http://acs.amazonaws.com/groups/global/AllUsers"}, "permission": "READ"}]},
        "cors_rules": [{"allowed_origins": ["https://riskradar.enterprise.io"], "allowed_methods": ["GET"]}],
        "encryption": {"type": "SSE-IBM", "key_protect_crn": None},
        "versioning": {"status": "Enabled"},
        "activity_tracking": {"read_data_events": False, "write_data_events": True}
    }
]

# 2. IBM Cloud VPC & Security Groups Resources
SIMULATED_VPCS = [
    {
        "id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220",
        "name": "vpc-fintech-production",
        "crn": "crn:v1:bluemix:public:is:us-south:a/ibm-acct-849302-fintech:vpc:r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220",
        "status": "available",
        "classic_access": False,
        "default_network_acl": {"name": "nacl-prod-default", "id": "r006-nacl-default-01"},
        "subnets": [
            {"id": "0717-sub-public-dmz", "name": "subnet-dmz-zone-1", "ipv4_cidr_block": "10.240.0.0/24", "zone": "us-south-1"},
            {"id": "0727-sub-app-tier", "name": "subnet-app-zone-1", "ipv4_cidr_block": "10.240.1.0/24", "zone": "us-south-1"},
            {"id": "0737-sub-db-cluster", "name": "subnet-db-zone-1", "ipv4_cidr_block": "10.240.2.0/24", "zone": "us-south-1"}
        ]
    },
    {
        "id": "r006-29b1d33e-1ef0-466a-912c-3a812b100918",
        "name": "vpc-partner-integration-dev",
        "crn": "crn:v1:bluemix:public:is:us-south:a/ibm-acct-849302-fintech:vpc:r006-29b1d33e-1ef0-466a-912c-3a812b100918",
        "status": "available",
        "classic_access": True, # VIOLATION: Classic Access enabled in VPC introduces hybrid attack surface
        "default_network_acl": {"name": "nacl-dev-allow-all", "id": "r006-nacl-dev-open"},
        "subnets": [
            {"id": "0747-sub-dev-shared", "name": "subnet-dev-shared", "ipv4_cidr_block": "10.241.0.0/22", "zone": "us-south-2"}
        ]
    }
]

SIMULATED_SECURITY_GROUPS = [
    {
        "id": "r006-sg-dmz-external",
        "name": "sg-dmz-external-web",
        "vpc": {"id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220", "name": "vpc-fintech-production"},
        "rules": [
            {
                "id": "rule-01-http",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 80,
                "port_max": 80,
                "remote": {"cidr_block": "0.0.0.0/0"} # Acceptable for public web
            },
            {
                "id": "rule-02-https",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 443,
                "port_max": 443,
                "remote": {"cidr_block": "0.0.0.0/0"} # Acceptable for public web
            },
            {
                "id": "rule-03-ssh-exposed",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 22,
                "port_max": 22,
                "remote": {"cidr_block": "0.0.0.0/0"} # CRITICAL VIOLATION: SSH open to the whole Internet
            }
        ]
    },
    {
        "id": "r006-sg-bastion-mgmt",
        "name": "sg-bastion-management",
        "vpc": {"id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220", "name": "vpc-fintech-production"},
        "rules": [
            {
                "id": "rule-04-rdp-exposed",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 3389,
                "port_max": 3389,
                "remote": {"cidr_block": "0.0.0.0/0"} # CRITICAL VIOLATION: Windows RDP open to 0.0.0.0/0
            },
            {
                "id": "rule-05-custom-mgmt",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 8443,
                "port_max": 8443,
                "remote": {"cidr_block": "0.0.0.0/0"} # HIGH VIOLATION: Admin portal open to public
            }
        ]
    },
    {
        "id": "r006-sg-core-db",
        "name": "sg-core-db-cluster",
        "vpc": {"id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220", "name": "vpc-fintech-production"},
        "rules": [
            {
                "id": "rule-06-mysql-unrestricted",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 3306,
                "port_max": 3306,
                "remote": {"cidr_block": "0.0.0.0/0"} # CRITICAL VIOLATION: Database port exposed to internet
            },
            {
                "id": "rule-07-postgres-unrestricted",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 5432,
                "port_max": 5432,
                "remote": {"cidr_block": "0.0.0.0/0"} # CRITICAL VIOLATION: PostgreSQL port exposed to internet
            }
        ]
    },
    {
        "id": "r006-sg-default-vpc",
        "name": "default-vpc-prod-sg",
        "vpc": {"id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220", "name": "vpc-fintech-production"},
        "rules": [
            {
                "id": "rule-08-all-inbound-permissive",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "all",
                "port_min": None,
                "port_max": None,
                "remote": {"cidr_block": "0.0.0.0/0"} # CRITICAL VIOLATION: Default SG with ANY:ANY inbound
            }
        ]
    },
    {
        "id": "r006-sg-microservices-isolated",
        "name": "sg-microservices-secure",
        "vpc": {"id": "r006-88a7c14a-7bc9-4fa2-938b-6f81014e0220", "name": "vpc-fintech-production"},
        "rules": [
            {
                "id": "rule-09-internal-app",
                "direction": "inbound",
                "ip_version": "ipv4",
                "protocol": "tcp",
                "port_min": 8080,
                "port_max": 8080,
                "remote": {"cidr_block": "10.240.0.0/18"} # Compliant: Restricted to VPC internal CIDR
            }
        ]
    }
]

# 3. IBM Cloud IAM Resources
SIMULATED_IAM_POLICIES = [
    {
        "id": "pol-wildcard-admin-ext",
        "type": "access",
        "subject": {
            "attributes": [
                {"name": "iam_id", "value": "IBMid-66500984EXT"},
                {"name": "email", "value": "external-consultant@thirdparty-vendor.com"}
            ]
        },
        "roles": [{"role_id": "crn:v1:bluemix:public:iam::::role:Administrator"}],
        "resources": [
            {
                "attributes": [
                    {"name": "accountId", "value": "ibm-acct-849302-fintech"},
                    {"name": "serviceType", "value": "*"} # CRITICAL VIOLATION: Wildcard admin over ALL cloud services
                ]
            }
        ],
        "description": "Wildcard administrator access granted to external consultant"
    },
    {
        "id": "pol-service-id-broad-manager",
        "type": "access",
        "subject": {
            "attributes": [
                {"name": "iam_id", "value": "iam-ServiceId-8199210-deployer"},
                {"name": "name", "value": "service-cicd-pipeline-runner"}
            ]
        },
        "roles": [
            {"role_id": "crn:v1:bluemix:public:iam::::role:Manager"},
            {"role_id": "crn:v1:bluemix:public:iam::::role:Operator"}
        ],
        "resources": [
            {
                "attributes": [
                    {"name": "accountId", "value": "ibm-acct-849302-fintech"},
                    {"name": "resourceGroupId", "value": "*"} # HIGH VIOLATION: Excessive resource group scope
                ]
            }
        ],
        "description": "Service ID has Manager role with unconstrained resource group wildcards"
    },
    {
        "id": "pol-storage-auditor-least-privilege",
        "type": "access",
        "subject": {
            "attributes": [
                {"name": "iam_id", "value": "IBMid-1002934-audit"},
                {"name": "email", "value": "compliance-auditor@enterprise.io"}
            ]
        },
        "roles": [{"role_id": "crn:v1:bluemix:public:iam::::role:Reader"}],
        "resources": [
            {
                "attributes": [
                    {"name": "accountId", "value": "ibm-acct-849302-fintech"},
                    {"name": "serviceName", "value": "cloud-object-storage"}
                ]
            }
        ],
        "description": "Compliant: Read-only access scoped strictly to COS service"
    }
]

SIMULATED_IAM_ACCOUNT_SETTINGS = {
    "account_id": "ibm-acct-849302-fintech",
    "mfa": "NONE", # CRITICAL VIOLATION: Multi-Factor Authentication disabled at account root level
    "allowed_ip_addresses": [], # VIOLATION: No IP allowlist restriction for IAM Console access
    "api_keys": [
        {
            "id": "ApiKey-legacy-etl-01",
            "name": "legacy-etl-batch-key",
            "created_at": "2024-03-10T14:20:00Z", # HIGH VIOLATION: Over 600 days old, unrotated API Key
            "last_used_at": "2026-11-10T04:12:00Z",
            "locked": False
        },
        {
            "id": "ApiKey-app-runner-02",
            "name": "prod-app-runner-key",
            "created_at": "2026-10-01T09:00:00Z", # Compliant: rotated under 90 days
            "last_used_at": "2026-11-18T18:00:00Z",
            "locked": False
        }
    ]
}

# 4. IBM Cloud Activity Tracker Resources
SIMULATED_ACTIVITY_TRACKER = {
    "routes": [
        {
            "id": "route-eu-de-audit",
            "name": "atracker-route-frankfurt",
            "target": {"type": "cloud_object_storage", "bucket": "cos-eu-de-compliance-logs"},
            "region": "eu-de",
            "status": "active"
        }
    ],
    "targets": [
        {
            "id": "target-cos-eu",
            "name": "target-cos-archive",
            "type": "cloud_object_storage",
            "bucket_name": "cos-eu-de-compliance-logs",
            "endpoint": "s3.direct.eu-de.cloud-object-storage.appdomain.cloud"
        }
    ],
    "regions_monitored": ["eu-de"],
    "account_regions_active": ["us-south", "eu-de"],
    # CRITICAL VIOLATION: Region 'us-south' contains the entire fintech production VPC and COS,
    # but has NO Activity Tracker Route configured! Logs are dropped and not preserved in immutable storage.
    "monitoring_gap_regions": ["us-south"],
    "critical_event_alerts_configured": False # HIGH VIOLATION: No automated alerting on IAM privilege escalation
}

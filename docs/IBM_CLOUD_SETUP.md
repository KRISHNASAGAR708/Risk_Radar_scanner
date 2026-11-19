# IBM Cloud Integration & Live Setup Guide

## 1. Prerequisites
- An active [IBM Cloud Account](https://cloud.ibm.com).
- An IBM Cloud IAM API Key with read permissions to provisioned resources.

---

## 2. Generating an IBM Cloud API Key

1. Log in to the [IBM Cloud Console](https://cloud.ibm.com).
2. In the top navigation bar, click **Manage** ➔ **Access (IAM)**.
3. Select **API keys** in the left menu.
4. Click the blue **Create an IBM Cloud API key** button.
5. Provide a Name (e.g., `risk-radar-cspm-scanner`) and Description.
6. Click **Create**, then copy or download the generated API key.

---

## 3. Minimum IAM Permissions Required
Risk Radar follows the **Principle of Least Privilege (PoLP)** and requires strictly read-only entitlements:
- **Cloud Object Storage:** `Viewer` or `Reader`
- **VPC Infrastructure Services:** `Viewer` or `Reader`
- **IAM Identity Service:** `Viewer` / Policy reader
- **IBM Cloud Activity Tracker:** `Viewer` / Route reader

---

## 4. Connecting Risk Radar to Live IBM Cloud

1. Launch Risk Radar and open **Settings & Cloud Config** (`http://localhost:5000` ➔ Settings).
2. Enter your IBM Cloud API Key into the field.
3. Select your deployment region (e.g., `us-south`, `us-east`, `eu-de`).
4. Click **Authenticate & Connect Live Cloud**.
5. Risk Radar will exchange your API key for a bearer token via `https://iam.cloud.ibm.com/identity/token`, verify account connectivity, and display a glowing green `LIVE IBM CLOUD` status badge!

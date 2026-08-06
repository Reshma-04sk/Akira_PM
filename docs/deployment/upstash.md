# Configuring Upstash Redis

Akira-PM uses Redis for dashboard query caching and rate limiting. In production environments, we leverage Upstash for a serverless, highly-available Redis connection.

## Setup Steps

### 1. Provision Redis Database
- Log in to Upstash Console ([console.upstash.com](https://console.upstash.com)).
- Click **Create Database**.
- Configure:
  - **Name**: `akira-pm-cache`
  - **Region**: Choose a region closest to your Render API deployment (e.g. AWS us-east-1).

### 2. Connection String
Retrieve the connection URL from the Upstash console:
- Locate the **Redis Connect** options.
- Choose **ioredis** or **redis-py** string format.
- Ensure the protocol is secure TLS `rediss://` (port 6379).
- Format: `rediss://default:[token]@[endpoint].upstash.io:6379`

### 3. Verification Parameters
Akira-PM integrates connection pool constraints to verify connection health and handle fallbacks:
- **Max Connections**: `20`
- **Socket Connection Timeout**: `2.0 seconds`
- **Socket Timeout**: `5.0 seconds`
- **Health Check Interval**: `30 seconds`
- **Graceful Fallback**: If Upstash goes down or hits connection throttling, the cache layer logs a warning and routes queries directly to the DB without breaking the API pipeline.

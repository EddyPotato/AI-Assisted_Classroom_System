# MQTT Mosquitto Broker - Installation & Setup Guide

**Critical Component:** Real-time message broker for campus edge node ↔ backend communication  
**Status:** ⚠️ MUST be installed before starting the system  
**Default Port:** 1883 (localhost:1883)

---

## Table of Contents

1. [Overview](#overview)
2. [Installation by OS](#installation-by-os)
3. [Configuration](#configuration)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)

---

## Overview

MQTT (Message Queuing Telemetry Transport) is a lightweight publish/subscribe messaging protocol. The campus edge node (Python camera system) uses MQTT to send real-time barcode scans and face verification events to the ASP.NET Core backend.

### Why MQTT?
- ✅ Lightweight protocol (ideal for edge devices)
- ✅ Publish/Subscribe pattern (loose coupling)
- ✅ Real-time event streaming (low latency)
- ✅ Single connection handles multiple topics
- ✅ Mosquitto broker is free, open-source, cross-platform

### Communication Flow
```
Campus Edge Node (Python)
  ↓ MQTT Publish
  campus/door/scan (barcode data)
  campus/door/verified (face match result)
  ↓
Mosquitto Broker (localhost:1883)
  ↓
Backend (ASP.NET Core MqttListenerService)
  ↓ SignalR Broadcast
Browser (Real-time updates)
```

---

## Installation by OS

### Windows

#### Option 1: Chocolatey (Recommended - Easiest)

**Prerequisite:** Chocolatey installed (https://chocolatey.org/install)

```powershell
# Run PowerShell as Administrator

choco install mosquitto
```

**Result:** Mosquitto installed as Windows Service, auto-starts on boot

#### Option 2: MSI Installer (Manual)

1. Download from: https://mosquitto.org/download/
2. Select Windows installer (mosquitto-2.x.x-install-windows-x64.exe)
3. Run installer with default settings
4. Mosquitto runs as Windows Service automatically

#### Option 3: Portable Zip (No Installation)

1. Download portable zip from https://mosquitto.org/download/
2. Extract to folder (e.g., `C:\mosquitto\`)
3. Run manually:
```powershell
cd C:\mosquitto
mosquitto.exe -p 1883
```

**Verification (Windows):**
```powershell
# Check if installed
mosquitto --version
# Output: mosquitto version 2.0.15

# Check if running as service
Get-Service mosquitto
# Status should be "Running"

# Manual start/stop
Start-Service mosquitto
Stop-Service mosquitto
```

**Test Connection (Windows):**
```powershell
# In PowerShell, test MQTT broker
$ErrorActionPreference = "Stop"
$tcpConnection = New-Object System.Net.Sockets.TcpClient
try {
    $tcpConnection.Connect("localhost", 1883)
    Write-Host "✓ MQTT broker is listening on port 1883"
} catch {
    Write-Host "✗ Cannot connect to MQTT broker"
}
```

---

### Linux (Ubuntu/Debian)

**Installation:**
```bash
sudo apt-get update
sudo apt-get install -y mosquitto mosquitto-clients

# Verify installation
mosquitto --version
# Output: mosquitto version 2.0.15
```

**Enable Auto-Start:**
```bash
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
sudo systemctl status mosquitto
# Should show: active (running)
```

**Configuration (Optional):**
```bash
# View configuration
sudo nano /etc/mosquitto/mosquitto.conf

# Default settings should work. Key lines:
# port 1883
# allow_anonymous true
# persistence false

# After any changes:
sudo systemctl restart mosquitto
```

**Test Connection (Linux):**
```bash
# Install client (if not already)
sudo apt-get install -y mosquitto-clients

# Test subscription
mosquitto_sub -h localhost -p 1883 -t "campus/door/scan" &
PID=$!

# In another terminal, publish test message
mosquitto_pub -h localhost -p 1883 -t "campus/door/scan" -m '{"barcode":"TEST123"}'

# Should see message in first terminal
kill $PID
```

---

### macOS

**Installation via Homebrew (Recommended):**

```bash
# Update Homebrew
brew update

# Install Mosquitto
brew install mosquitto

# Verify installation
mosquitto --version
```

**Start Mosquitto:**

```bash
# Option 1: Run in foreground (for testing)
mosquitto -p 1883
# Output: 1683350400: mosquitto version 2.0.15 starting

# Option 2: Run as background service
brew services start mosquitto

# Check if running
brew services list | grep mosquitto
# mosquitto started /usr/local/opt/mosquitto/...
```

**Configuration (Optional):**
```bash
# View/edit config
nano /usr/local/etc/mosquitto/mosquitto.conf

# Common settings:
# listener 1883
# allow_anonymous true
# persistence false

# After changes:
brew services restart mosquitto
```

**Test Connection (macOS):**
```bash
# Test subscription
mosquitto_sub -h localhost -p 1883 -t "campus/door/#" &
SUB_PID=$!

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "campus/door/scan" -m '{"barcode":"TEST"}'

# Should see: {"barcode":"TEST"}
kill $SUB_PID
```

---

## Configuration

### Basic Configuration (All Platforms)

**Default Mosquitto Config is sufficient for development:**

```
port 1883
protocol mqtt
allow_anonymous true
persistence false
```

### Custom Configuration (Optional)

**Windows:**
```
File: C:\Program Files\mosquitto\mosquitto.conf
```

**Linux:**
```
File: /etc/mosquitto/mosquitto.conf
```

**macOS:**
```
File: /usr/local/etc/mosquitto/mosquitto.conf
```

### Example Custom Config

```
# Default listener
listener 1883
protocol mqtt

# Allow anonymous connections (OK for development)
allow_anonymous true

# Enable persistence (optional)
persistence true
persistence_location /var/lib/mosquitto/

# Set log level (0=nothing, 1=errors, 2=warnings, 3=info, 4=debug)
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
log_timestamp true
loglevel 3

# Set max connections (-1 = unlimited)
max_connections -1

# Set max queued messages
max_queued_messages 1000
```

**After editing config, restart:**

Windows:
```powershell
Restart-Service mosquitto
```

Linux:
```bash
sudo systemctl restart mosquitto
```

macOS:
```bash
brew services restart mosquitto
```

---

## Verification & Testing

### 1. Check Installation

```bash
# All platforms
mosquitto --version
# Should output: mosquitto version 2.0.x
```

### 2. Verify Broker is Running

```bash
# Windows (PowerShell as Admin)
Get-Service mosquitto | Select-Object Status

# Linux
sudo systemctl status mosquitto

# macOS
brew services list | grep mosquitto
```

### 3. Test Port Availability

```powershell
# Windows - Check if port 1883 is listening
netstat -ano | findstr :1883
# Should show: TCP  0.0.0.0:1883  0.0.0.0:0  LISTENING

# Linux
sudo lsof -i :1883
# Should show: mosquitto process listening on port 1883

# macOS
lsof -i :1883
```

### 4. Test MQTT Connection (Easy)

```bash
# Terminal 1: Subscribe to all campus topics
mosquitto_sub -h localhost -p 1883 -t "campus/#" -v
# Output: Connected successfully, waiting for messages

# Terminal 2: Publish test message
mosquitto_pub -h localhost -p 1883 -t "campus/door/scan" -m '{"barcode":"12345"}'

# Terminal 1 should receive:
# campus/door/scan {"barcode":"12345"}
```

### 5. Test MQTT Connection (With Python)

```python
import paho.mqtt.client as mqtt
import json

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✓ Connected to MQTT broker")
    else:
        print(f"✗ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"Received: {msg.topic} = {msg.payload.decode()}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
client.connect("localhost", 1883, 60)
client.subscribe("campus/door/#")

# Run for 10 seconds
import time
client.loop_start()
time.sleep(10)
client.loop_stop()
```

**Save as `test_mqtt.py` and run:**
```bash
python test_mqtt.py
# Should see: ✓ Connected to MQTT broker
```

### 6. Test Backend Integration

**After Mosquitto + Backend are running:**

```bash
# Terminal 1: Watch backend logs for MQTT messages
# (Start backend with: dotnet run)

# Terminal 2: Publish test barcode event
mosquitto_pub -h localhost -p 1883 -t "campus/door/scan" -m '{"barcode":"STU123456","location":"CAM-001"}'

# Terminal 1 (Backend) should log:
# [MQTT] Received message on campus/door/scan
# Or similar depending on MqttListenerService logging
```

---

## Troubleshooting

### Problem 1: "Cannot connect to MQTT broker"

**Symptoms:**
- Edge node fails to publish
- Backend MqttListenerService shows connection errors
- Error: "Connection refused on localhost:1883"

**Solutions:**

```bash
# 1. Verify Mosquitto is running
mosquitto --version

# 2. Check if port 1883 is in use
# Windows
netstat -ano | findstr :1883

# Linux
sudo lsof -i :1883

# 3. If port is in use by different service:
# Windows - Kill process on port 1883
netstat -ano | findstr :1883
# Find PID, then:
taskkill /PID <PID> /F

# Linux
sudo kill $(lsof -t -i :1883)

# 4. Restart Mosquitto
# Windows
Restart-Service mosquitto

# Linux
sudo systemctl restart mosquitto

# macOS
brew services restart mosquitto

# 5. Start Mosquitto in foreground to see errors
mosquitto -p 1883 -v
# Should show: 1683350400: mosquitto version 2.0.x starting
```

### Problem 2: Mosquitto installed but not running

**Windows:**
```powershell
# Check service status
Get-Service mosquitto

# If stopped, start it
Start-Service mosquitto

# Enable auto-start on boot
Set-Service -Name mosquitto -StartupType Automatic
```

**Linux:**
```bash
# Check status
sudo systemctl status mosquitto

# If stopped, start it
sudo systemctl start mosquitto

# Enable auto-start
sudo systemctl enable mosquitto
```

**macOS:**
```bash
# Check status
brew services list

# If stopped, start it
brew services start mosquitto

# Will auto-start on next login
```

### Problem 3: "Address already in use" error

**Port 1883 conflict:**

```bash
# Option 1: Kill existing process
# Windows
netstat -ano | findstr :1883
taskkill /PID <PID> /F

# Option 2: Use different port (NOT recommended, requires code changes)
# Edit mosquitto.conf:
# listener 1884
# Then update config.py:
# MQTT_BROKER = "localhost"
# MQTT_PORT = 1884
```

### Problem 4: "Access denied" when starting Mosquitto

**Windows:**
```powershell
# Run PowerShell as Administrator
# Then:
Start-Service mosquitto
```

**Linux:**
```bash
# Use sudo
sudo systemctl start mosquitto

# Or: sudo mosquitto -p 1883
```

### Problem 5: Mosquitto can't bind to IPv6

**Solution:**
```bash
# Use IPv4-only
mosquitto -l 127.0.0.1
# Or edit mosquitto.conf:
# listener 1883 0.0.0.0
```

### Problem 6: Anonymous connections rejected

**Error:** Connection refused when allow_anonymous is false

**Solution:**
```bash
# Edit mosquitto.conf:
allow_anonymous true

# Or set username/password:
allow_anonymous false
password_file /etc/mosquitto/passwd

# Create password file:
mosquitto_passwd -c /etc/mosquitto/passwd username
# Then enter password

# Update backend config to use credentials
```

---

## System Integration

### Windows: Register as System Service

**Already done by installer** - Mosquitto runs automatically

To modify:
```powershell
# View service
Get-Service mosquitto

# Change startup type
Set-Service -Name mosquitto -StartupType Automatic   # Auto-start
Set-Service -Name mosquitto -StartupType Manual      # Manual start
```

### Linux: Auto-Start on Boot

```bash
sudo systemctl enable mosquitto
# Verify
sudo systemctl is-enabled mosquitto
# Output: enabled
```

### macOS: Auto-Start via Homebrew

```bash
brew services start mosquitto
# Verify
brew services list | grep mosquitto
# Should show: started
```

---

## Production Deployment Notes

### Security Considerations

**⚠️ Current Setup (Development):**
- Anonymous connections allowed
- No authentication required
- No encryption (plain TCP)

**For Production:**
```
1. Enable authentication
   mosquitto_passwd -c /etc/mosquitto/passwd <username>
   
2. Configure password in mosquitto.conf
   password_file /etc/mosquitto/passwd
   allow_anonymous false
   
3. Enable TLS encryption
   listener 8883
   protocol mqtt
   cafile /path/to/ca.crt
   certfile /path/to/server.crt
   keyfile /path/to/server.key
   
4. Update backend credentials (appsettings.json)
   {
     "MQTT": {
       "Host": "localhost",
       "Port": 8883,
       "Username": "username",
       "Password": "password",
       "UseTLS": true
     }
   }
```

### Performance Tuning

```
# For high-volume message publishing
max_connections 10000
max_queued_messages 10000
message_size_limit 1000000
retain_memory_limit 100000
```

---

## Quick Reference

| Task | Command |
|------|---------|
| **Windows:** Check if running | `Get-Service mosquitto` |
| **Windows:** Start | `Start-Service mosquitto` |
| **Windows:** Stop | `Stop-Service mosquitto` |
| **Linux:** Check if running | `sudo systemctl status mosquitto` |
| **Linux:** Start | `sudo systemctl start mosquitto` |
| **Linux:** Stop | `sudo systemctl stop mosquitto` |
| **macOS:** Check if running | `brew services list \| grep mosquitto` |
| **macOS:** Start | `brew services start mosquitto` |
| **macOS:** Stop | `brew services stop mosquitto` |
| **All:** Test connection | `mosquitto_sub -h localhost -p 1883 -t "#"` |
| **All:** Publish test | `mosquitto_pub -h localhost -p 1883 -t "test" -m "hello"` |
| **All:** Check version | `mosquitto --version` |
| **All:** Check port | `netstat -an \| grep 1883` (varies by OS) |

---

## Verification Checklist

Before starting the campus system, verify:

- [ ] Mosquitto installed: `mosquitto --version` works
- [ ] Mosquitto running: Service shows "Running" or `systemctl status` shows active
- [ ] Port 1883 available: `netstat -an | grep 1883` shows LISTENING
- [ ] Test connection works: `mosquitto_sub` connects successfully
- [ ] Test publish/subscribe: Can see published messages in subscriber
- [ ] Backend can connect: No connection errors in backend logs

---

**Last Updated:** May 11, 2026  
**For:** AI-Assisted Smart Campus & Classroom System  
**Critical Component Status:** ✅ Installation & setup documented

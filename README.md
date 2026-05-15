# AI-Assisted Smart Campus & Classroom System

**Complete, Production-Ready Multi-Role Campus Management Platform**

**Status:** ✅ May 14, 2026 - All systems functional and tested | Full dependency audit completed  
**Built With:** React 19.2.5 + Vite | ASP.NET Core 10 | Oracle | Python 3.10+ with OpenCV | MQTT Mosquitto  
**Team:** EddyPotato & Contributors  
**Documentation:** See [CONTEXT.md](CONTEXT.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Running the System](#running-the-system)
8. [API Endpoints](#api-endpoints)
9. [Feature Guides](#feature-guides)
10. [Troubleshooting](#troubleshooting)
11. [Development](#development)
12. [Deployment](#deployment)

---

## Overview

A comprehensive intelligent campus management system integrating:

- **Role-Based Multi-Portal System** — Faculty, Guard, Registrar, Principal, SystemAdmin with dedicated workflows
- **Smart Access Control** — Real-time barcode scanning & face recognition with MQTT/SignalR real-time updates
- **Registrar Management** — Complete section, roster, schedule, and enrollment management with bulk import
- **Attendance Tracking** — Faculty class attendance & Guard Portal access logging with face confidence scoring
- **Scalable Architecture** — Repository pattern, SignalR WebSockets, Oracle persistence, Python edge processing

**Key Value Propositions:**
- ✅ Hands-on, practical code patterns (Repository, DI, error handling)
- ✅ Real-world full-stack workflow (frontend → backend → database → edge node)
- ✅ Modern tech stack (React + .NET Core + Oracle)
- ✅ Production-ready security (BCrypt passwords, CORS, authentication)
- ✅ Comprehensive documentation for vibe coding

---

## Features

### Faculty Portal ✅
- Dashboard with class overview
- Student roster management
- Attendance tracking interface
- Schedule view by class

### Guard Portal ✅
- Real-time camera stream (MJPEG)
- Barcode/QR code scanning
- Face verification with confidence scoring
- Manual ID entry fallback
- Access history with timestamp & bypass reason
- 6-second two-phase verification (barcode + face)

### Registrar Portal ✅
- **Section Management:** Create, read, update, delete sections
- **Section Roster:** View/manage enrolled students per section
- **Schedule Management:** CRUD operations on class schedules
- **Bulk Schedule Import:** CSV/Excel upload with preview & validation
- **Student/Staff Directories:** Searchable records with contact info
- **Enrollment Management:** Bulk add/remove students from sections
- **Resources:** Subject and course directory

### Principal Portal 🔶
- Dashboard structure in place
- Workflows to be implemented

### SystemAdmin Portal 🔶
- System configuration structure in place
- Admin tools TBD

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2.5 | UI framework |
| Vite | 8.0.9 | Dev server & bundler |
| React Router | 7.14.2 | SPA routing |
| Tailwind CSS | 4.2.4 | Styling |
| @microsoft/signalr | 10.0.0 | Real-time WebSocket client |
| Lucide React | 1.8.0 | Icon library |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| .NET | 10.0 | Web framework |
| Oracle.ManagedDataAccess | 23.26.200 | Database driver |
| BCrypt.Net-Next | 4.1.0 | Password hashing |
| MQTTnet | 4.3.7.1207 | MQTT client for edge node events |
| SignalR | Built-in | Real-time communication |

### Database
| Tool | Version | Purpose |
|------|---------|---------|
| Oracle Database | 21c XE | Persistence (XEPDB1 instance) |

### Edge Node (Python)
| Library | Version | Purpose |
|---------|---------|---------|
| OpenCV | 4.9.0+ | Video capture & frame processing |
| face_recognition | 1.3.0+ | Face detection & encoding |
| pyzbar | 0.1.9+ | Barcode/QR code scanning |
| Flask | 3.0.3+ | Web server for MJPEG stream |
| paho-mqtt | 1.6.1+ | MQTT client for publishing events |

---

## Project Structure

```
AI-Assisted_Classroom_System/
├── README.md                                 # This file
├── CONTEXT.md                                # Comprehensive technical reference (for vibe coding)

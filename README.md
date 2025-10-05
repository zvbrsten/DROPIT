# DropIt – Seamless Cross-Device File Transfer

**DropIt** is a secure, cross-device file-sharing platform built using the **MERN stack** and **AWS S3**, allowing users to upload and retrieve files (≤50MB) using **6-digit codes** or **QR codes** — all without logging in.

---
Live Demo : https://dropit-sepia.vercel.app


## Features

- **Secure AWS S3 File Storage**
- **6-Digit Code & QR Code Access**
- **Auto-Expiring, One-Time Download Links**
- **Real-Time Upload Progress Bar**
- **No Login Required – Instant Sharing**

---

## Performance Metrics

- **Upload Time**: ~2–5 seconds for files ≤50MB  
- **Concurrent Uploads Supported**: ~100+ per day  
- **Link Expiry**: Pre-signed URL expires after **first download or 5 minutes**  
- **Download Time**: Instant, via signed AWS S3 URL  
- **File Size Limit**: 50MB  

---

## Privacy & Security

- **Pre-Signed S3 URLs**: Prevents unauthorized access after expiration or first download.
- **No Persistent User Data**: No login, no cookies, no user profiles.
- **Temporary File Storage**: Files are automatically deleted after expiry or first download.
- **Backend Enforced Expiry**: Download attempts after expiration return HTTP 410 Gone.

> Your files are never stored permanently. Each transfer is isolated, and access is strictly time-bound.

---

## Tech Stack

| Frontend       | Backend         | Storage   | Other Tools         |
|----------------|------------------|------------|----------------------|
| React.js       | Node.js          | AWS S3     | Vercel (Hosting)     |
| Tailwind CSS   | Express.js       |            | QRCode Generation    |
| Axios          | MongoDB + Mongoose |         | dotenv, multer       |

---

## How It Works

### Upload Flow

1. User selects a file (≤50MB).
2. Backend:
   - Uploads to S3 with a unique filename.
   - Generates a **6-digit code**.
   - Creates a **pre-signed download URL** (expires on use or timeout).
   - Generates a **QR code** pointing to frontend download page.
3. Response: `code`, `downloadURL`, and `qrCode`.

### Download Flow

1. User enters the 6-digit code or scans the QR.
2. Backend:
   - Validates code and expiry.
   - Returns a signed S3 download URL.
   - Marks file as downloaded and deletes the record later.

---

## Project Structure

    dropit/
    ├── client/                      # React Frontend
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── components/          # UploadForm.js, DownloadForm.js, etc.
    │   │   ├── App.js
    │   │   ├── index.js
    │   │   └── styles.css           
    │   └── package.json
    │
    ├── server/                      # Express Backend
    │   ├── controllers/
    │   │   └── fileController.js    # Handles upload/download logic
    │   ├── models/
    │   │   └── File.js              # Mongoose model for file metadata
    │   ├── routes/
    │   │   └── fileRoutes.js        # Upload/download API endpoints
    │   ├── utils/
    │   │   ├── generateCode.js      # 6-digit random code generator
    │   │   └── s3Client.js          # AWS S3 client config
    │   ├── .env                     # AWS keys, Mongo URI, expiry config
    │   ├── index.js                 # Entry point of backend server
    │   └── package.json
    │
    ├── README.md                    # Project documentation
    └── .gitignore



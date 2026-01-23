# Document Sharing Module Documentation

## Overview
The Sharing module allows patients to securely share their medical reports and personal documents with external parties (family, other doctors) via generated links.

---

## 1. Core Concepts

### **Shareable Links**
- Users generate a unique, time-limited link for a specific file.
- The link does not require the recipient to log in.
- Access can be revoked by the owner at any time.

---

## 2. Database Schema (PostgreSQL)

### **`SharedLink` (SQLAlchemy)**
Table: `shared_links`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Primary key (UUID). |
| `token` | `String` | Unique access token (url-safe string). |
| `user_id` | `String` | Owner (Patient). |
| `resource_type` | `String` | `report` or `document`. |
| `resource_id` | `String` | ID of the file being shared. |
| `expires_at` | `DateTime` | When the link expires. |
| `is_active` | `Boolean` | Manual revocation flag. |
| `created_at` | `DateTime` | Creation timestamp. |
| `views` | `Integer` | Track number of times accessed. |

---

## 3. API Endpoints

### **Generate Share Link**
Create a new shareable link.

- **Endpoint**: `POST /share/create`
- **Auth**: Required (Owner)
- **Request**:
```json
{
  "resource_type": "report" | "document",
  "resource_id": "uuid",
  "expires_in_hours": 72  // Default 24, Max 168 (7 days)
}
```
- **Response**:
```json
{
  "share_link": "https://app-url.com/s/xyz_token_123",
  "token": "xyz_token_123",
  "expires_at": "2026-01-25T10:00:00Z"
}
```

### **Access Share Link (Public)**
Serve the file associated with the token.

- **Endpoint**: `GET /share/access/{token}`
- **Auth**: Public
- **Behavior**:
  1. Verify token exists, is active, and not expired.
  2. Increment view count.
  3. Generate temporary Supabase download URL (e.g. 5 min expiry).
  4. Redirect user to the Supabase URL OR stream the file content.

### **Manage Shared Links**
List active links to revoke them.

- **Endpoint**: `GET /share/manage`
- **Auth**: Required
- **Response**:
```json
{
  "links": [
    {
      "id": "...",
      "resource_name": "Lab Report.pdf",
      "views": 5,
      "expires_at": "...",
      "is_active": true
    }
  ]
}
```

### **Revoke Link**
- **Endpoint**: `DELETE /share/{id}`
- **Auth**: Required

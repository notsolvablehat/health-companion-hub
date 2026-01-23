# Personal Documents Module Documentation

## Overview
The Personal Documents module allows patients to store and manage non-medical documents such as Insurance Cards, ID Proofs, Hospital Bills, and Referrals. These documents are stored securely but are NOT processed by the medical AI analysis pipeline.

---

## 1. Core Concepts

### **Categories**
- **Insurance**: Health insurance cards, policy documents.
- **Identity**: Govt IDs (Aadhar, PAN, Driver's License).
- **Bills**: Hospital invoices, payment receipts.
- **Prescriptions**: Manual uploads of physical prescriptions (not digitally generated).
- **Other**: General documents.

### **Storage**
- Stored in a separate folder/bucket in Supabase Storage: `personal-documents/{user_id}/`.
- No AI extraction is performed.

---

## 2. Database Schema (PostgreSQL)

### **`PersonalDocument` (SQLAlchemy)**
Table: `personal_documents`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Primary key (UUID). |
| `user_id` | `String` | Foreign key to `users.id` (Owner). |
| `file_name` | `String` | Original filename. |
| `file_type` | `String` | `pdf` or `image`. |
| `category` | `String` | Enum: `insurance`, `identity`, `bill`, `prescription`, `other`. |
| `storage_path` | `String` | Path in Supabase Storage. |
| `file_size_bytes` | `Integer` | File size. |
| `description` | `String` | Optional notes. |
| `created_at` | `DateTime` | Upload timestamp. |

---

## 3. API Endpoints

### **Get My Documents**
Fetch all personal documents for the authenticated user.

- **Endpoint**: `GET /documents`
- **Auth**: Required (Patient)
- **Response**:
```json
{
  "count": 5,
  "documents": [
    {
      "id": "doc-uuid-1",
      "file_name": "insurance_card.jpg",
      "category": "insurance",
      "created_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

### **Upload Document (Two-Step)**
Same pattern as Reports upload.

#### Step 1: Get Upload URL
- **Endpoint**: `POST /documents/upload-url`
- **Request**:
```json
{
  "filename": "insurance.jpg",
  "content_type": "image/jpeg",
  "category": "insurance",
  "description": "2026 Policy"
}
```
- **Response**:
```json
{
  "document_id": "doc-uuid-new",
  "upload_url": "https://supabase..."
}
```

#### Step 2: Confirm Upload
- **Endpoint**: `POST /documents/{id}/confirm`
- **Request**:
```json
{
  "storage_path": "...",
  "file_size_bytes": 102400
}
```

### **Delete Document**
- **Endpoint**: `DELETE /documents/{id}`
- **Auth**: Required (Owner)

### **Get Download URL**
- **Endpoint**: `GET /documents/{id}/download`
- **Response**: `{"download_url": "..."}`

---

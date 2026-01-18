# User Module - Backend Context & Frontend Integration

## Overview

The User module handles user profile management, onboarding, and profile updates for the Healthcare Platform. It supports both **Patient** and **Doctor** profiles with role-specific data structures. The module is protected and requires authentication via JWT tokens.

---

## Backend Implementation

### Endpoints

#### 1. **GET /users/me**
- **Purpose**: Get current authenticated user's basic information
- **Authentication**: Required (JWT token)
- **Status Code**: 200 OK

**Request**: None (uses JWT token from Authorization header)

**Response**:
```json
{
  "user_id": "uuid-string",
  "role": "patient",
  "is_onboarded": true,
  "email": "user@example.com",
  "username": "username123",
  "name": "John Doe"
}
```

**Business Logic**:
1. Extracts user_id from JWT token via `CurrentUser` dependency
2. Queries database for user by ID
3. Returns 404 if user not found
4. Returns basic user information (no sensitive profile data)

**Use Cases**:
- Verify current user's authentication status
- Get user ID for subsequent API calls
- Check onboarding status for navigation
- Display user's name and email in UI

---

#### 2. **GET /users/profile**
- **Purpose**: Get current user's complete profile (patient or doctor)
- **Authentication**: Required (JWT token)
- **Status Code**: 200 OK

**Request**: None (uses JWT token)

**Response for Patient**:
```json
{
  "name": "John Doe",
  "email": "patient@example.com",
  "role": "patient",
  "is_onboarded": true,
  "created_at": "2024-01-15",
  "patient_id": "uuid-string",
  "medical_info": {
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "phone_number": "+1234567890",
    "address": "123 Main St, City, State",
    "blood_group": "O+",
    "height_cm": 175.5,
    "weight_kg": 70.0,
    "allergies": ["Peanuts", "Penicillin"],
    "current_medications": ["Aspirin"],
    "medical_history": ["Appendectomy 2015"],
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+0987654321",
    "consent_hipaa": true
  }
}
```

**Response for Doctor**:
```json
{
  "name": "Dr. Smith",
  "email": "doctor@example.com",
  "role": "doctor",
  "is_onboarded": true,
  "created_at": "2024-01-10",
  "doctor_id": "uuid-string",
  "license": "MD12345",
  "specialisation": "Cardiology",
  "date_of_birth": "1980-03-20",
  "gender": "Female",
  "medical_info": null
}
```

**Business Logic**:
1. Extracts user_id from JWT token
2. Returns 400 if user_id is missing
3. Queries user from database
4. Checks user role (patient or doctor)
5. Returns patient_profile if role is "patient" (404 if profile doesn't exist)
6. Returns doctor_profile if role is "doctor" (404 if profile doesn't exist)
7. Returns 400 if user profile is corrupted

**Error Responses**:
- `400 Bad Request`: User is required / Profile corrupted
- `404 Not Found`: Patient/Doctor profile not found for this user

---

#### 3. **POST /users/onboard**
- **Purpose**: Complete patient onboarding (first-time setup)
- **Authentication**: Required (JWT token)
- **Status Code**: 200 OK
- **Role**: Patient only (doctors cannot be onboarded via this endpoint)

**Request Body**:
```json
{
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "phone_number": "+1234567890",
  "address": "123 Main St, City, State",
  "blood_group": "O+",
  "height_cm": 175.5,
  "weight_kg": 70.0,
  "allergies": ["Peanuts", "Penicillin"],
  "current_medications": ["Aspirin"],
  "medical_history": ["Appendectomy 2015"],
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+0987654321",
  "consent_hipaa": true
}
```

**Response**:
```json
{
  "user_id": "uuid-string",
  "role": "patient",
  "is_onboarded": true,
  "email": "user@example.com",
  "username": "username123",
  "name": "John Doe"
}
```

**Business Logic**:
1. Extracts user_id from JWT token
2. Returns 400 if user_id is missing
3. Gets user from database
4. Returns 400 if user role is "doctor" (doctors cannot be onboarded)
5. Returns 400 if user already has a patient_profile (already onboarded)
6. Creates new Patient record with all onboarding data
7. Sets `user.is_onboarded = True`
8. Commits to database and refreshes user
9. Returns updated user object

**Validation**:
- All required fields must be provided
- `consent_hipaa` must be `true`
- `height_cm` and `weight_kg` must be > 0 if provided
- `blood_group` must be one of: A+, A-, B+, B-, O+, O-, AB+, AB-
- `gender` must be one of: Male, Female, Other, Prefer not to say

**Error Responses**:
- `400 Bad Request`: User is required / Doctors cannot be onboarded / User already onboarded

---

#### 4. **POST /users/update-user**
- **Purpose**: Update user's profile information
- **Authentication**: Required (JWT token)
- **Status Code**: 200 OK

**Request Body**: Same as `/users/onboard` (PatientOnboarding model)

**Response**: Updated User object

**Business Logic**:
1. Extracts user_id from JWT token
2. Gets user from database
3. Updates ONLY allowed fields in patient_profile or doctor_profile
4. Allowed fields:
   - date_of_birth
   - gender
   - phone_number
   - address
   - blood_group
   - height_cm
   - weight_kg
   - allergies
   - current_medications
   - medical_history
   - emergency_contact_name
   - emergency_contact_phone
   - consent_hipaa
5. Commits changes to database
6. Returns updated user

**Note**: For doctors, if doctor_profile doesn't exist, returns 400 error

---

#### 5. **POST /users/update-user-name**
- **Purpose**: Update user's display name
- **Authentication**: Required (JWT token)
- **Status Code**: 200 OK

**Request Body** (Query Parameter):
```
name_of_user: string
```

**Response**: Updated User object

**Business Logic**:
1. Extracts user_id from JWT token
2. Gets user from database
3. Updates `user.name` field
4. Commits to database
5. Returns updated user

---

#### 6. **GET /users/patient-profile/{patient_email}**
- **Purpose**: Get patient profile by email (admin only)
- **Authentication**: Required (JWT token)
- **Authorization**: Admin role only
- **Status Code**: 200 OK

**Request**: 
- Path parameter: `patient_email` (EmailStr)

**Response**: PatientProfile object

**Business Logic**:
1. Extracts user_id from JWT token
2. Gets current user from database
3. Returns 403 Forbidden if user role is not "admin"
4. Queries database for user with given email
5. Returns 404 if patient not found
6. Returns 404 if patient has no profile
7. Returns patient's profile

**Error Responses**:
- `403 Forbidden`: You are not allowed to perform this operation
- `404 Not Found`: Patient not found / Patient has no profile

---

### Data Models

#### PatientOnboarding (Request)
```python
{
  # Demographics (Required)
  date_of_birth: date
  gender: "Male" | "Female" | "Other" | "Prefer not to say"
  phone_number: str
  address: str
  
  # Vitals (Optional)
  blood_group: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-" | null
  height_cm: float | null  # Must be > 0
  weight_kg: float | null  # Must be > 0
  
  # Medical Safety (Optional lists)
  allergies: list[str]  # Default: []
  current_medications: list[str]  # Default: []
  medical_history: list[str]  # Default: []
  
  # Emergency (Required)
  emergency_contact_name: str
  emergency_contact_phone: str
  
  # Legal (Required)
  consent_hipaa: bool  # Must be true
}
```

#### UserBase (Response Base)
```python
{
  name: str
  email: EmailStr
  role: "doctor" | "patient" | "admin"
  is_onboarded: bool
  created_at: date
}
```

#### PatientProfile (Response)
```python
{
  # Extends UserBase
  ...UserBase,
  
  patient_id: str
  medical_info: PatientOnboarding | null
  
  # Computed property
  age: int | null  # Calculated from date_of_birth
}
```

#### DoctorProfile (Response)
```python
{
  # Extends UserBase
  ...UserBase,
  
  doctor_id: str
  license: str
  specialisation: str
  date_of_birth: date | null
  gender: str | null
  medical_info: PatientOnboarding | null
  
  # Computed property
  age: int | null  # Calculated from date_of_birth
}
```

---

## Frontend Implementation Status

### ✅ To Be Implemented

#### 1. **Get Current User** (`/users/me`)

**Location**: `src/services/auth.ts` → `authService.getCurrentUser()`

**Current Implementation**:
```typescript
getCurrentUser: async (): Promise<User> => {
  const response = await api.get<any>('/users/me');
  return {
    id: response.data.user_id,
    email: response.data.email,
    role: response.data.role,
    is_onboarded: response.data.is_onboarded,
    created_at: new Date().toISOString(),
  };
}
```

**Status**: ✅ **Already Implemented Correctly**
- Maps `user_id` → `id`
- Includes all required fields
- Used by AuthContext for user state management

---

#### 2. **Get User Profile** (`/users/profile`)

**Location**: `src/services/auth.ts` → `authService.getProfile()`

**Current Implementation**:
```typescript
getProfile: async (): Promise<UserProfile> => {
  const response = await api.get<any>('/users/profile');
  return response.data;
}
```

**Status**: ✅ **Already Implemented**
- Returns raw profile data
- Used by AuthContext
- Handles both PatientProfile and DoctorProfile

**Type Definitions Needed**:
```typescript
// src/types/auth.ts

export interface PatientProfile {
  name: string;
  email: string;
  role: 'patient';
  is_onboarded: boolean;
  created_at: string;
  patient_id: string;
  medical_info: {
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    phone_number: string;
    address: string;
    blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
    height_cm?: number;
    weight_kg?: number;
    allergies: string[];
    current_medications: string[];
    medical_history: string[];
    emergency_contact_name: string;
    emergency_contact_phone: string;
    consent_hipaa: boolean;
  } | null;
}

export interface DoctorProfile {
  name: string;
  email: string;
  role: 'doctor';
  is_onboarded: boolean;
  created_at: string;
  doctor_id: string;
  license: string;
  specialisation: string;
  date_of_birth?: string;
  gender?: string;
  medical_info?: any;
}

export type UserProfile = PatientProfile | DoctorProfile;
```

---

#### 3. **Patient Onboarding** (`/users/onboard`)

**Location**: `src/services/auth.ts` → `authService.onboardPatient()`

**Current Implementation**:
```typescript
onboardPatient: async (data: OnboardPatientRequest): Promise<void> => {
  await api.post('/users/onboard', data);
}
```

**Status**: ✅ **Already Implemented**

**Request Type**:
```typescript
export interface OnboardPatientRequest {
  // Demographics
  date_of_birth: string;  // ISO date format
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone_number: string;
  address: string;
  
  // Vitals
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height_cm?: number;
  weight_kg?: number;
  
  // Medical
  allergies?: string[];
  current_medications?: string[];
  medical_history?: string[];
  
  // Emergency
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Legal
  consent_hipaa: boolean;
}
```

---

#### 4. **Doctor Onboarding** (`/users/onboard` - Not Used)

**Note**: Doctors are NOT onboarded via `/users/onboard`. They are created with profiles during registration or via a separate admin process.

**Current Implementation**:
```typescript
onboardDoctor: async (data: OnboardDoctorRequest): Promise<void> => {
  // This endpoint doesn't exist in backend
  // Doctors don't have an onboarding flow
  await api.post('/users/onboard-doctor', data);
}
```

**Status**: ⚠️ **NEEDS REVIEW**
- Backend doesn't support doctor onboarding via `/users/onboard`
- Backend returns 400 if doctor tries to use `/users/onboard`
- Frontend should either:
  1. Remove `onboardDoctor` function
  2. Create a different endpoint for doctor setup
  3. Mark doctors as onboarded by default

---

#### 5. **Update User Profile** (`/users/update-user`)

**Status**: ❌ **NOT IMPLEMENTED**

**Needs Implementation**:
```typescript
// src/services/user.ts (new file)

export const userService = {
  updateProfile: async (data: OnboardPatientRequest): Promise<User> => {
    const response = await api.post<any>('/users/update-user', data);
    return {
      id: response.data.user_id,
      email: response.data.email,
      role: response.data.role,
      is_onboarded: response.data.is_onboarded,
      created_at: response.data.created_at,
    };
  },
};
```

---

#### 6. **Update User Name** (`/users/update-user-name`)

**Status**: ❌ **NOT IMPLEMENTED**

**Needs Implementation**:
```typescript
// src/services/user.ts

export const userService = {
  updateName: async (name: string): Promise<User> => {
    const response = await api.post<any>('/users/update-user-name', null, {
      params: { name_of_user: name }
    });
    return {
      id: response.data.user_id,
      email: response.data.email,
      role: response.data.role,
      is_onboarded: response.data.is_onboarded,
      created_at: response.data.created_at,
    };
  },
};
```

---

#### 7. **Get Patient Profile by Email** (`/users/patient-profile/{email}`)

**Status**: ❌ **NOT IMPLEMENTED**
**Note**: Admin only - low priority for MVP

---

## Integration Verification

### ✅ Get Current User (`/users/me`)
- [x] Endpoint implemented in backend
- [x] Frontend service implemented
- [x] Used by AuthContext
- [x] Returns correct user data
- [x] Handles authentication

### ✅ Get User Profile (`/users/profile`)
- [x] Endpoint implemented in backend
- [x] Frontend service implemented
- [x] Returns PatientProfile for patients
- [x] Returns DoctorProfile for doctors
- [x] Handles missing profiles (404)

### ✅ Patient Onboarding (`/users/onboard`)
- [x] Endpoint implemented in backend
- [x] Frontend service implemented
- [x] Onboarding form exists
- [x] Sets `is_onboarded = true`
- [x] Creates patient profile
- [x] Validates required fields

### ⚠️ Doctor Onboarding
- [ ] Backend doesn't support doctor onboarding
- [ ] Frontend has `onboardDoctor` function that doesn't work
- [ ] Need to clarify doctor setup process

### ❌ Update User Profile (`/users/update-user`)
- [ ] Backend endpoint exists
- [ ] Frontend service NOT implemented
- [ ] No UI for profile editing

### ❌ Update User Name (`/users/update-user-name`)
- [ ] Backend endpoint exists
- [ ] Frontend service NOT implemented
- [ ] No UI for name editing

---

## Known Issues & Recommendations

### 🔴 Critical Issues

#### 1. **Doctor Onboarding Mismatch**
**Problem**: Frontend has `onboardDoctor()` function, but backend rejects doctor onboarding with 400 error.

**Backend Behavior**:
```python
if str(user.role) == "doctor":
    raise HTTPException(status_code=400, detail="Doctors cannot be onboarded.")
```

**Recommendation**:
- Remove `onboardDoctor` from frontend
- Mark doctors as `is_onboarded = true` by default during registration
- OR create separate doctor profile setup endpoint

---

### 🟡 Missing Features

#### 2. **No Profile Edit Functionality**
**Problem**: Backend has `/users/update-user` endpoint, but frontend has no UI or service to use it.

**Recommendation**:
- Create `userService.updateProfile()` function
- Add "Edit Profile" button in Profile page
- Create profile edit form/modal

#### 3. **No Name Update Functionality**
**Problem**: Backend has `/users/update-user-name` endpoint, but frontend doesn't use it.

**Recommendation**:
- Create `userService.updateName()` function
- Add inline name editing in Profile page

---

### 🟢 Type Safety Improvements

#### 4. **Profile Type Definitions**
**Problem**: Profile types are not fully defined in frontend.

**Recommendation**:
- Add complete `PatientProfile` and `DoctorProfile` interfaces
- Use discriminated unions for `UserProfile` type
- Add type guards for role-based type narrowing

---

## Module Status

### 🟡 **USER MODULE: PARTIALLY COMPLETE**

**Working**:
- ✅ Get current user (`/users/me`)
- ✅ Get user profile (`/users/profile`)
- ✅ Patient onboarding (`/users/onboard`)

**Needs Implementation**:
- ❌ Update user profile UI and service
- ❌ Update user name UI and service
- ⚠️ Doctor onboarding clarification

**Needs Review**:
- ⚠️ Doctor onboarding flow (backend rejects it)
- ⚠️ Profile type definitions
- ⚠️ Error handling for missing profiles

---

## Testing Checklist

### Get Current User
- [x] Login as patient and verify `/users/me` returns correct data
- [x] Login as doctor and verify `/users/me` returns correct data
- [x] Verify `user_id`, `email`, `role`, `is_onboarded` fields are present
- [x] Verify unauthenticated request returns 401

### Get User Profile
- [x] Login as onboarded patient and verify `/users/profile` returns PatientProfile
- [x] Login as doctor and verify `/users/profile` returns DoctorProfile
- [x] Login as non-onboarded patient and verify returns 404
- [x] Verify all profile fields are present and correct
- [x] Verify `medical_info` contains all onboarding data

### Patient Onboarding
- [x] Register new patient account
- [x] Verify `is_onboarded = false` initially
- [x] Complete onboarding form with all required fields
- [x] Submit onboarding data to `/users/onboard`
- [x] Verify `is_onboarded = true` after onboarding
- [x] Verify profile data is saved correctly
- [x] Verify redirect to patient dashboard
- [x] Attempt to onboard again (should fail with 400)

### Doctor Onboarding (NEEDS CLARIFICATION)
- [ ] Register new doctor account
- [ ] Verify doctor's `is_onboarded` status
- [ ] Determine if doctors need onboarding
- [ ] Test doctor profile creation process

### Update Profile (NOT IMPLEMENTED)
- [ ] Create update profile UI
- [ ] Test updating patient profile fields
- [ ] Verify changes persist in database
- [ ] Verify only allowed fields can be updated

### Update Name (NOT IMPLEMENTED)
- [ ] Create name update UI
- [ ] Test updating user name
- [ ] Verify name change reflects in profile

### Error Handling
- [ ] Test profile access without authentication (401)
- [ ] Test onboarding without required fields (422)
- [ ] Test onboarding as doctor (400)
- [ ] Test profile access before onboarding (404)
- [ ] Test duplicate onboarding (400)

---

## Next Steps

1. **Clarify Doctor Onboarding**
   - Determine if doctors need onboarding
   - Update backend or frontend accordingly
   - Set `is_onboarded = true` for doctors if no onboarding needed

2. **Implement Profile Editing**
   - Create `userService.updateProfile()` function
   - Add edit profile UI in Profile page
   - Test profile updates

3. **Implement Name Editing**
   - Create `userService.updateName()` function
   - Add inline name editing in Profile page

4. **Add Type Definitions**
   - Complete `PatientProfile` and `DoctorProfile` types
   - Add type guards for role-based narrowing

5. **Test All Flows**
   - Complete testing checklist above
   - Fix any bugs found during testing

---

## Related Modules

- **Auth Module**: Handles login/register and initial user creation
- **User Module**: Handles profile management and onboarding (this document)
- **Cases Module**: Next module to implement

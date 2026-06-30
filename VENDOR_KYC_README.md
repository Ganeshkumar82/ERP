# Vendor KYC Implementation

This document outlines the complete vendor KYC (Know Your Customer) implementation with file upload capabilities.

## Database Schema

### New Table: `vendors`
Replaces the old `vendormaster` table with comprehensive KYC information including:

**Company Information:**
- vendor_name (required)
- address
- state  
- pincode

**Contact Information:**
- contact_person_name
- contact_person_designation
- contact_person_phone (required)
- email (required)

**Business Information:**
- business_type (enum: Manufacturer/Distributor/Service Provider/Others) (required)
- year_of_establishment (required)
- gst_number (required)
- pan_number (required)
- annual_turnover (required)
- products_services (required)
- hsn_sac_code (required)
- description

**Bank Details:**
- bank_name (required)
- branch_name (required)
- account_number (required)
- ifsc_code (required)

**Certifications (Optional):**
- iso_certification
- other_certifications

**Document Upload Paths:**
- registration_certificate_path
- pan_upload_path
- cancelled_cheque_path

## API Endpoints

### 1. Add Vendor with KYC (POST)
**Endpoint:** `/api/vendor/addvendor`
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `STOKEN`: Session token
- `querystring`: Encrypted JSON with vendor data
- `registration_certificate`: PDF/Image file (optional)
- `pan_upload`: PDF/Image file (optional)
- `cancelled_cheque`: PDF/Image file (optional)

**Querystring JSON Structure:**
```json
{
  "vendorname": "JK Construction",
  "address": "123 Main Street, Coimbatore",
  "state": "Tamil Nadu",
  "pincode": "641001",
  "contactpersonname": "John Doe",
  "contactpersondesignation": "Manager", 
  "contactpersonphone": "8393923242",
  "email": "jk@gmail.com",
  "businesstype": "Manufacturer",
  "yearofestablishment": 2010,
  "gstnumber": "33ABCD43wsd123",
  "pannumber": "ABCPD1234E",
  "annualturnover": 50000000.00,
  "productsservices": "Construction materials, cement, steel",
  "hsnsaccode": "2523,7207",
  "description": "Leading manufacturer of construction materials",
  "bankname": "State Bank of India",
  "branchname": "Coimbatore Main",
  "accountnumber": "1234567890",
  "ifsccode": "SBIN0001234",
  "isocertification": "ISO 9001:2015",
  "othercertifications": "BIS certification for cement"
}
```

**Response:**
```json
{
  "code": true,
  "message": "Vendor Added Successfully",
  "Value": {
    "vendor_id": 1,
    "registration_certificate_uploaded": true,
    "pan_upload_uploaded": true,
    "cancelled_cheque_uploaded": true
  }
}
```

### 2. Get Vendor (POST)
**Endpoint:** `/api/vendor/getvendor`

**Request Body:**
```json
{
  "STOKEN": "session_token",
  "querystring": "encrypted_json"
}
```

**Querystring JSON:**
```json
{
  "vendorid": 1  // 0 or empty for all vendors
}
```

**Response:**
```json
{
  "code": true,
  "message": "Vendor Fetched Successfully",
  "Value": [
    {
      "id": 1,
      "vendor_name": "JK Construction",
      "address": "123 Main Street, Coimbatore",
      "state": "Tamil Nadu",
      "pincode": "641001",
      "contact_person_name": "John Doe",
      "contact_person_designation": "Manager",
      "contact_person_phone": "8393923242",
      "email": "jk@gmail.com",
      "business_type": "Manufacturer",
      "year_of_establishment": 2010,
      "gst_number": "33ABCD43wsd123",
      "pan_number": "ABCPD1234E",
      "annual_turnover": 50000000.00,
      "products_services": "Construction materials, cement, steel",
      "hsn_sac_code": "2523,7207",
      "description": "Leading manufacturer of construction materials",
      "bank_name": "State Bank of India",
      "branch_name": "Coimbatore Main", 
      "account_number": "1234567890",
      "ifsc_code": "SBIN0001234",
      "iso_certification": "ISO 9001:2015",
      "other_certifications": "BIS certification for cement",
      "registration_certificate_path": "/path/to/registration.pdf",
      "pan_upload_path": "/path/to/pan.pdf",
      "cancelled_cheque_path": "/path/to/cheque.pdf",
      "registration_certificate_binary": "base64_encoded_data",
      "pan_upload_binary": "base64_encoded_data", 
      "cancelled_cheque_binary": "base64_encoded_data",
      "created_at": "2025-07-07 10:30:00",
      "updated_at": "2025-07-07 10:30:00"
    }
  ]
}
```

### 3. Update Registration Certificate (POST)
**Endpoint:** `/api/vendor/update-registration-cert`
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `STOKEN`: Session token
- `querystring`: Encrypted JSON with vendor_id
- `registration_certificate`: PDF/Image file

### 4. Update PAN Document (POST)
**Endpoint:** `/api/vendor/update-pan`
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `STOKEN`: Session token
- `querystring`: Encrypted JSON with vendor_id
- `pan_upload`: PDF/Image file

### 5. Update Cancelled Cheque (POST)
**Endpoint:** `/api/vendor/update-cancelled-cheque`
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `STOKEN`: Session token
- `querystring`: Encrypted JSON with vendor_id
- `cancelled_cheque`: PDF/Image file

## File Upload Structure

Files are organized in the following directory structure:
```
uploads/
├── YYYY/
│   ├── Month/
│   │   ├── DD/
│   │   │   ├── VendorKYC/
│   │   │   │   ├── RegistrationCertificate/
│   │   │   │   │   └── timestamp_filename.pdf
│   │   │   │   ├── PAN/
│   │   │   │   │   └── timestamp_filename.pdf
│   │   │   │   └── CancelledCheque/
│   │   │   │       └── timestamp_filename.pdf
```

## Middleware Functions

### uploadVendorKYCDocuments
- Handles multiple file uploads for AddVendor
- Supports: registration_certificate, pan_upload, cancelled_cheque
- Max file size: 5MB per file
- File types: PDF, JPG, PNG

### uploadVendorRegistrationCert
- Single file upload for registration certificate updates
- Field name: registration_certificate
- Max file size: 5MB

### uploadVendorPAN
- Single file upload for PAN document updates
- Field name: pan_upload
- Max file size: 5MB

### uploadVendorCancelledCheque
- Single file upload for cancelled cheque updates
- Field name: cancelled_cheque
- Max file size: 5MB

## Validation Rules

### Required Fields
- vendor_name
- contact_person_phone
- email
- business_type
- year_of_establishment
- gst_number
- pan_number
- annual_turnover
- products_services
- hsn_sac_code
- bank_name
- branch_name
- account_number
- ifsc_code

### Business Type Validation
Must be one of: "Manufacturer", "Distributor", "Service Provider", "Others"

### File Upload Validation
- Maximum file size: 5MB
- Allowed file types: PDF, JPG, PNG, JPEG
- Files are optional but paths are stored when uploaded

## Security Features

1. **Session Token Validation**: All APIs validate session tokens
2. **Encrypted Querystring**: Request data is encrypted using session token
3. **File Path Security**: Files are stored with timestamp prefixes
4. **Input Validation**: Comprehensive validation for all required fields
5. **SQL Injection Prevention**: Parameterized queries used throughout

## Migration Notes

### From Old vendormaster Table
1. Create new `vendors` table using provided SQL script
2. Migrate existing data from `vendormaster` to `vendors` table
3. Update all references to use new table structure
4. The old `vendorproducts` table can be maintained separately if needed

### Breaking Changes
- Function signatures changed from `AddVendor(vendor)` to `AddVendor(req, res)`
- Response structure includes additional KYC fields
- File upload now integrated into vendor creation process
- New validation rules for comprehensive vendor information

## Error Handling

All functions return standardized error responses:
```json
{
  "code": false,
  "message": "error",
  "Value": "Error description",
  "Data": "Detailed error message"
}
```

Common error scenarios:
- Invalid session token
- Missing required fields
- File upload failures
- Database connection issues
- Invalid business type values

## Usage Examples

### Frontend Implementation
```javascript
// Add vendor with KYC documents
const formData = new FormData();
formData.append('STOKEN', sessionToken);
formData.append('querystring', encryptedVendorData);
formData.append('registration_certificate', registrationFile);
formData.append('pan_upload', panFile);
formData.append('cancelled_cheque', chequeFile);

fetch('/api/vendor/add', {
  method: 'POST',
  body: formData
});
```

### Document Update Example
```javascript
// Update registration certificate
const formData = new FormData();
formData.append('STOKEN', sessionToken);
formData.append('querystring', encrypt(JSON.stringify({vendor_id: 1})));
formData.append('registration_certificate', newRegistrationFile);

fetch('/api/vendor/update-registration-cert', {
  method: 'POST', 
  body: formData
});
```

## Testing

### Required Test Cases
1. Add vendor with all KYC documents
2. Add vendor with partial documents
3. Fetch single vendor with binary document data
4. Fetch all vendors
5. Update individual KYC documents
6. Validation error handling
7. File upload error handling
8. Session token validation

### Test Data
Use the sample data provided in the SQL script for testing purposes.

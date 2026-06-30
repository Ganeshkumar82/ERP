-- Vendor KYC Table Creation Script
-- This table replaces the old vendormaster table with comprehensive KYC information

CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Company Info
    vendor_name VARCHAR(255) NOT NULL,
    address TEXT,
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Contact Info
    contact_person_name VARCHAR(100),
    contact_person_designation VARCHAR(100),
    contact_person_phone VARCHAR(20),
    email VARCHAR(255),

    -- Business Info
    business_type ENUM('Manufacturer', 'Distributor', 'Service Provider', 'Others') NOT NULL,
    year_of_establishment YEAR NOT NULL,
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    annual_turnover DECIMAL(15, 2),
    products_services TEXT,
    hsn_sac_code VARCHAR(50),
    description TEXT,

    -- Bank Details
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    account_number VARCHAR(30),
    ifsc_code VARCHAR(20),

    -- Optional Certs
    iso_certification VARCHAR(255),
    other_certifications TEXT,

    -- Uploads (file paths)
    registration_certificate_path VARCHAR(255),
    pan_upload_path VARCHAR(255),
    cancelled_cheque_path VARCHAR(255),

    -- Meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_vendor_name (vendor_name),
    INDEX idx_gst_number (gst_number),
    INDEX idx_pan_number (pan_number),
    INDEX idx_email (email),
    INDEX idx_business_type (business_type)
);

-- Sample data insertion
INSERT INTO vendors (
    vendor_name, address, state, pincode, contact_person_name, contact_person_designation,
    contact_person_phone, email, business_type, year_of_establishment, gst_number,
    pan_number, annual_turnover, products_services, hsn_sac_code, description,
    bank_name, branch_name, account_number, ifsc_code, iso_certification, other_certifications
) VALUES (
    'JK Construction', 
    '123 Main Street, Coimbatore', 
    'Tamil Nadu', 
    '641001',
    'John Doe', 
    'Manager', 
    '8393923242', 
    'jk@gmail.com',
    'Manufacturer', 
    2010, 
    '33ABCD43wsd123', 
    'ABCPD1234E',
    50000000.00, 
    'Construction materials, cement, steel', 
    '2523,7207',
    'Leading manufacturer of construction materials',
    'State Bank of India', 
    'Coimbatore Main', 
    '1234567890', 
    'SBIN0001234',
    'ISO 9001:2015', 
    'BIS certification for cement'
);

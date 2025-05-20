-- RSTL Appointment Portal Database Setup Script
-- This script creates the database and all required tables

-- Drop and recreate the database for a clean setup (dev only)
DROP DATABASE IF EXISTS rstl_appointment_portal;
CREATE DATABASE rstl_appointment_portal;
\c rstl_appointment_portal

-- Drop all tables if they exist (in dependency order)
DROP TABLE IF EXISTS appointment_detail_services CASCADE;
DROP TABLE IF EXISTS lab_assignments CASCADE;
DROP TABLE IF EXISTS remarks CASCADE;
DROP TABLE IF EXISTS action_logs CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS research_consultation_details CASCADE;
DROP TABLE IF EXISTS shelf_life_details CASCADE;
DROP TABLE IF EXISTS microbiology_details CASCADE;
DROP TABLE IF EXISTS chemistry_details CASCADE;
DROP TABLE IF EXISTS metrology_details CASCADE;
DROP TABLE IF EXISTS appointment_details CASCADE;
DROP TABLE IF EXISTS inquiry_information CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS admin_assignments CASCADE;
DROP TABLE IF EXISTS appointment_constraints CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS trucks CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS nextauth_verification_tokens CASCADE;
DROP TABLE IF EXISTS nextauth_sessions CASCADE;
DROP TABLE IF EXISTS nextauth_accounts CASCADE;
DROP TABLE IF EXISTS nextauth_users CASCADE;

-- Enable the UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    lab_access VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    contact_number VARCHAR(50),
    sex VARCHAR(50),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Companies table (primarily for metrology)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    business_permit TEXT,
    address TEXT,
    reg_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    verified_date DATE,
    license_plates VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trucks table (for metrology)
CREATE TABLE trucks (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    orcr_document TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Remove old unique constraint if it exists
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS trucks_license_plate_key;
-- Add new composite unique constraint
ALTER TABLE trucks ADD CONSTRAINT trucks_license_plate_company_id_key UNIQUE (license_plate, company_id);

-- Create Services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sample_type VARCHAR(100)
);

-- Create AppointmentConstraints table (primarily for metrology)
CREATE TABLE appointment_constraints (
    id SERIAL PRIMARY KEY,
    constraint_date DATE NOT NULL,
    daily_liter_capacity DECIMAL(10,2) NOT NULL,
    max_appointments_per_day INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AdminAssignments table
CREATE TABLE admin_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    laboratory VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    truck_id INTEGER REFERENCES trucks(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create InquiryInformation table
CREATE TABLE inquiry_information (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    mode_of_inquiry VARCHAR(50),
    rstl_personnel_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    response_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AppointmentDetails table
CREATE TABLE appointment_details (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    plate_number VARCHAR(50),
    sample_description TEXT,
    name_of_samples VARCHAR(255),
    sample_type VARCHAR(100),
    sample_condition VARCHAR(100),
    sample_quantity VARCHAR(100),
    number_of_replicates INTEGER,
    terms_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MetrologyDetails table
CREATE TABLE metrology_details (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    type_of_test VARCHAR(100) NOT NULL,
    number_of_liters INTEGER,
    instrument_type VARCHAR(100),
    truck_plate_number VARCHAR(50),
    manager_name VARCHAR(255),
    manager_contact VARCHAR(100),
    manager_approval_date DATE,
    liquid_carried_liters DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ChemistryDetails table
CREATE TABLE chemistry_details (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    analysis_requested TEXT,
    parameters TEXT,
    delivery_type VARCHAR(100),
    sample_quantity VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MicrobiologyDetails table
CREATE TABLE microbiology_details (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    test_type VARCHAR(100),
    organism_target VARCHAR(100),
    sample_storage_condition VARCHAR(100),
    sample_quantity VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ShelfLifeDetails table
CREATE TABLE shelf_life_details (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    -- Extended fields
    objective_of_study TEXT,
    product_type VARCHAR(100),
    net_weight VARCHAR(100),
    brand_name VARCHAR(255),
    existing_market TEXT,
    production_type VARCHAR(100),
    product_ingredients TEXT,
    storage_conditions TEXT,
    shelf_life_duration VARCHAR(100),
    packaging_type VARCHAR(100),
    target_shelf_life VARCHAR(100),
    modes_of_deterioration TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ResearchConsultationDetails table
CREATE TABLE research_consultation_details (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    research_topic TEXT,
    consultation_type VARCHAR(100),
    research_stage VARCHAR(100),
    additional_requirements TEXT,
    uploaded_research_paper VARCHAR(255),
    consultation_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TestResults table
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    result_data JSONB,
    result_file_path VARCHAR(255),
    conducted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ActionLogs table
CREATE TABLE action_logs (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    action_type VARCHAR(50),
    action_desc TEXT,
    performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Remarks table
CREATE TABLE remarks (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    remark_text TEXT,
    remark_type VARCHAR(50),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create LabAssignments table
CREATE TABLE lab_assignments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    laboratory_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointment_detail_services table
CREATE TABLE appointment_detail_services (
    id SERIAL PRIMARY KEY,
    appointment_detail_id INTEGER REFERENCES appointment_details(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently queried fields
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_company_id ON appointments(company_id);
CREATE INDEX idx_appointments_truck_id ON appointments(truck_id);
CREATE INDEX idx_trucks_company_id ON trucks(company_id);
CREATE INDEX idx_admin_assignments_user_id ON admin_assignments(user_id);
CREATE INDEX idx_inquiry_information_appointment_id ON inquiry_information(appointment_id);
CREATE INDEX idx_appointment_details_appointment_id ON appointment_details(appointment_id);
CREATE INDEX idx_test_results_appointment_id ON test_results(appointment_id);
CREATE INDEX idx_action_logs_appointment_id ON action_logs(appointment_id);
CREATE INDEX idx_remarks_appointment_id ON remarks(appointment_id);
CREATE INDEX idx_lab_assignments_appointment_id ON lab_assignments(appointment_id);

-- Create comprehensive report view
CREATE VIEW appointment_report_view AS
SELECT 
    a.id AS inquiry_id,
    a.created_at AS date_of_inquiry,
    i.mode_of_inquiry,
    u_personnel.name AS rstl_personnel,
    s.name AS type_of_inquiry,
    c.name AS customer_name,
    c.company_name,
    c.email,
    c.contact_number,
    a.appointment_date,
    ad.sample_description,
    ad.name_of_samples,
    ad.sample_quantity,
    ad.number_of_replicates,
    s.category AS laboratory,
    (SELECT action_desc FROM action_logs WHERE appointment_id = a.id AND action_type = 'lab' ORDER BY created_at DESC LIMIT 1) AS action_from_lab,
    a.appointment_date AS schedule,
    (SELECT remark_text FROM remarks WHERE appointment_id = a.id ORDER BY created_at DESC LIMIT 1) AS remarks,
    (SELECT action_desc FROM action_logs WHERE appointment_id = a.id AND action_type = 'cro' ORDER BY created_at DESC LIMIT 1) AS action_from_cro,
    i.response_deadline AS wait_response_until,
    a.status,
    (SELECT string_agg(action_desc, ', ' ORDER BY created_at DESC) FROM action_logs WHERE appointment_id = a.id) AS action_logs,
    -- Metrology specific fields
    CASE WHEN s.category = 'metrology' THEN 
        (SELECT t.license_plate FROM trucks t WHERE t.id = a.truck_id) 
    ELSE NULL END AS truck_plate,
    CASE WHEN s.category = 'metrology' THEN 
        (SELECT m.liquid_carried_liters FROM metrology_details m JOIN appointment_details ad ON m.appointment_detail_id = ad.id WHERE ad.appointment_id = a.id)
    ELSE NULL END AS liquid_carried_liters,
    CASE WHEN s.category = 'metrology' THEN 
        (SELECT comp.name FROM companies comp WHERE comp.id = a.company_id)
    ELSE NULL END AS metrology_company_name
FROM 
    appointments a
JOIN 
    customers c ON a.customer_id = c.id
JOIN 
    services s ON a.service_id = s.id
LEFT JOIN 
    appointment_details ad ON a.id = ad.appointment_id
LEFT JOIN 
    inquiry_information i ON a.id = i.appointment_id
LEFT JOIN 
    users u_personnel ON i.rstl_personnel_id = u_personnel.id;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_trucks_modtime BEFORE UPDATE ON trucks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON services FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointment_constraints_modtime BEFORE UPDATE ON appointment_constraints FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_admin_assignments_modtime BEFORE UPDATE ON admin_assignments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_inquiry_information_modtime BEFORE UPDATE ON inquiry_information FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_appointment_details_modtime BEFORE UPDATE ON appointment_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_metrology_details_modtime BEFORE UPDATE ON metrology_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_chemistry_details_modtime BEFORE UPDATE ON chemistry_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_microbiology_details_modtime BEFORE UPDATE ON microbiology_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_shelf_life_details_modtime BEFORE UPDATE ON shelf_life_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_research_consultation_details_modtime BEFORE UPDATE ON research_consultation_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_test_results_modtime BEFORE UPDATE ON test_results FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_lab_assignments_modtime BEFORE UPDATE ON lab_assignments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Add a default admin user
INSERT INTO users (name, email, password, role, lab_access)
VALUES ('Administrator', 'admin@rstl.gov', '$2a$10$JERhJYGmwNB6aVdpoXWEfO3h2Le3d0xNn4AkKtrkQpk6LuZuaHX9m', 'admin', 'all');
-- Note: The password here is hashed. The original password is 'admin123'

-- Insert CHEMICAL TESTS
INSERT INTO services (name, category, sample_type, price, duration_minutes) VALUES
-- FOOD
('Alcohol by volume of distilled liquor', 'chemistry', 'Food', 390.00, 60),
('Alcohol by volume of distilled liquor', 'chemistry', 'Food', 390.00, 60),
('Ash', 'chemistry', 'Food', 650.00, 60),
('Boil Reducing', 'chemistry', 'Food', 570.00, 60),
('Color', 'chemistry', 'Food', 650.00, 60),
('Crude Fiber', 'chemistry', 'Food', 1_080.00, 60),
('Dietary Fiber', 'chemistry', 'Food', 1_800.00, 60),
('Energy in kcal of oils and fats as olec/lauric', 'chemistry', 'Food', 1_200.00, 60),
('Free Fatty Acid (oil)', 'chemistry', 'Food', 1_500.00, 60),
('Free Fatty Acid with sample preparation', 'chemistry', 'Food', 1_500.00, 60),
('Minerals in Food per analysis', 'chemistry', 'Food', 1_500.00, 60),
('Sodium (Na), Calcium (Ca), Iron (Fe), Potassium (K), Magnesium (Mg), Manganese (Mn), Zinc (Zn)', 'chemistry', 'Food', 1_500.00, 60),
('Moisture', 'chemistry', 'Food', 500.00, 60),
('Nitrate', 'chemistry', 'Food', 800.00, 60),
('Nitrites', 'chemistry', 'Food', 800.00, 60),
('Nutrition Facts Computation and Drafting (Daily Value)', 'chemistry', 'Food', 1_500.00, 60),
('Nutrition Facts Computation and Drafting (REIN)', 'chemistry', 'Food', 1_500.00, 60),
('Permanganate Oxidation No.', 'chemistry', 'Food', 1_200.00, 60),
('Peroxide Value of oils and fats', 'chemistry', 'Food', 650.00, 60),
('Peroxide Value of food with sample preparation', 'chemistry', 'Food', 1_200.00, 60),
('Protein', 'chemistry', 'Food', 1_525.00, 60),
('Refractive Index', 'chemistry', 'Food', 1_000.00, 60),
('Salt as NaCl', 'chemistry', 'Food', 800.00, 60),
('Saponification Value of oils', 'chemistry', 'Food', 1_200.00, 60),
('Titratable acidity of vinegars as acetic acid', 'chemistry', 'Food', 1_000.00, 60),
('Total Carbohydrates by computation', 'chemistry', 'Food', 1_200.00, 60),
('Total Fat', 'chemistry', 'Food', 1_200.00, 60),
('Total Soluble Solids', 'chemistry', 'Food', 1_000.00, 60),
('Trace Metals (Cd, Cu, Pb, Ni)', 'chemistry', 'Food', 1_200.00, 60),
('Water Activity', 'chemistry', 'Food', 1_200.00, 60),
-- WATER AND WASTEWATER
('Alkalinity', 'chemistry', 'Water and Wastewater', 1_500.00, 60),
('Biochemical Oxygen Demand', 'chemistry', 'Water and Wastewater', 1_500.00, 60),
('Calcium (Ca), Hardness', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Color', 'chemistry', 'Water and Wastewater', 750.00, 60),
('Chloride', 'chemistry', 'Water and Wastewater', 800.00, 60),
('Conductivity', 'chemistry', 'Water and Wastewater', 750.00, 60),
('Dissolved Oxygen', 'chemistry', 'Water and Wastewater', 900.00, 60),
('Magnesium (Mg) by computation', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Nitrates', 'chemistry', 'Water and Wastewater', 800.00, 60),
('Oil and Grease', 'chemistry', 'Water and Wastewater', 1_800.00, 60),
('pH', 'chemistry', 'Water and Wastewater', 500.00, 60),
('Residual Chlorine', 'chemistry', 'Water and Wastewater', 1_000.00, 60),
('Salinity', 'chemistry', 'Water and Wastewater', 800.00, 60),
('Sulfate', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Total Dissolved Solids', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Total Hardness', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Total Suspended Solids', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Turbidity', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
('Trace Metals (Cd, Ca, Cu, Fe, Pb, Mg, Mn, Ni, K, Na, Zn)', 'chemistry', 'Water and Wastewater', 1_200.00, 60),
-- PLANT AND PLANT EXTRACTS
('Distillation using rotary evaporator (per 50mL)', 'chemistry', 'Plant and Plant Extracts', 1_500.00, 60),
('Qualitative Phytochemical Analysis', 'chemistry', 'Plant and Plant Extracts', 1_500.00, 60),
-- PACKAGES
('Nutrition Facts Analysis', 'chemistry', 'Packages', 14_610.00, 60),
('Physical & Chemical Quality for Drinking Water', 'chemistry', 'Packages', 16_000.00, 60);

-- Insert MICROBIOLOGICAL TESTS
INSERT INTO services (name, category, sample_type, price, duration_minutes) VALUES
-- FOOD
('Aerobic Plate Count (Conventional)', 'microbiology', 'Food', 650.00, 60),
('Aerobic Plate Count (Petrifilm)', 'microbiology', 'Food', 650.00, 60),
('Coliform Count (Petrifilm)', 'microbiology', 'Food', 650.00, 60),
('Commercial Sterility Test (low acid only)', 'microbiology', 'Food', 1_000.00, 60),
('Escherichia coli Count', 'microbiology', 'Food', 1_000.00, 60),
('Salmonella Detection', 'microbiology', 'Food', 1_500.00, 60),
('Staphylococcus aureus Count (Petrifilm)', 'microbiology', 'Food', 1_000.00, 60),
('Yeast and Mold Count (Conventional)', 'microbiology', 'Food', 1_000.00, 60),
('Rapid Yeast and Mold Count (Petrifilm)', 'microbiology', 'Food', 1_000.00, 60),
-- WATER AND WASTEWATER
('Heterotrophic Plate Count', 'microbiology', 'Water and Wastewater', 650.00, 60),
('MPN of Total Coliform', 'microbiology', 'Water and Wastewater', 1_000.00, 60),
('MPN of Total Coliform - confirmed test for Thermotolerant (Fecal Coliform)', 'microbiology', 'Water and Wastewater', 1_000.00, 60),
('MPN of Total Coliform - confirmed test for E. coli', 'microbiology', 'Water and Wastewater', 1_000.00, 60),
-- PLANT EXTRACTS
('Antimicrobial activity against E. coli', 'microbiology', 'Plant Extracts', 600.00, 60),
('Antimicrobial activity against S. aureus', 'microbiology', 'Plant Extracts', 600.00, 60),
-- OTHERS
('Surface Swab', 'microbiology', 'Others', 550.00, 60),
-- PACKAGES
('PACKAGE A: Heterotrophic Plate Count + Coliform Count', 'microbiology', 'Packages', 1_700.00, 60),
('PACKAGE B: Heterotrophic Plate Count + Coliform Count + Fecal Coliform Count + E. coli Count', 'microbiology', 'Packages', 2_000.00, 60),
('PACKAGE C: Heterotrophic Plate Count + Coliform Count + Fecal Coliform Count', 'microbiology', 'Packages', 1_200.00, 60),
('PACKAGE D: Coliform Count + E. coli Count (Colilert-18)', 'microbiology', 'Packages', 1_200.00, 60),
('PACKAGE E: Heterotrophic Plate Count + Coliform Count + E. coli Count (Colilert-18)', 'microbiology', 'Packages', 1_200.00, 60),
('PACKAGE F: Coliform Count + E. coli Count (Colilert-18)', 'microbiology', 'Packages', 1_200.00, 60);

-- Insert RESEARCH CONSULTATION
INSERT INTO services (name, category, description, price, duration_minutes, active, sample_type)
VALUES ('Research Consultation', 'research', 'Consultation on research methodologies and experimental design', 1500.00, 120, true, 'N/A');

-- Insert METROLOGY TESTS
INSERT INTO services (name, category, sample_type, price, duration_minutes, description) VALUES
('Flow Meter Calibration', 'metrology', 'Liquid', 2500.00, 120, 'Calibration of flow meters for liquid measurement accuracy'),
('Volume Verification', 'metrology', 'Liquid', 1800.00, 90, 'Verification of liquid volume in containers or tanks'),
('Truck Tank Calibration', 'metrology', 'Liquid', 3000.00, 180, 'Calibration of truck tanks for accurate liquid delivery');

-- Insert SHELF LIFE TESTS
INSERT INTO services (name, category, sample_type, price, duration_minutes) VALUES
('Shelf Life Test (Food & Beverage)', 'shelf-life', 'Food', 2500.00, 60),
('Shelf Life Test (Cosmetics & Personal Care)', 'shelf-life', 'Cosmetics', 3000.00, 60),
('Shelf Life Test (Pharmaceuticals)', 'shelf-life', 'Pharmaceuticals', 5000.00, 60),
('Shelf Life Test (Packaging Materials)', 'shelf-life', 'Packaging', 1500.00, 60);

-- NextAuth.js required tables for authentication
CREATE TABLE nextauth_users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    email_verified TIMESTAMP,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nextauth_accounts (
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider, provider_account_id),
    FOREIGN KEY (user_id) REFERENCES nextauth_users(id) ON DELETE CASCADE
);

CREATE TABLE nextauth_sessions (
    session_token VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nextauth_users(id) ON DELETE CASCADE
);

CREATE TABLE nextauth_verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

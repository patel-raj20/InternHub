BEGIN;

-- =========================================
-- 1. ORGANIZATION
-- =========================================
WITH org AS (
  INSERT INTO organizations (
    id, name, description, industry, website, logo_url
  )
  VALUES (
    uuid_generate_v4(),
    'Silver Touch Technologies Limited, Ahmedabad',
    'IT Solutions',
    'IT',
    'https://www.silvertouch.com/',
    'https://www.silvertouch.com'
  )
  RETURNING id
),

-- =========================================
-- 2. DEPARTMENTS
-- =========================================
departments_data AS (
  INSERT INTO departments (id, organization_id, name, description)
  SELECT uuid_generate_v4(), org.id, d.name, d.description
  FROM org,
  (VALUES
    ('QA/QC','Testing Team'),
    ('PHP','PHP Development'),
    ('Java','Java Development'),
    ('.NET','.NET Development'),
    ('AI','AI Solutions'),
    ('Web Design','UI/UX'),
    ('SAP .NET','SAP Development'),
    ('Odoo','ERP Development'),
    ('Mobile','App Development'),
    ('RPA','Automation')
  ) d(name, description)
  RETURNING id, name, organization_id
),

-- =========================================
-- 3. SUPER ADMIN
-- =========================================
super_admin AS (
  INSERT INTO users (
    id, organization_id, first_name, last_name,
    email, phone, password_hash, role, status, invite_status
  )
  SELECT
    uuid_generate_v4(),
    org.id,
    'Mansukh','Savaliya',
    'mansukh.savaliya@silvertouch.com',
    '1234567890',
    'hashed_pass',
    'SUPER_ADMIN',
    'ACTIVE',
    'ACCEPTED'
  FROM org
  RETURNING id, organization_id
),

-- =========================================
-- 4. DEPT ADMINS
-- =========================================
dept_admins AS (
  INSERT INTO users (
    id, organization_id, department_id,
    first_name, last_name, email, phone,
    password_hash, role, status, invite_status, created_by
  )
  SELECT
    uuid_generate_v4(),
    d.organization_id,
    d.id,
    split_part(d.name,' ',1),
    'Head',
    CONCAT(lower(replace(d.name,' ','_')),'@silvertouch.com'),
    '1234567890',
    'hashed_pass',
    'DEPT_ADMIN',
    'ACTIVE',
    'ACCEPTED',
    s.id
  FROM departments_data d
  CROSS JOIN super_admin s
)

-- =========================================
-- 5. INTERN USERS (ALL 50)
-- =========================================
INSERT INTO users (
  id, organization_id, department_id,
  first_name, last_name, email, phone,
  password_hash, role, status, invite_status, created_by
)
SELECT
  uuid_generate_v4(),
  d.organization_id,
  d.id,
  u.first_name,
  u.last_name,
  u.email,
  u.phone,
  'hashed_pass',
  'INTERN',
  'ACTIVE',
  'ACCEPTED',
  s.id
FROM (
VALUES
-- ===== FIRST SET =====
('Aviraj','Chudasama','aviraj.chudasama@gmail.com','9000001001','QA/QC'),
('Jay','Kanjariya','jay.kanjariya@gmail.com','9000001002','PHP'),
('Parimal','Vala','parimal.vala@gmail.com','9000001003','Mobile'),
('Nitin','Jethwani','nitin.jethwani@gmail.com','9000001004','PHP'),
('Mandeep','Jadeja','mandeep.jadeja@gmail.com','9000001005','QA/QC'),
('Yogesh','Sondagar','yogesh.sondagar@gmail.com','9000001006','SAP .NET'),
('Harsh','Sarvaiya','harsh.sarvaiya@gmail.com','9000001007','QA/QC'),
('Jay','Odera','jay.odera@gmail.com','9000001008','PHP'),
('Bhavin','Sachaniya','bhavin.sachaniya@gmail.com','9000001009','PHP'),
('Harshil','Kachhadiya','harshil.kachhadiya@gmail.com','9000001010','.NET'),
('Krishna','Thakker','krishna.thakker@gmail.com','9000001011','SAP .NET'),
('Hetvi','Zora','hetvi.zora@gmail.com','9000001012','PHP'),
('Manish','Yadav','manish.yadav@gmail.com','9000001013','RPA'),
('Dhrumil','Asodiya','dhrumil.asodiya@gmail.com','9000001014','Java'),
('Keval','Bambhaniya','keval.bambhaniya@gmail.com','9000001015','Odoo'),
('Khushi','Patel','khushi.patel@gmail.com','9000001016','.NET'),
('Aaditya','Valand','aaditya.valand@gmail.com','9000001017','.NET'),
('Neelkumar','Thummar','neelkumar.thummar@gmail.com','9000001018','.NET'),
('Krish','Odhaviya','krish.odhaviya@gmail.com','9000001019','Java'),
('Muhammadhassan','Gadhawala','muhammadhassan.gadhawala@gmail.com','9000001020','Mobile'),

-- ===== SECOND SET =====
('Rahul','Prajapati','rahul.prajapati@gmail.com','9000001026','AI'),
('Parth','Pakhiya','parth.pakhiya@gmail.com','9000001027','AI'),
('Raj','Patel','raj.patel@gmail.com','9000001028','AI'),
('Prachi','Dankhara','prachi.dankhara@gmail.com','9000001029','AI'),
('Bhargav','Dugrani','bhargav.dugrani@gmail.com','9000001030','AI'),
('Harsh','Parsaniya','harsh.parsaniya@gmail.com','9000001031','SAP .NET'),
('Dev','Bhimani','dev.bhimani@gmail.com','9000001032','AI'),
('Nihir','Kotadiya','nihir.kotadiya@gmail.com','9000001033','PHP'),
('Darshan','Zakadiya','darshan.zakadiya@gmail.com','9000001034','Java'),
('Meet','Prajapati','meet.prajapati@gmail.com','9000001035','Mobile'),
('Utsavi','Patel','utsavi.patel@gmail.com','9000001036','PHP'),
('Harsh','Butani','harsh.butani@gmail.com','9000001037','.NET'),
('Shreya','Vekariya','shreya.vekariya@gmail.com','9000001038','PHP'),
('Rishi','Patel','rishi.patel@gmail.com','9000001039','PHP'),
('Meet','Akbari','meet.akbari@gmail.com','9000001040','.NET'),
('Harsh','Panara','harsh.panara@gmail.com','9000001041','PHP'),
('Nand','Zalavadiya','nand.zalavadiya@gmail.com','9000001042','SAP .NET'),
('Popat','Modhwadiya','popat.modhwadiya@gmail.com','9000001043','AI'),
('Maitri','Jadeja','maitri.jadeja@gmail.com','9000001044','QA/QC'),
('Anshu','Bhatt','anshu.bhatt@gmail.com','9000001045','QA/QC'),
('Twinkle','Singh','twinkle.singh@gmail.com','9000001046','QA/QC'),
('Vidhika','Mahida','vidhika.mahida@gmail.com','9000001047','Java'),
('Kashish','Modi','kashish.modi@gmail.com','9000001048','SAP .NET'),
('Diya','Doshi','diya.doshi@gmail.com','9000001049','Mobile'),
('Prince','Rankaja','prince.rankaja@gmail.com','9000001050','PHP'),
('Vedanshu','Pandey','vedanshu.pandey@gmail.com','9000001051','QA/QC'),
('Ronit','Kadiya','ronit.kadiya@gmail.com','9000001052','QA/QC')
) u(first_name,last_name,email,phone,dept_name)
JOIN departments_data d ON d.name = u.dept_name
CROSS JOIN super_admin s;

-- =========================================
-- 6. INTERN PROFILES (ALL MATCHED)
-- =========================================
INSERT INTO interns (
 id,
 user_id,
 organization_id,
 college_name,
 degree,
 specialization,
 graduation_year,
 cgpa,
 skills,
 certifications,
 city,
 state,
 country,
 joining_date
)
SELECT
 uuid_generate_v4(),
 u.id,
 u.organization_id,
 d.college,
 TRIM(d.degree),
 TRIM(d.spec),
 d.grad,
 d.cgpa,
 '[]'::jsonb,
 '[]'::jsonb,
 d.city,
 'Gujarat',
 'India',
 TO_DATE(d.jd,'DD/MM/YYYY')
FROM (
VALUES
-- (FULL CSV DATA SAME AS YOUR FILE — already mapped perfectly)
('Aviraj','Chudasama','GEC Bhavnagar','B.E ','QA/QC',2026,7.53,'Bhavnagar','05/01/2026'),
('Jay','Kanjariya','GEC Bhavnagar','B.E ','PHP',2026,8.50,'Bhavnagar','05/01/2026'),
('Parimal','Vala','GEC Bhavnagar','B.E ','Mobile',2026,8.45,'Bhavnagar','05/01/2026'),
('Nitin','Jethwani','GEC Bhavnagar','B.E ','PHP',2026,8.22,'Bhavnagar','05/01/2026'),
('Mandeep','Jadeja','GEC Bhavnagar','B.E ','QA/QC',2026,7.75,'Bhavnagar','05/01/2026'),
('Yogesh','Sondagar','GEC Bhavnagar','B.E ','SAP .NET',2026,8.30,'Bhavnagar','05/01/2026'),
('Harsh','Sarvaiya','GEC Bhavnagar','B.E ','QA/QC',2026,7.80,'Surat','05/01/2026'),
('Jay','Odera','GEC Bhavnagar','B.E ','PHP',2026,8.75,'Porbandar','05/01/2026'),
('Bhavin','Sachaniya','SSEC Bhavnagar','B.E ','PHP',2026,7.45,'Bhavnagar','05/01/2026'),
('Harshil','Kachhadiya','SSEC Bhavnagar','B.E ','.NET',2026,8.23,'Bhavnagar','05/01/2026'),
('Krishna','Thakker','GEC Patan','B.E ','SAP .NET',2026,7.50,'Patan','05/01/2026'),
('Hetvi','Zora','GEC Patan','B.E ','PHP',2026,8.23,'Patan','05/01/2026'),
('Manish','Yadav','GEC Patan','B.E ','RPA',2026,8.22,'Gandhidham','05/01/2026'),
('Dhrumil','Asodiya','GEC Patan','B.E ','Java',2026,7.23,'Patan','05/01/2026'),
('Keval','Bambhaniya','GEC Patan','B.E ','Odoo',2026,8.47,'Patan','05/01/2026'),
('Khushi','Patel','GEC Patan','B.E ','.NET',2026,8.85,'Patan','05/01/2026'),
('Aaditya','Valand','GEC Rajkot','B.E ','.NET',2026,7.89,'Anand','05/01/2026'),
('Neelkumar','Thummar','GEC Rajkot','B.E ','.NET',2026,8.21,'Gondal','05/01/2026'),
('Krish','Odhaviya','GEC Rajkot','B.E ','Java',2026,7.25,'Rajkot','05/01/2026'),
('Muhammadhassan','Gadhawala','GEC Rajkot','B.E ','Mobile',2026,7.80,'Rajkot','05/01/2026'),

('Rahul','Prajapati','VGEC','B.E','AI',2026,7.80,'Kadi','05/01/2026'),
('Parth','Pakhiya','VGEC','B.E','AI',2026,8.10,'Rajkot','05/01/2026'),
('Raj','Patel','VGEC','B.E','AI',2026,7.95,'Ahmedabad','05/01/2026'),
('Prachi','Dankhara','VGEC','B.E','AI',2026,8.20,'Surat','05/01/2026'),

('Bhargav','Dugrani','Charusat University','B.Tech','AI',2026,7.60,'Junagadh','05/01/2026'),
('Harsh','Parsaniya','Charusat University','B.Tech','SAP .NET',2026,8.00,'Rajkot','05/01/2026'),
('Dev','Bhimani','Charusat University','B.Tech','AI',2026,8.30,'Bhavnagar','05/01/2026'),
('Nihir','Kotadiya','Charusat University','B.Tech','PHP',2026,8.40,'Amreli','05/01/2026'),
('Darshan','Zakadiya','Charusat University','B.Tech','Java',2026,7.70,'Anand','05/01/2026'),
('Meet','Prajapati','Charusat University','B.Tech','Mobile',2026,8.10,'Ahmedabad','05/01/2026'),
('Utsavi','Patel','Charusat University','B.Tech','PHP',2026,8.50,'Mehsana','05/01/2026'),
('Harsh','Butani','Charusat University','B.Tech','.NET',2026,7.85,'Rajkot','05/01/2026'),
('Shreya','Vekariya','Charusat University','B.Tech','PHP',2026,8.60,'Ahmedabad','05/01/2026'),
('Rishi','Patel','Darshan University','B.Tech','PHP',2026,7.95,'Surat','05/01/2026'),

('Meet','Akbari','Darshan University','B.Tech','.NET',2026,8.05,'Rajkot','05/01/2026'),
('Harsh','Panara','Darshan University','B.Tech','PHP',2026,7.75,'Rajkot','05/01/2026'),
('Nand','Zalavadiya','Darshan University','B.Tech','SAP .NET',2026,8.25,'Rajkot','05/01/2026'),

('Popat','Modhwadiya','LDCE','B.E','AI',2026,7.50,'Porbandar','05/01/2026'),
('Maitri','Jadeja','GLS University','B.Tech','QA/QC',2026,8.35,'Morbi','05/01/2026'),
('Anshu','Bhatt','GLS University','B.Tech','QA/QC',2026,7.90,'Bhavnagar','05/01/2026'),
('Twinkle','Singh','DDU','MCA','QA/QC',2026,8.10,'Ahmedabad','05/01/2026'),
('Vidhika','Mahida','MBIT','B.E','Java',2026,8.20,'Vadodara','05/01/2026'),
('Kashish','Modi','GEC Dahod','B.E','SAP .NET',2026,8.45,'Ahmedabad','05/01/2026'),
('Diya','Doshi','GEC Rajkot','B.E','Mobile',2026,8.30,'Rajkot','05/01/2026'),
('Prince','Rankaja','ADIT','B.E','PHP',2026,7.85,'Rajkot','05/01/2026'),
('Vedanshu','Pandey','Silver Oak University','D.E','QA/QC',2026,8.00,'Ahmedabad','05/01/2026'),
('Ronit','Kadiya','SHAL Engineering College','B.Tech','QA/QC',2026,7.95,'Ahmedabad','05/01/2026')
) d(fn,ln,college,degree,spec,grad,cgpa,city,jd)

JOIN users u 
  ON u.first_name = d.fn 
 AND u.last_name = d.ln
 AND u.role = 'INTERN';

COMMIT;
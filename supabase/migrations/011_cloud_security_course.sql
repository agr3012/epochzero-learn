-- =====================================================================
-- Cloud Security Course — 6 unit MCQ tests + 1 final comprehensive exam
-- Source: Cloud Security MCQ Bank, Ashish Revar, SITAICS RRU, 2026
-- Each chapter test: 20 questions, 30 min, 60% pass.
-- Final test: all 120 questions copied from chapter tests, 120 min.
-- Run in Supabase SQL Editor after 010_points_leaderboard.sql.
-- =====================================================================

alter table public.test_questions
  add column if not exists ebook_reference text;

do $cloud_sec$
declare
  v_course uuid;
  v_u1 uuid; v_u2 uuid; v_u3 uuid;
  v_u4 uuid; v_u5 uuid; v_u6 uuid;
  v_top1 uuid; v_top2 uuid; v_top3 uuid;
  v_top4 uuid; v_top5 uuid; v_top6 uuid;
  v_ch1 uuid; v_ch2 uuid; v_ch3 uuid;
  v_ch4 uuid; v_ch5 uuid; v_ch6 uuid;
  v_fin uuid;
begin

  -- ── COURSE ──────────────────────────────────────────────────────────
  insert into public.courses
    (slug, title, short_title, description, instructor, is_published, order_index)
  values (
    'cloud-security',
    'Cloud Security',
    'Cloud Security',
    'A comprehensive course covering cloud computing foundations, threats, controls, data protection, monitoring, and forensics — aligned with the SITAICS, RRU curriculum and the Cloud Security eBook 2026.',
    'Ashish Revar',
    true, 2
  ) on conflict (slug) do nothing;
  select id into v_course from public.courses where slug = 'cloud-security';

  -- ── UNITS ───────────────────────────────────────────────────────────
  insert into public.units
    (course_id, slug, title, unit_number, description, is_published, order_index)
  values
    (v_course, 'unit-1-foundations',
     'Foundations of Cloud Computing', 1,
     'NIST SP 800-145 characteristics, service and deployment models, shared responsibility model, virtualisation types, container security basics, and cloud migration strategies.',
     true, 1),
    (v_course, 'unit-2-threats',
     'Cloud Threats, Attacks and Privacy', 2,
     'CSA Top 10 cloud threats, SSRF and IMDS attack chain, IMDSv2, EDoS, man-in-the-cloud attacks, STRIDE, MITRE ATT&CK for Cloud, and Indian data residency requirements.',
     true, 2),
    (v_course, 'unit-3-controls',
     'Controls, Standards and Testing', 3,
     'CSA CCM v4, NIST CSF 2.0, ENISA, the five cloud security tool categories (CSPM, CWPP, CASB, CIEM, CSMV), and cloud penetration testing tools and methodology.',
     true, 3),
    (v_course, 'unit-4-data-protection',
     'Data Protection in the Cloud', 4,
     'Envelope encryption, AES modes, post-quantum cryptography (FIPS 203-206), tokenisation, redaction, PKI and certificate lifecycle, key management models, and IAM access control.',
     true, 4),
    (v_course, 'unit-5-monitoring',
     'Monitoring, Auditing and Compliance', 5,
     'Seven cloud log sources, CloudTrail, VPC Flow Logs, AWS Config, GuardDuty, Security Hub, SCPs, SEBI CSCRF 2024, CERT-In 2022, DPDP Act 2023, and RBI IT Framework.',
     true, 5),
    (v_course, 'unit-6-forensics',
     'Cloud Forensics and Incident Response', 6,
     'Three dimensions and roles of cloud forensics, CloudTrail forensic fields, EC2 preservation procedure, LiME memory acquisition, anti-forensics, Section 63 BSA 2023, Section 94 BNSS 2023, MLAT, forensic report structure, and tools.',
     true, 6)
  on conflict (course_id, unit_number) do nothing;

  select id into v_u1 from public.units where course_id = v_course and unit_number = 1;
  select id into v_u2 from public.units where course_id = v_course and unit_number = 2;
  select id into v_u3 from public.units where course_id = v_course and unit_number = 3;
  select id into v_u4 from public.units where course_id = v_course and unit_number = 4;
  select id into v_u5 from public.units where course_id = v_course and unit_number = 5;
  select id into v_u6 from public.units where course_id = v_course and unit_number = 6;

  -- ── TOPICS (one self-assessment topic per unit) ──────────────────────
  insert into public.topics
    (unit_id, slug, title, topic_number, description, is_published, order_index)
  values
    (v_u1, 'ch1-assessment', 'Chapter 1 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on cloud computing foundations.', true, 1),
    (v_u2, 'ch2-assessment', 'Chapter 2 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on cloud threats, attacks and privacy.', true, 1),
    (v_u3, 'ch3-assessment', 'Chapter 3 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on controls, standards and testing.', true, 1),
    (v_u4, 'ch4-assessment', 'Chapter 4 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on data protection in the cloud.', true, 1),
    (v_u5, 'ch5-assessment', 'Chapter 5 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on monitoring, auditing and compliance.', true, 1),
    (v_u6, 'ch6-assessment', 'Chapter 6 MCQ Self-Assessment', 1,
     '20 multiple-choice questions on cloud forensics and incident response.', true, 1)
  on conflict (unit_id, topic_number) do nothing;

  select id into v_top1 from public.topics where unit_id = v_u1 and topic_number = 1;
  select id into v_top2 from public.topics where unit_id = v_u2 and topic_number = 1;
  select id into v_top3 from public.topics where unit_id = v_u3 and topic_number = 1;
  select id into v_top4 from public.topics where unit_id = v_u4 and topic_number = 1;
  select id into v_top5 from public.topics where unit_id = v_u5 and topic_number = 1;
  select id into v_top6 from public.topics where unit_id = v_u6 and topic_number = 1;

  -- ── TESTS ───────────────────────────────────────────────────────────
  insert into public.tests
    (slug, title, description, duration_minutes, passing_score, total_questions,
     shuffle_questions, shuffle_options, is_published)
  values
    ('cloud-security-ch1', 'Ch. 1: Foundations of Cloud Computing',
     'NIST SP 800-145, service models, deployment models, shared responsibility, virtualisation, and migration strategies.',
     30, 60, 20, true, false, true),
    ('cloud-security-ch2', 'Ch. 2: Cloud Threats, Attacks and Privacy',
     'CSA Top 10, SSRF/IMDS, IMDSv2, EDoS, man-in-the-cloud, STRIDE, MITRE ATT&CK for Cloud, and data residency.',
     30, 60, 20, true, false, true),
    ('cloud-security-ch3', 'Ch. 3: Controls, Standards and Testing',
     'CSA CCM v4, NIST CSF 2.0, ENISA, CSPM, CWPP, CASB, CIEM, CSMV, and cloud penetration testing tools.',
     30, 60, 20, true, false, true),
    ('cloud-security-ch4', 'Ch. 4: Data Protection in the Cloud',
     'Envelope encryption, AES modes, post-quantum cryptography, tokenisation, PKI, key management models, and IAM.',
     30, 60, 20, true, false, true),
    ('cloud-security-ch5', 'Ch. 5: Monitoring, Auditing and Compliance',
     'CloudTrail, VPC Flow Logs, AWS Config, GuardDuty, Security Hub, SCPs, and Indian compliance frameworks.',
     30, 60, 20, true, false, true),
    ('cloud-security-ch6', 'Ch. 6: Cloud Forensics and Incident Response',
     'Cloud forensics dimensions, EC2 preservation, LiME, legal admissibility, and forensic tools.',
     30, 60, 20, true, false, true),
    ('cloud-security-final', 'Cloud Security: Complete Assessment',
     'Comprehensive 120-question assessment covering all six chapters of the Cloud Security eBook 2026.',
     120, 60, 120, true, false, true)
  on conflict (slug) do nothing;

  select id into v_ch1 from public.tests where slug = 'cloud-security-ch1';
  select id into v_ch2 from public.tests where slug = 'cloud-security-ch2';
  select id into v_ch3 from public.tests where slug = 'cloud-security-ch3';
  select id into v_ch4 from public.tests where slug = 'cloud-security-ch4';
  select id into v_ch5 from public.tests where slug = 'cloud-security-ch5';
  select id into v_ch6 from public.tests where slug = 'cloud-security-ch6';
  select id into v_fin from public.tests where slug = 'cloud-security-final';

  -- ── TOPIC ↔ TEST LINKS ────────────────────────────────────────────
  insert into public.topic_tests (topic_id, test_id, order_index) values
    (v_top1, v_ch1, 1), (v_top2, v_ch2, 1), (v_top3, v_ch3, 1),
    (v_top4, v_ch4, 1), (v_top5, v_ch5, 1), (v_top6, v_ch6, 1)
  on conflict (topic_id, test_id) do nothing;

  -- ================================================================
  -- CHAPTER 1 — FOUNDATIONS OF CLOUD COMPUTING (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch1) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch1,
     'Which NIST SP 800-145 characteristic allows users to provision compute, storage, or network resources without requiring human interaction from the service provider?',
     '["Broad network access","On-demand self-service","Resource pooling","Measured service"]',
     1, 'CO1', 2, 'easy', 'eBook Ch.1 -- NIST Characteristics, On-demand Self-service', 1),
    (v_ch1,
     'In which cloud service model does the provider manage the operating system, runtime, and middleware, while the customer manages only the application and data?',
     '["IaaS","SaaS","PaaS","FaaS"]',
     2, 'CO1', 2, 'easy', 'eBook Ch.1 -- Service Models, PaaS', 2),
    (v_ch1,
     'A company stores regulated financial data on its own on-premise servers and uses AWS for analytics workloads. This is best described as which deployment model?',
     '["Public cloud","Private cloud","Community cloud","Hybrid cloud"]',
     3, 'CO1', 2, 'easy', 'eBook Ch.1 -- Deployment Models, Hybrid Cloud', 3),
    (v_ch1,
     'Under the shared responsibility model for IaaS, which of the following is the cloud provider''s responsibility?',
     '["Application security","Data encryption at rest","OS patching on customer VMs","Physical security of the data centre hardware"]',
     3, 'CO1', 2, 'easy', 'eBook Ch.1 -- Shared Responsibility, Provider Obligations', 4),
    (v_ch1,
     'Which type of hypervisor runs directly on the physical hardware without requiring a host operating system?',
     '["Type-2 hypervisor","Type-1 hypervisor","Para-virtualised hypervisor","Container runtime"]',
     1, 'CO1', 2, 'easy', 'eBook Ch.1 -- Virtualisation, Type-1 Hypervisor', 5),
    (v_ch1,
     'From which VMware Workstation Pro version onward is no licence key required, following the November 2024 change?',
     '["v15.0.0","v16.0.0","v17.5.2","v18.0.0"]',
     2, 'CO1', 1, 'easy', 'eBook Ch.1 -- Virtualisation, VMware Workstation Pro Free', 6),
    (v_ch1,
     'Containers differ from virtual machines primarily because containers:',
     '["Provide stronger isolation than VMs","Share the host OS kernel","Require a Type-1 hypervisor to run","Cannot be deployed on public cloud infrastructure"]',
     1, 'CO1', 2, 'easy', 'eBook Ch.1 -- Virtualisation, Containers vs VMs', 7),
    (v_ch1,
     'The NIST "measured service" characteristic means that customers pay based on:',
     '["Number of users in the organisation","A fixed monthly subscription only","Actual resource consumption such as CPU-seconds or GB-months","The geographic location of the data centre"]',
     2, 'CO1', 1, 'easy', 'eBook Ch.1 -- NIST Characteristics, Measured Service', 8),
    (v_ch1,
     'Which migration approach moves a workload to the cloud with no changes to the application code?',
     '["Refactor","Replatform","Rehost","Rebuild"]',
     2, 'CO1', 1, 'easy', 'eBook Ch.1 -- Migration Strategies, Rehost', 9),
    (v_ch1,
     'India''s NIC MeghRaj (GI Cloud) is an example of which cloud deployment model?',
     '["Public cloud","Private cloud","Community cloud","Hybrid cloud"]',
     2, 'CO1', 1, 'easy', 'eBook Ch.1 -- Deployment Models, Community Cloud', 10),
    (v_ch1,
     'A developer deploys code on AWS Lambda that runs only when triggered by an API call. Which service model does this represent?',
     '["IaaS","PaaS","SaaS","FaaS"]',
     3, 'CO1', 2, 'easy', 'eBook Ch.1 -- Service Models, FaaS', 11),
    (v_ch1,
     'The "resource pooling" NIST characteristic creates which primary security risk for cloud tenants?',
     '["Increased storage cost","Cross-tenant data isolation failure","Inability to scale resources on demand","Loss of network connectivity"]',
     1, 'CO1', 2, 'easy', 'eBook Ch.1 -- NIST Characteristics, Resource Pooling Risk', 12),
    (v_ch1,
     'Under the shared responsibility model for SaaS, which of the following remains the customer''s responsibility?',
     '["Patching the application server","Managing the database engine","Governing who accesses the data","Maintaining the network infrastructure"]',
     2, 'CO1', 2, 'easy', 'eBook Ch.1 -- Shared Responsibility, Customer Obligations in SaaS', 13),
    (v_ch1,
     'The "rapid elasticity" characteristic enables which cloud-specific attack?',
     '["SQL injection","Man-in-the-Cloud","Economic Denial of Sustainability (EDoS)","ARP spoofing"]',
     2, 'CO1', 3, 'medium', 'eBook Ch.1 -- NIST Characteristics, Rapid Elasticity and EDoS', 14),
    (v_ch1,
     'The replatform migration approach differs from rehost in that replatform:',
     '["Makes no changes to the application code whatsoever","Rebuilds the entire application from scratch as cloud-native","Adopts some managed cloud services while keeping core code","Moves the application to a private cloud only"]',
     2, 'CO1', 2, 'easy', 'eBook Ch.1 -- Migration Strategies, Replatform', 15),
    (v_ch1,
     'Which hardware technology enables Type-1 hypervisors to run multiple operating systems with near-native CPU performance?',
     '["BIOS legacy mode","Intel VT-x and AMD-V","ACPI power management","PCIe passthrough only"]',
     1, 'CO1', 1, 'easy', 'eBook Ch.1 -- Virtualisation, Hardware-Assisted Virtualisation', 16),
    (v_ch1,
     'Which of the following correctly identifies the OS patching responsibility under the shared responsibility model for an EC2 instance (IaaS)?',
     '["AWS, because the workload runs in their data centre","The customer, because OS patching is customer-owned in IaaS","Neither party; it is covered by the SLA","AWS, if the CVE was present before the migration"]',
     1, 'CO1', 2, 'easy', 'eBook Ch.1 -- Shared Responsibility, IaaS OS Patching', 17),
    (v_ch1,
     '"Broad network access" as defined by NIST SP 800-145 means cloud services are accessible:',
     '["Only via dedicated private leased lines","Over standard network protocols from any device","Exclusively from within the provider''s data centre","Only from devices enrolled in the provider''s MDM"]',
     1, 'CO1', 1, 'easy', 'eBook Ch.1 -- NIST Characteristics, Broad Network Access', 18),
    (v_ch1,
     'Which Proxmox VE component provides OS-level virtualisation using Linux containers?',
     '["KVM","QEMU","LXC","Docker"]',
     2, 'CO1', 1, 'easy', 'eBook Ch.1 -- Virtualisation, Proxmox VE, LXC', 19),
    (v_ch1,
     'The "root-shell test" for cloud service models asks whether you can SSH into the server as root. A YES answer indicates which service model?',
     '["SaaS","PaaS","FaaS","IaaS"]',
     3, 'CO1', 2, 'easy', 'eBook Ch.1 -- Service Models, Root-Shell Test', 20);
  end if;

  -- ================================================================
  -- CHAPTER 2 — CLOUD THREATS, ATTACKS AND PRIVACY (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch2) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch2,
     'According to the CSA Top 10 cloud threats (2024), which category ranks first and is a customer-side failure?',
     '["Cloud service provider security failure","Misconfiguration and inadequate change control","Insecure third-party resources","Abuse and nefarious use of cloud services"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- CSA Top Threats, Misconfiguration', 1),
    (v_ch2,
     'In an SSRF attack targeting the AWS Instance Metadata Service, the attacker sends a request to which IP address?',
     '["10.0.0.1","192.168.1.1","169.254.169.254","172.16.0.1"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.2 -- SSRF and IMDS, Metadata IP', 2),
    (v_ch2,
     'IMDSv2 prevents most SSRF-based IMDS attacks by requiring which additional step before any metadata GET succeeds?',
     '["A DNS lookup of the metadata hostname","A PUT request to obtain a session token","A TLS certificate from the IAM role","An MFA code from the IAM user"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- IMDSv2, Session Token PUT', 3),
    (v_ch2,
     'An Economic Denial of Sustainability (EDoS) attack on a cloud workload aims to:',
     '["Block all network access to the application","Trigger autoscaling to inflate the cloud bill","Encrypt data stored in cloud object storage","Steal IAM credentials via phishing"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- DDoS and EDoS, EDoS Definition', 4),
    (v_ch2,
     'A man-in-the-cloud (MITC) attack gains persistent access to cloud storage services by stealing:',
     '["Username and password","An MFA one-time code","A synchronisation token","An SSH private key"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.2 -- Service Hijacking, Sync Token', 5),
    (v_ch2,
     'In the STRIDE threat model, an attacker disabling AWS CloudTrail falls under which category?',
     '["Spoofing","Tampering","Repudiation","Denial of service"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.2 -- STRIDE, Repudiation', 6),
    (v_ch2,
     'The Tesla 2018 Kubernetes cryptojacking breach occurred because:',
     '["An SSH key was leaked on GitHub","The Kubernetes dashboard had no authentication","A container image contained a backdoor","An IAM policy allowed public S3 access"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- Real-World Cases, Tesla Kubernetes', 7),
    (v_ch2,
     'The root cause that amplified the damage in the Capital One 2019 breach, beyond the SSRF vulnerability itself, was:',
     '["A missing MFA on the root account","An over-privileged IAM role attached to the WAF instance","Public S3 Block Public Access being disabled","CloudTrail being disabled in us-east-1"]',
     1, 'CO2', 3, 'medium', 'eBook Ch.2 -- SSRF and IMDS, Capital One IAM', 8),
    (v_ch2,
     'Which MITRE ATT&CK for Cloud technique describes an attacker using iam:PassRole to gain elevated access to AWS services?',
     '["Initial Access -- Phishing","Discovery -- Cloud Service Discovery","Privilege Escalation -- Abuse Elevation Control Mechanism","Exfiltration -- Transfer Data to Cloud Account"]',
     2, 'CO2', 3, 'medium', 'eBook Ch.2 -- MITRE ATT&CK, iam:PassRole Privilege Escalation', 9),
    (v_ch2,
     'An L7 (application-layer) DDoS attack is hardest to distinguish from legitimate traffic because:',
     '["It uses spoofed source IP addresses","The HTTP requests appear to come from real browsers","It operates at the IP protocol level","It saturates the physical network link"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- DDoS and EDoS, L7 Attack', 10),
    (v_ch2,
     'The CERT-In direction (April 2022) requires organisations to report cybersecurity incidents within:',
     '["24 hours","12 hours","6 hours","48 hours"]',
     2, 'CO2', 1, 'easy', 'eBook Ch.2 -- Data Residency, CERT-In 2022', 11),
    (v_ch2,
     'Data residency refers to:',
     '["The encryption algorithm used to protect stored data","The physical or legal jurisdiction where data is stored","The process of archiving old data to cold storage","The policy for deleting personal data on request"]',
     1, 'CO2', 1, 'easy', 'eBook Ch.2 -- Data Residency, Definition', 12),
    (v_ch2,
     'In a Slowloris DDoS attack, the attacker:',
     '["Floods the target with maximum-bandwidth UDP packets","Holds thousands of HTTP connections open by sending partial headers","Amplifies traffic using DNS reflection","Exploits a SQL injection vulnerability on the web server"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- DDoS and EDoS, Slowloris', 13),
    (v_ch2,
     'Under the STRIDE model, an attacker modifying an S3 bucket policy to allow public write access violates which security property?',
     '["Authentication","Integrity","Non-repudiation","Authorisation"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- STRIDE, Tampering', 14),
    (v_ch2,
     'When applying MITRE ATT&CK for Cloud, calling DescribeInstances across all 60 AWS regions immediately after gaining access maps to which tactic?',
     '["Persistence","Privilege Escalation","Discovery","Exfiltration"]',
     2, 'CO2', 3, 'medium', 'eBook Ch.2 -- MITRE ATT&CK, Discovery Tactic', 15),
    (v_ch2,
     'The US CLOUD Act can compel disclosure of data stored in AWS Mumbai (ap-south-1) because:',
     '["Data at a US-headquartered provider is subject to US law orders","AWS Mumbai is physically located in the United States","The CLOUD Act applies only to data in transit","The CLOUD Act covers only government-owned cloud accounts"]',
     0, 'CO2', 2, 'easy', 'eBook Ch.2 -- Data Residency, CLOUD Act', 16),
    (v_ch2,
     'Which CSA Top 10 threat is most directly addressed by enabling MFA on all IAM accounts?',
     '["System vulnerabilities","Insecure interfaces and APIs","IAM, credentials, access, and key management","Accidental cloud data disclosure"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.2 -- CSA Top Threats, IAM and Credentials', 17),
    (v_ch2,
     'The SolarWinds 2020 supply-chain attack demonstrated that:',
     '["Cloud providers can be held liable for software vulnerabilities","Digitally signed software updates can still carry malicious payloads","MFA prevents all forms of supply-chain attacks","The attack was specific to on-premise environments only"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.2 -- Real-World Cases, SolarWinds', 18),
    (v_ch2,
     'An attacker who steals a Dropbox sync token and uses it from a remote server can access files even though:',
     '["The user has MFA enabled on the Dropbox account","The employee''s Dropbox password has been changed","The endpoint has endpoint detection and response installed","Both (a) and (b)"]',
     3, 'CO2', 3, 'medium', 'eBook Ch.2 -- Service Hijacking, MITC and MFA', 19),
    (v_ch2,
     'An attacker who creates a new IAM user with admin permissions at 3 AM after compromising an access key is using which MITRE ATT&CK tactic?',
     '["Discovery","Persistence","Lateral Movement","Defence Evasion"]',
     1, 'CO2', 3, 'medium', 'eBook Ch.2 -- MITRE ATT&CK, Persistence Tactic', 20);
  end if;

  -- ================================================================
  -- CHAPTER 3 — CONTROLS, STANDARDS AND TESTING (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch3) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch3,
     'How many controls does CSA Cloud Controls Matrix (CCM) version 4 contain?',
     '["114","133","197","220"]',
     2, 'CO2', 1, 'easy', 'eBook Ch.3 -- CSA CCM, 197 Controls', 1),
    (v_ch3,
     'Which function was added to NIST CSF in version 2.0 that was not present in version 1.1?',
     '["Identify","Protect","Recover","Govern"]',
     3, 'CO2', 1, 'easy', 'eBook Ch.3 -- NIST CSF 2.0, Govern Function', 2),
    (v_ch3,
     'The correct clockwise order of the five NIST CSF 2.0 operational functions (excluding Govern) is:',
     '["Identify → Detect → Protect → Respond → Recover","Identify → Protect → Detect → Respond → Recover","Protect → Identify → Detect → Respond → Recover","Identify → Protect → Respond → Detect → Recover"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- NIST CSF 2.0, Correct Cycle Order', 3),
    (v_ch3,
     'CSPM (Cloud Security Posture Management) primarily addresses which type of risk?',
     '["Runtime container escape attacks","SaaS data exfiltration by insiders","Cloud resource misconfiguration","IAM over-permission across cloud providers"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.3 -- Cloud Security Tools, CSPM', 4),
    (v_ch3,
     'Which cloud security tool category monitors workload behaviour at runtime to detect anomalies such as unexpected process execution inside a container?',
     '["CSPM","CASB","CWPP","CIEM"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.3 -- Cloud Security Tools, CWPP', 5),
    (v_ch3,
     'A CASB deployed in inline mode can:',
     '["Detect misconfigurations in cloud provider configurations","Block data exfiltration in real time","Enumerate all IAM permissions across cloud accounts","Scan container images for CVEs before deployment"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- Cloud Security Tools, CASB Inline Mode', 6),
    (v_ch3,
     'CIEM (Cloud Infrastructure Entitlements Management) is specifically designed to address:',
     '["Container image supply-chain vulnerabilities","Undetected SaaS data exfiltration","IAM over-permission and privilege accumulation","Runtime malware execution in serverless functions"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.3 -- Cloud Security Tools, CIEM', 7),
    (v_ch3,
     'CSMV differs from CSPM in that CSMV also addresses:',
     '["SaaS governance and data classification","Known CVEs in running workloads and container images","Cross-cloud IAM entitlement reviews","User behaviour analytics for insider threats"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- Cloud Security Tools, CSMV vs CSPM', 8),
    (v_ch3,
     'Which open-source tool performs CIS benchmark audits against AWS account configurations?',
     '["Pacu","CloudGoat","ScoutSuite","Prowler"]',
     3, 'CO2', 2, 'easy', 'eBook Ch.3 -- Pentesting, Prowler', 9),
    (v_ch3,
     'Pacu is used in cloud penetration testing primarily for:',
     '["Container image vulnerability scanning","Network packet capture and analysis","AWS IAM enumeration and privilege escalation testing","Static analysis of Terraform configurations"]',
     2, 'CO2', 3, 'medium', 'eBook Ch.3 -- Pentesting, Pacu', 10),
    (v_ch3,
     'CloudGoat is best described as:',
     '["A Kubernetes runtime security tool","A vulnerable-by-design AWS environment for attack practice","A CIS benchmark auditing tool","A multi-cloud configuration assessment tool"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- Pentesting, CloudGoat', 11),
    (v_ch3,
     'Checkov is a static analysis tool used to scan:',
     '["Running EC2 instances for known CVEs","IAM policies for excessive permissions","Infrastructure-as-Code files such as Terraform templates","Container images for malware"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.3 -- Pentesting, Checkov', 12),
    (v_ch3,
     'The CSA STAR registry provides cloud customers with:',
     '["Mandatory certification required by all regulators globally","Publicly available self-assessments and third-party audits of providers","Penetration testing reports for cloud providers","A list of known cloud provider data breaches"]',
     1, 'CO2', 1, 'easy', 'eBook Ch.3 -- CSA CCM, STAR Registry', 13),
    (v_ch3,
     'Which cloud penetration testing activity is universally prohibited by all major cloud providers, even with prior written permission?',
     '["Social engineering tests against provider employees","Testing S3 bucket access control configurations","Privilege escalation testing using compromised IAM credentials","DDoS testing against the provider''s infrastructure"]',
     3, 'CO2', 2, 'easy', 'eBook Ch.3 -- Pentesting, Rules of Engagement', 14),
    (v_ch3,
     'A NIST CSF 2.0 Tier 2 (Risk Informed) organisation:',
     '["Has no security programme in place","Has approved risk practices but applies them inconsistently","Has fully automated threat detection and response","Has integrated security into all business processes consistently"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- NIST CSF 2.0, Implementation Tiers', 15),
    (v_ch3,
     'The ENISA cloud risk taxonomy categorises cloud risks across which three dimensions?',
     '["Technical, organisational, legal","Confidentiality, integrity, availability","People, process, technology","Preventive, detective, corrective"]',
     0, 'CO2', 1, 'easy', 'eBook Ch.3 -- ENISA, Risk Taxonomy Dimensions', 16),
    (v_ch3,
     'ScoutSuite is best described as:',
     '["An offensive AWS exploitation framework","A multi-cloud security configuration assessment tool","A container runtime security monitor","A SIEM for centralised log analysis"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- Pentesting, ScoutSuite', 17),
    (v_ch3,
     'The 4Cs cloud security model covers which four layers?',
     '["Code, Container, Cluster, Cloud","Code, Compute, Connectivity, Compliance","Container, Config, Certificate, Cloud","Cluster, Config, Compliance, Code"]',
     0, 'CO2', 1, 'easy', 'eBook Ch.3 -- Cloud Security Tools, 4Cs Model', 18),
    (v_ch3,
     'In NIST CSF 2.0, the "Protect" function primarily covers:',
     '["Detecting anomalies and security events","Restoring services after an incident","Implementing safeguards including IAM, data security, and hardening","Identifying assets, risks, and business context"]',
     2, 'CO2', 2, 'easy', 'eBook Ch.3 -- NIST CSF 2.0, Protect Function', 19),
    (v_ch3,
     'A cloud provider achieves CSA STAR Level 2 certification by:',
     '["Completing a self-assessment questionnaire only","Undergoing a third-party audit based on CSA CCM controls","Receiving ISO 27001 certification alone","Publishing annual penetration test results publicly"]',
     1, 'CO2', 2, 'easy', 'eBook Ch.3 -- CSA CCM, STAR Level 2', 20);
  end if;

  -- ================================================================
  -- CHAPTER 4 — DATA PROTECTION IN THE CLOUD (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch4) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch4,
     'In envelope encryption, the data encryption key (DEK) after encrypting the data is:',
     '["Stored in plaintext alongside the ciphertext","Generated by the application without using KMS","Encrypted using a master key and stored alongside the ciphertext","Derived from the user''s password using PBKDF2"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Envelope Encryption, DEK Storage', 1),
    (v_ch4,
     'Which AES mode provides authenticated encryption by combining encryption with an integrity check (authentication tag)?',
     '["AES-ECB","AES-CBC","AES-CTR","AES-GCM"]',
     3, 'CO3', 2, 'easy', 'eBook Ch.4 -- Encryption Fundamentals, AES-GCM', 2),
    (v_ch4,
     'NIST FIPS 203, finalised in 2024, specifies which post-quantum cryptographic algorithm?',
     '["CRYSTALS-Dilithium (ML-DSA)","CRYSTALS-Kyber (ML-KEM)","SPHINCS+ (SLH-DSA)","FALCON (FN-DSA)"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Post-Quantum Cryptography, FIPS 203 ML-KEM', 3),
    (v_ch4,
     'The "harvest now, decrypt later" attack most immediately threatens which class of algorithm?',
     '["AES-256 symmetric encryption","SHA-256 hashing","RSA and ECDH key exchange","HMAC message authentication"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Post-Quantum Cryptography, HNDL Threat', 4),
    (v_ch4,
     'In the BYOK (Bring Your Own Key) model, who generates the encryption key?',
     '["The cloud provider","The HSM manufacturer","The customer","A third-party certificate authority"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Key Management, BYOK', 5),
    (v_ch4,
     'OCSP (Online Certificate Status Protocol) differs from CRL in that OCSP:',
     '["Lists all valid certificates rather than revoked ones","Provides real-time status of a specific certificate","Requires downloading a complete list from the CA","Only works with Extended Validation (EV) certificates"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- PKI and Certificates, OCSP vs CRL', 6),
    (v_ch4,
     'Which AWS IAM access control model grants permissions based on resource tags and user attributes rather than static role membership?',
     '["RBAC","DAC","ABAC","MAC"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- IAM and Access Control, ABAC', 7),
    (v_ch4,
     'Format-preserving tokenisation for a 16-digit credit card number produces a token that:',
     '["Is mathematically reversible using public key cryptography","Looks like a 16-digit number but maps to the original via a vault","Is a random UUID with no format relationship to the original","Encrypts the card number using AES-256-CBC"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Tokenisation, Format-Preserving Tokenisation', 8),
    (v_ch4,
     'NIST FIPS 204, finalised in 2024, specifies which post-quantum algorithm recommended for digital signatures?',
     '["ML-KEM (CRYSTALS-Kyber)","ML-DSA (CRYSTALS-Dilithium)","SLH-DSA (SPHINCS+)","FN-DSA (FALCON)"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Post-Quantum Cryptography, FIPS 204 ML-DSA', 9),
    (v_ch4,
     'JIT (Just-In-Time) access control reduces the risk of privilege abuse by:',
     '["Assigning permanent admin roles to all engineers","Requiring MFA for every API call","Granting elevated permissions only for a specific time window","Using resource tags to limit S3 access"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- IAM and Access Control, JIT', 10),
    (v_ch4,
     'The primary security risk of reusing the same IV in AES-GCM is:',
     '["Increased computational overhead for the decryptor","An attacker can recover plaintext from two ciphertexts","The authentication tag length is reduced to 64 bits","The effective key length is halved"]',
     1, 'CO3', 3, 'medium', 'eBook Ch.4 -- Encryption Fundamentals, IV Reuse in GCM', 11),
    (v_ch4,
     'HYOK (Hold Your Own Key) differs from BYOK in that with HYOK:',
     '["The customer imports the key into the provider''s KMS","The customer holds the key in their own HSM and the provider never has access","The key is shared equally between customer and provider","The provider generates the key and shares it with the customer"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Key Management, HYOK', 12),
    (v_ch4,
     'Grover''s algorithm on a quantum computer reduces the effective security strength of AES-256 to:',
     '["64 bits","128 bits","192 bits","256 bits"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Post-Quantum Cryptography, Grover and AES-256', 13),
    (v_ch4,
     'An AWS KMS Customer Managed Key enters "pending deletion" status. The minimum deletion window before permanent destruction is:',
     '["1 day","3 days","7 days","30 days"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Key Management, KMS Pending Deletion Window', 14),
    (v_ch4,
     'Which data protection technique replaces sensitive data with a fixed mask (e.g., ****) from which the original value cannot be recovered?',
     '["Encryption","Tokenisation","Redaction","Obfuscation"]',
     2, 'CO3', 1, 'easy', 'eBook Ch.4 -- Tokenisation and Redaction, Redaction', 15),
    (v_ch4,
     'The PKI trust hierarchy runs in which order?',
     '["End-entity certificate → Intermediate CA → Root CA","Root CA → Intermediate CA → End-entity certificate","Intermediate CA → Root CA → End-entity certificate","End-entity certificate → Root CA → Intermediate CA"]',
     1, 'CO3', 1, 'easy', 'eBook Ch.4 -- PKI and Certificates, Trust Hierarchy', 16),
    (v_ch4,
     'The RBI tokenisation directive (2022) applies to which type of transaction in India?',
     '["Internet banking login credentials","Card-on-file transactions at merchant websites","NEFT and RTGS bank transfers","Aadhaar-based authentication"]',
     1, 'CO3', 2, 'easy', 'eBook Ch.4 -- Tokenisation, RBI Tokenisation Directive', 17),
    (v_ch4,
     'The AWS IAM permission iam:PassRole is considered dangerous because it allows a user to:',
     '["Delete IAM roles permanently","Assign a higher-privileged IAM role to an AWS service or resource","Export all IAM policies to a CSV file","Bypass MFA requirements for IAM operations"]',
     1, 'CO3', 3, 'medium', 'eBook Ch.4 -- IAM and Access Control, iam:PassRole', 18),
    (v_ch4,
     'AES-256-XTS is specifically designed for which use case?',
     '["TLS record layer encryption","Cloud object storage encryption","Full-disk encryption","Database column-level encryption"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Encryption Fundamentals, AES-256-XTS', 19),
    (v_ch4,
     'The AWS KMS GenerateDataKey API call returns:',
     '["Only the encrypted data key","Only the plaintext data key","Both the plaintext data key and the encrypted data key","The master key in plaintext"]',
     2, 'CO3', 2, 'easy', 'eBook Ch.4 -- Envelope Encryption, GenerateDataKey API', 20);
  end if;

  -- ================================================================
  -- CHAPTER 5 — MONITORING, AUDITING AND COMPLIANCE (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch5) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch5,
     'Which AWS service records every management-plane API call made in an AWS account across all regions?',
     '["Amazon CloudWatch","Amazon GuardDuty","AWS CloudTrail","AWS Config"]',
     2, 'CO4', 1, 'easy', 'eBook Ch.5 -- Logging and Monitoring, CloudTrail', 1),
    (v_ch5,
     'VPC Flow Logs record which information at the network interface level?',
     '["Full HTTP request and response content","Accepted and rejected IP traffic flows","DNS query names and resolver responses","IAM role assumption events"]',
     1, 'CO4', 1, 'easy', 'eBook Ch.5 -- Logging and Monitoring, VPC Flow Logs', 2),
    (v_ch5,
     'SEBI CSCRF (2024) explicitly requires capital markets intermediaries to have which cloud-specific plan?',
     '["A plan for migrating to a single cloud provider","A documented vendor exit strategy","A policy prohibiting public cloud for all workloads","A plan for encrypting data with HYOK"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- Compliance Frameworks, SEBI CSCRF 2024', 3),
    (v_ch5,
     'The 4Cs cloud security model for containerised applications stands for:',
     '["Code, Container, Cluster, Cloud","Container, Config, Compliance, Cloud","Code, Compute, Connectivity, Compliance","Certificate, Container, Cluster, Compliance"]',
     0, 'CO4', 1, 'easy', 'eBook Ch.5 -- Container Security, 4Cs Model', 4),
    (v_ch5,
     'Which Kubernetes admission controller can enforce policies such as blocking container images that are not from an approved registry?',
     '["Falco","Trivy","Kyverno","Grype"]',
     2, 'CO4', 2, 'easy', 'eBook Ch.5 -- Kubernetes Security, Kyverno', 5),
    (v_ch5,
     'Amazon GuardDuty primarily uses which data sources to generate threat findings?',
     '["Application logs and database query logs","CloudTrail, VPC Flow Logs, and DNS query logs","OS-level system calls and file integrity monitoring","Container runtime events and EKS audit logs only"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- AWS Governance, GuardDuty Data Sources', 6),
    (v_ch5,
     'AWS Service Control Policies (SCPs) differ from IAM policies in that SCPs:',
     '["Grant permissions to individual IAM users","Apply only to S3 bucket policies","Set maximum permission boundaries for entire AWS accounts or OUs","Can be attached to individual EC2 instances"]',
     2, 'CO4', 2, 'easy', 'eBook Ch.5 -- AWS Governance, SCPs vs IAM Policies', 7),
    (v_ch5,
     'CloudTrail S3 data events (e.g., GetObject, PutObject) are:',
     '["Enabled by default in all AWS accounts","Not available in CloudTrail at all","Only available in AWS GovCloud regions","Not enabled by default and must be explicitly configured"]',
     3, 'CO4', 2, 'easy', 'eBook Ch.5 -- Logging and Monitoring, CloudTrail Data Events', 8),
    (v_ch5,
     'The kube-bench tool is used to:',
     '["Scan container images for known CVEs","Audit a Kubernetes cluster against the CIS Kubernetes Benchmark","Monitor container runtime behaviour using eBPF","Generate SBOMs for Kubernetes deployments"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- Kubernetes Security, kube-bench', 9),
    (v_ch5,
     'Which AWS service continuously monitors resource configurations and evaluates them against desired-state compliance rules?',
     '["Amazon GuardDuty","AWS Security Hub","AWS Config","AWS Inspector"]',
     2, 'CO4', 2, 'easy', 'eBook Ch.5 -- AWS Governance, AWS Config', 10),
    (v_ch5,
     'Under the DPDP Act 2023, a data fiduciary that suffers a personal data breach must notify:',
     '["Only the affected data principals directly","The Data Protection Board of India","CERT-In within 6 hours","SEBI and RBI simultaneously"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- Compliance Frameworks, DPDP Act 2023', 11),
    (v_ch5,
     'An S3 bucket with Object Lock in Compliance mode cannot have its objects deleted by:',
     '["AWS root account users of the logging account","IAM admin users in the account","Any user, including root, before the retention period expires","Users with an explicit s3:DeleteObject permission"]',
     2, 'CO4', 2, 'easy', 'eBook Ch.5 -- Logging and Monitoring, S3 Object Lock', 12),
    (v_ch5,
     'Falco is a cloud-native runtime security tool that detects threats using:',
     '["Static analysis of container images at build time","Kubernetes network policies","eBPF-based kernel system call monitoring","CloudTrail log analysis"]',
     2, 'CO4', 2, 'easy', 'eBook Ch.5 -- Container Security, Falco', 13),
    (v_ch5,
     'Which AWS service aggregates security findings from GuardDuty, Inspector, Macie, and other tools into a single view?',
     '["AWS CloudTrail","AWS Config","Amazon CloudWatch","AWS Security Hub"]',
     3, 'CO4', 2, 'easy', 'eBook Ch.5 -- AWS Governance, Security Hub', 14),
    (v_ch5,
     'Trivy is used in cloud security pipelines to:',
     '["Audit Kubernetes RBAC configurations","Scan container images and IaC files for vulnerabilities","Monitor Lambda function execution for anomalies","Test S3 bucket permissions against public access"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- Container Security, Trivy', 15),
    (v_ch5,
     'Under the RBI IT Framework, Indian banks using cloud services must:',
     '["Store all data exclusively in public cloud","Ensure customer financial data is localised in India","Use only government-operated cloud providers","Obtain RBI approval for every individual cloud deployment"]',
     1, 'CO4', 2, 'easy', 'eBook Ch.5 -- Compliance Frameworks, RBI IT Framework', 16),
    (v_ch5,
     'A Kubernetes pod with hostNetwork: true is a security risk because:',
     '["It cannot communicate with other pods in the cluster","It shares the node''s network namespace, exposing host services","It runs without any resource limits applied","It bypasses Kubernetes RBAC controls entirely"]',
     1, 'CO4', 3, 'medium', 'eBook Ch.5 -- Kubernetes Security, hostNetwork Risk', 17),
    (v_ch5,
     'Which of the following correctly states what GuardDuty can do if CloudTrail is disabled by an attacker?',
     '["GuardDuty stops functioning entirely without CloudTrail","GuardDuty continues detecting threats using its own independent data sources","GuardDuty automatically re-enables CloudTrail","GuardDuty alerts CERT-In directly on CloudTrail disablement"]',
     1, 'CO4', 3, 'medium', 'eBook Ch.5 -- AWS Governance, GuardDuty Independence', 18),
    (v_ch5,
     'Repeated AccessDenied errors in CloudTrail from the same IAM identity most likely indicate:',
     '["A misconfigured IAM policy that is too restrictive","An attacker enumerating permissions to find exploitable ones","A software bug causing invalid API calls","A KMS key that has been deleted"]',
     1, 'CO4', 3, 'medium', 'eBook Ch.5 -- Logging and Monitoring, AccessDenied Enumeration', 19),
    (v_ch5,
     'The CERT-In April 2022 direction creates a tension with the DPDP Act 2023 right to erasure because:',
     '["A customer requesting data deletion may have PII in mandatory security logs","Log retention costs exceed the organisation''s security budget","GuardDuty findings reference deleted customer data","CloudTrail logs are stored in a different region from the data"]',
     0, 'CO4', 3, 'medium', 'eBook Ch.5 -- Compliance Frameworks, DPDP vs CERT-In Tension', 20);
  end if;

  -- ================================================================
  -- CHAPTER 6 — CLOUD FORENSICS AND INCIDENT RESPONSE (20 questions)
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_ch6) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    values
    (v_ch6,
     'NIST IR 8006 defines cloud forensics across three dimensions. Which of the following is NOT one of them?',
     '["Technical","Organisational","Legal","Financial"]',
     3, 'CO5', 1, 'easy', 'eBook Ch.6 -- Cloud Forensics Fundamentals, Three Dimensions', 1),
    (v_ch6,
     'When a cloud environment is used by attackers as attack infrastructure (e.g., renting EC2 instances for a botnet), the cloud is playing which forensic role?',
     '["Cloud as victim","Cloud as tool","Cloud as witness","Cloud as evidence"]',
     1, 'CO5', 2, 'easy', 'eBook Ch.6 -- Cloud Forensics Fundamentals, Cloud as Tool', 2),
    (v_ch6,
     'What is the correct first step when preserving a compromised EC2 instance for forensic investigation?',
     '["Take an EBS snapshot immediately","Terminate the instance to prevent further damage","Attach a quarantine security group to isolate network access","Capture a memory dump using LiME"]',
     2, 'CO5', 3, 'medium', 'eBook Ch.6 -- Forensic Acquisition, Preservation Order', 3),
    (v_ch6,
     'The LiME (Linux Memory Extractor) tool is used in cloud forensics to:',
     '["Extract filesystem artefacts from EBS volume snapshots","Capture a full memory image from a running Linux instance","Analyse network flow logs from VPC Traffic Mirror","Generate a unified timeline from multiple cloud log sources"]',
     1, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Acquisition, LiME', 4),
    (v_ch6,
     'Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023 replaces which predecessor provision for electronic evidence admissibility?',
     '["Section 91 of the CrPC","Section 43A of the IT Act 2000","Section 65B of the Indian Evidence Act","Section 66 of the IT Act 2000"]',
     2, 'CO5', 1, 'easy', 'eBook Ch.6 -- Legal Admissibility, Section 63 BSA 2023', 5),
    (v_ch6,
     'The Supreme Court case that made the Section 65B certificate (now Section 63 BSA 2023) mandatory for electronic evidence was:',
     '["Shreya Singhal v. Union of India (2015)","Anvar P.V. v. P.K. Basheer (2014)","Puttaswamy v. Union of India (2017)","Shafhi Mohammad v. State of Himachal Pradesh (2018)"]',
     1, 'CO5', 1, 'easy', 'eBook Ch.6 -- Legal Admissibility, Anvar P.V. v. P.K. Basheer', 6),
    (v_ch6,
     'Section 94 of the BNSS 2023 replaced which provision for compelling production of electronic records from a cloud provider''s Indian entity?',
     '["Section 65B of the Indian Evidence Act","Section 43 of the IT Act 2000","Section 91 of the CrPC","Section 69 of the IT Act 2000"]',
     2, 'CO5', 1, 'easy', 'eBook Ch.6 -- Legal Admissibility, Section 94 BNSS 2023', 7),
    (v_ch6,
     'An attacker with admin access disables CloudTrail and deletes GuardDuty. Which structural control ensures forensic evidence is still available?',
     '["Enabling AWS Inspector on all EC2 instances","S3 Object Lock (Compliance mode) in a separate dedicated logging account","Increasing CloudWatch log retention to 365 days","Enabling VPC Flow Logs at the subnet level"]',
     1, 'CO5', 3, 'medium', 'eBook Ch.6 -- Anti-Forensics, S3 Object Lock Defence', 8),
    (v_ch6,
     'The Plaso / log2timeline tool is used in cloud forensics to:',
     '["Acquire a memory image from a running EC2 instance","Scan EBS volume snapshots for malware signatures","Create a unified super-timeline from multiple log sources","Analyse network packets captured by VPC Traffic Mirror"]',
     2, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Acquisition, Plaso / log2timeline', 9),
    (v_ch6,
     'In a CloudTrail event, the userIdentity.arn field reveals:',
     '["The geographic location of the API call originator","The IAM identity that made the API call","The name of the S3 bucket accessed","The ARN of the affected resource"]',
     1, 'CO5', 2, 'easy', 'eBook Ch.6 -- CloudTrail Forensics, userIdentity.arn', 10),
    (v_ch6,
     'An MLAT (Mutual Legal Assistance Treaty) request for cloud data typically takes how long to process?',
     '["24 to 48 hours","1 to 2 weeks","1 to 3 months","12 to 18 months"]',
     3, 'CO5', 1, 'easy', 'eBook Ch.6 -- Legal Admissibility, MLAT Timeline', 11),
    (v_ch6,
     'CloudTrail digest files are used in forensic investigations to:',
     '["Filter log entries by event type for faster queries","Compress CloudTrail log files for cheaper storage","Prove that CloudTrail log files have not been tampered with","Automatically redact PII from audit logs"]',
     2, 'CO5', 2, 'easy', 'eBook Ch.6 -- CloudTrail Forensics, Digest Files', 12),
    (v_ch6,
     'Repeated AccessDenied errors in CloudTrail from the same IAM identity in a short time window most likely indicate:',
     '["A misconfigured IAM policy that is too restrictive","An attacker enumerating permissions to find exploitable ones","A software bug in the application making invalid API calls","A KMS key that has been accidentally deleted"]',
     1, 'CO5', 3, 'medium', 'eBook Ch.6 -- CloudTrail Forensics, AccessDenied Enumeration', 13),
    (v_ch6,
     'An attacker deletes CloudTrail logs only for a 2-hour window and then re-enables logging. The gap in the log timeline:',
     '["Cannot be used as evidence because the logs are missing","Is itself forensic evidence of intentional anti-forensic activity","Can be reconstructed automatically by AWS from backups","Is covered by GuardDuty findings for that time window"]',
     1, 'CO5', 4, 'hard', 'eBook Ch.6 -- Anti-Forensics, Log Gap as Evidence', 14),
    (v_ch6,
     'The Autopsy tool is used in cloud forensics to:',
     '["Capture memory from a running Linux EC2 instance","Analyse a mounted EBS volume snapshot for filesystem artefacts","Query CloudTrail logs using SQL via Amazon Athena","Monitor Kubernetes pod behaviour at runtime"]',
     1, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Acquisition, Autopsy', 15),
    (v_ch6,
     'The first section of a cloud forensic report is the executive summary. Its primary audience is:',
     '["The technical forensic team performing remediation","Law enforcement preparing a criminal charge sheet","Non-technical board members and senior management","The cloud provider''s legal team"]',
     2, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Report, Executive Summary Audience', 16),
    (v_ch6,
     'The Volatility framework is used in cloud forensics primarily for:',
     '["Querying CloudTrail logs stored in Amazon S3","Scanning EBS snapshots for known malware signatures","Analysing memory images to recover processes, network connections, and keys","Generating Section 63 BSA 2023 certificate documentation"]',
     2, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Acquisition, Volatility', 17),
    (v_ch6,
     'An SCP that denies cloudtrail:DeleteTrail applied to a member account prevents which principal from deleting the trail?',
     '["The member account''s root user","The AWS Organizations management account administrator","An AWS support engineer with emergency access","A GuardDuty service role in the member account"]',
     0, 'CO5', 3, 'medium', 'eBook Ch.6 -- Anti-Forensics, SCP Prevents Root Deletion', 18),
    (v_ch6,
     'VPC Traffic Mirroring is used in cloud forensics to:',
     '["Copy CloudTrail management events to a forensic account","Capture raw network packets from an EC2 instance for offline analysis","Mirror EBS snapshots to a forensic S3 storage bucket","Replicate IAM audit logs to a separate region"]',
     1, 'CO5', 3, 'medium', 'eBook Ch.6 -- Forensic Acquisition, VPC Traffic Mirror', 19),
    (v_ch6,
     'The chain of custody for cloud forensic evidence requires, at a minimum:',
     '["Only a verbal description of who accessed the evidence","A SHA-256 hash of each artefact, timestamps, and the name of every accessor","A photograph of the physical device containing the evidence","A signed statement from the cloud provider confirming authenticity"]',
     1, 'CO5', 2, 'easy', 'eBook Ch.6 -- Forensic Report, Chain of Custody', 20);
  end if;

  -- ================================================================
  -- FINAL TEST — copy all 120 chapter questions in chapter order
  -- Uses a SELECT so no duplicate literal values needed.
  -- ================================================================
  if not exists (select 1 from public.test_questions where test_id = v_fin) then
    insert into public.test_questions
      (test_id, question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference, order_index)
    select
      v_fin,
      question_text, options, correct_index, co_mapping, btl_level, difficulty, ebook_reference,
      row_number() over (
        order by
          case test_id
            when v_ch1 then 1 when v_ch2 then 2 when v_ch3 then 3
            when v_ch4 then 4 when v_ch5 then 5 when v_ch6 then 6
          end,
          order_index
      )
    from public.test_questions
    where test_id in (v_ch1, v_ch2, v_ch3, v_ch4, v_ch5, v_ch6);
  end if;

end $cloud_sec$;

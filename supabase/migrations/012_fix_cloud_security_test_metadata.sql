-- Fix Cloud Security test titles (remove "Ch. N:" prefix) and set
-- malware_family + category so the tests page can filter by domain/type.
-- Run this in the Supabase SQL Editor.

update public.tests set
  title        = 'Foundations of Cloud Computing',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch1';

update public.tests set
  title        = 'Cloud Threats, Attacks and Privacy',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch2';

update public.tests set
  title        = 'Controls, Standards and Testing',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch3';

update public.tests set
  title        = 'Data Protection in the Cloud',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch4';

update public.tests set
  title        = 'Monitoring, Auditing and Compliance',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch5';

update public.tests set
  title        = 'Cloud Forensics and Incident Response',
  malware_family = 'cloud-security',
  category     = 'Unit Assessment'
where slug = 'cloud-security-ch6';

update public.tests set
  title        = 'Cloud Security: Complete Assessment',
  malware_family = 'cloud-security',
  category     = 'Comprehensive Assessment'
where slug = 'cloud-security-final';

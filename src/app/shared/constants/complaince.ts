import { Complaince } from '@shared/models/complaince';

export const regulations: Complaince[] = [
  {
    title: 'HIPAA (Health Insurance Portability and Accountability Act)',
    rules: [
      { name: 'Scope', description: 'Sector-specific (healthcare in the U.S.)' },
      { name: 'Jurisdiction', description: 'United States' },
      { name: 'Data Type', description: 'Protected Health Information (PHI) specifically' },
      {
        name: 'Focus',
        description: 'Privacy and security of health data, insurance portability, fraud reduction',
      },
      {
        name: 'Consent',
        description:
          'Implied consent for treatment, payment, and healthcare operations, but explicit consent for other uses/disclosures',
      },
      {
        name: 'Breach Reporting',
        description:
          'Notification to affected individuals, HHS, and sometimes media within specific timeframes',
      },
      {
        name: 'Penalties',
        description: 'Civil and criminal penalties, varying by violation severity',
      },
    ],
  },
  {
    title: 'GDPR (General Data Protection Regulation)',
    rules: [
      {
        name: 'Scope',
        description:
          'Broad, comprehensive (applies to all sectors globally if processing EU/EEA data)',
      },
      {
        name: 'Jurisdiction',
        description:
          'European Union (EU) and European Economic Area (EEA), with extraterritorial reach',
      },
      {
        name: 'Data Type',
        description: 'Personal Data broadly, including health data as a special category',
      },
      {
        name: 'Focus',
        description:
          'Data protection for individuals, individual rights, accountability for data processing',
      },
      {
        name: 'Consent',
        description:
          'Requires explicit, informed consent for processing, with specific conditions for valid consent. Strict rules for special categories of data (e.g., health data).',
      },
      {
        name: 'Breach Reporting',
        description:
          "Notification to supervisory authority within 72 hours, and to affected individuals without undue delay if there's a high risk to their rights and freedoms.",
      },
      {
        name: 'Penalties',
        description:
          'Significant fines: up to €20 million or 4% of global annual turnover, whichever is higher, for severe infringements.',
      },
    ],
  },
];

export const patientFilterOptions = [
  {
    id: 'gender',
    label: 'Gender',
    expanded: false,
    children: [
      { id: '', label: 'Clear' },
      { id: 'MALE', label: 'Male' },
      { id: 'FEMALE', label: 'Female' },
    ],
  },
  {
    id: 'age',
    label: 'Age Range',
    expanded: false,
    children: [
      { id: '', label: 'Clear' },
      { id: 'under18', label: 'Under 18' },
      { id: '19to40', label: '19 - 40' },
      { id: '41to65', label: '41 - 65' },
      { id: 'over65', label: 'Over 65' },
    ],
  },
];

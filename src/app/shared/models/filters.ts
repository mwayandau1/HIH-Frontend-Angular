export interface FilterOption {
  id: string;
  label: string;
  expanded?: boolean;
  children?: FilterOption[];
}

export interface FilterField {
  label: string;
  value: string | null;
}

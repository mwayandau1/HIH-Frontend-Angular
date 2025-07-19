export interface DropdownItem {
  id: string | boolean;
  label: string;
}

export interface SortGroup {
  groupLabel: string;
  items: DropdownItem[];
}

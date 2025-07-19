export interface Complaince {
  title: string;
  rules: Rule[];
}

export interface Rule {
  name: string;
  description: string;
}

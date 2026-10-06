export interface ExampleItem {
  id: string;
  name: string;
}

const items: ExampleItem[] = [
  {
    id: "example-1",
    name: "Replace me with real domain data",
  },
];

export function listExamples(): ExampleItem[] {
  return items;
}

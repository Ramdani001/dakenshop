export interface Category {
  id: string;
  label: string;
  iconUrl: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}
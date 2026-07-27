export type PropertyType = 'apartment' | 'house' | 'commercial';
export type PropertyStatus = 'available' | 'rented' | 'maintenance';

export interface Property {
  id: string;
  organizationId: string;
  address: string;
  type: PropertyType;
  monthlyRent: number;
  status: PropertyStatus;
  deletedAt: Date | null;
  createdAt: Date;
}

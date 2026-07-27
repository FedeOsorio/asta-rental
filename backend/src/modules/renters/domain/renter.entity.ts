export class RenterEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly createdAt: Date
  ) {}
}

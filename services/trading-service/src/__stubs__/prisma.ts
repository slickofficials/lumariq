/* Compile-time Prisma shim (SHIP MODE) */

export namespace Prisma {
  export type TransactionClient = any;
  export type Client = any;
  export type Any = any;
}

export class PrismaClient {
  constructor(..._args: any[]) {}
}

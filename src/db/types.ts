import * as schema from './schema';

type Schema = typeof schema;
type DatabaseSchema = {
  [K in keyof Schema]: Schema[K] extends { [key: string]: any } ? Schema[K] : never;
};

export type Database = DatabaseSchema;

declare module 'drizzle-orm' {
  interface PgTableWithSchema<T extends string> {
    [key: string]: any;
  }
}

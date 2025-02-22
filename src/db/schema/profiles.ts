import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references('auth.users.id'),
  // Personal Info
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  zip: text('zip'),
  country: text('country'),
  // Company Info
  companyName: text('company_name'),
  companyLogo: text('company_logo'),
  signature: text('signature'),
  businessType: text('business_type'),
  taxNumber: text('tax_number'),
  // Banking Info
  bankName: text('bank_name'),
  accountName: text('account_name'),
  accountNumber: text('account_number'),
  swiftCode: text('swift_code'),
  iban: text('iban'),
  preferredCurrency: text('preferred_currency'),
  // Metadata
  isProfileCompleted: boolean('is_profile_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert; 
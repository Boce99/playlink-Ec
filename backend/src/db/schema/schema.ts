import { pgTable, text, timestamp, integer, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Club table
export const club = pgTable('club', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Club member table - associates users with clubs and their roles
export const clubMember = pgTable('club_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => club.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  role: text('role').notNull().default('member'), // 'admin' or 'member'
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});

// Player ranking table - stores ranking stats for club members
export const playerRanking = pgTable('player_ranking', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id').notNull().references(() => club.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  eloRating: integer('elo_rating').notNull().default(1600),
  points: integer('points').notNull().default(0),
  matchesPlayed: integer('matches_played').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// Relations
export const clubRelations = relations(club, ({ many }) => ({
  members: many(clubMember),
  rankings: many(playerRanking),
}));

export const clubMemberRelations = relations(clubMember, ({ one }) => ({
  club: one(club, {
    fields: [clubMember.clubId],
    references: [club.id],
  }),
}));

export const playerRankingRelations = relations(playerRanking, ({ one }) => ({
  club: one(club, {
    fields: [playerRanking.clubId],
    references: [club.id],
  }),
}));

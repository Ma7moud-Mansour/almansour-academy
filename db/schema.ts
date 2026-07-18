import { relations, sql } from "drizzle-orm";
import {
  boolean, index, integer, jsonb, pgEnum, pgTable, real, serial, text,
  timestamp, uniqueIndex, varchar,
} from "drizzle-orm/pg-core";

export const academicYearEnum = pgEnum("academic_year", ["first", "second"]);
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin", "instructor", "content_editor"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "article", "live", "file"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "completed", "suspended", "cancelled"]);
export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "closed"]);
export const questionTypeEnum = pgEnum("question_type", ["single_choice", "multiple_choice", "true_false", "short_answer"]);
export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "submitted", "graded", "expired"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["draft", "published", "closed"]);
export const submissionStatusEnum = pgEnum("submission_status", ["draft", "submitted", "graded", "returned"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 24 }),
  role: adminRoleEnum("role").notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("admins_email_unique").on(table.email)]);

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  academicYear: academicYearEnum("academic_year").notNull(),
  governorate: varchar("governorate", { length: 80 }).notNull(),
  guardianOccupation: varchar("guardian_occupation", { length: 120 }).notNull(),
  guardianPhone: varchar("guardian_phone", { length: 24 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("students_email_unique").on(table.email),
  uniqueIndex("students_phone_unique").on(table.phone),
  index("students_year_idx").on(table.academicYear),
]);

export const pendingStudentRegistrations = pgTable("pending_student_registrations", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 24 }).notNull(),
  academicYear: academicYearEnum("academic_year").notNull(),
  governorate: varchar("governorate", { length: 80 }).notNull(),
  guardianOccupation: varchar("guardian_occupation", { length: 120 }).notNull(),
  guardianPhone: varchar("guardian_phone", { length: 24 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  verificationCodeHash: text("verification_code_hash").notNull(),
  verificationExpiresAt: timestamp("verification_expires_at", { withTimezone: true }).notNull(),
  verificationAttempts: integer("verification_attempts").notNull().default(0),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
}, (table) => [
  uniqueIndex("pending_students_email_unique").on(table.email),
  uniqueIndex("pending_students_phone_unique").on(table.phone),
  index("pending_students_expiry_idx").on(table.verificationExpiresAt),
]);

export const studentSessions = pgTable("student_sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("student_sessions_token_unique").on(table.tokenHash), index("student_sessions_student_idx").on(table.studentId)]);

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => admins.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("admin_sessions_token_unique").on(table.tokenHash), index("admin_sessions_admin_idx").on(table.adminId)]);

export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [uniqueIndex("course_categories_slug_unique").on(table.slug)]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => courseCategories.id, { onDelete: "set null" }),
  instructorId: integer("instructor_id").references(() => admins.id, { onDelete: "set null" }),
  tag: varchar("tag", { length: 80 }).notNull().default(""),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  thumbnailUrl: text("thumbnail_url"),
  trailerUrl: text("trailer_url"),
  lessonsLabel: varchar("lessons_label", { length: 60 }).notNull().default(""),
  level: varchar("level", { length: 60 }).notNull().default("مبتدئ"),
  icon: varchar("icon", { length: 30 }).notNull().default("</>"),
  academicYear: academicYearEnum("academic_year"),
  price: integer("price").notNull().default(0),
  status: courseStatusEnum("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("courses_slug_unique").on(table.slug), index("courses_status_idx").on(table.status), index("courses_year_idx").on(table.academicYear)]);

export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  ...timestamps,
}, (table) => [index("course_modules_course_idx").on(table.courseId)]);

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull(),
  type: lessonTypeEnum("type").notNull().default("video"),
  content: text("content"),
  videoUrl: text("video_url"),
  attachmentUrl: text("attachment_url"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  preview: boolean("preview").notNull().default(false),
  published: boolean("published").notNull().default(false),
  ...timestamps,
}, (table) => [uniqueIndex("lessons_module_slug_unique").on(table.moduleId, table.slug), index("lessons_module_idx").on(table.moduleId)]);

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  progressPercent: real("progress_percent").notNull().default(0),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("enrollments_student_course_unique").on(table.studentId, table.courseId), index("enrollments_course_idx").on(table.courseId)]);

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  watchedSeconds: integer("watched_seconds").notNull().default(0),
  lastPositionSeconds: integer("last_position_seconds").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("lesson_progress_student_lesson_unique").on(table.studentId, table.lessonId)]);

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").references(() => courseModules.id, { onDelete: "set null" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  durationMinutes: integer("duration_minutes"),
  passingScore: real("passing_score").notNull().default(50),
  maxAttempts: integer("max_attempts").notNull().default(1),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  showAnswersAfterSubmit: boolean("show_answers_after_submit").notNull().default(true),
  availableFrom: timestamp("available_from", { withTimezone: true }),
  availableUntil: timestamp("available_until", { withTimezone: true }),
  status: quizStatusEnum("status").notNull().default("draft"),
  ...timestamps,
}, (table) => [index("quizzes_course_idx").on(table.courseId), index("quizzes_module_idx").on(table.moduleId)]);

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull().default("single_choice"),
  question: text("question").notNull(),
  explanation: text("explanation"),
  points: real("points").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("quiz_questions_quiz_idx").on(table.quizId)]);

export const quizOptions = pgTable("quiz_options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(),
  correct: boolean("correct").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [index("quiz_options_question_idx").on(table.questionId)]);

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull().default(1),
  status: attemptStatusEnum("status").notNull().default("in_progress"),
  score: real("score"),
  maxScore: real("max_score"),
  percentage: real("percentage"),
  passed: boolean("passed"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
}, (table) => [uniqueIndex("quiz_attempts_number_unique").on(table.quizId, table.studentId, table.attemptNumber), index("quiz_attempts_student_idx").on(table.studentId)]);

export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  selectedOptionIds: jsonb("selected_option_ids").$type<number[]>().notNull().default(sql`'[]'::jsonb`),
  textAnswer: text("text_answer"),
  correct: boolean("correct"),
  awardedPoints: real("awarded_points"),
  answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("quiz_answers_attempt_question_unique").on(table.attemptId, table.questionId)]);

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").references(() => courseModules.id, { onDelete: "set null" }),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description").notNull(),
  attachmentUrl: text("attachment_url"),
  maxScore: real("max_score").notNull().default(100),
  dueAt: timestamp("due_at", { withTimezone: true }),
  allowLateSubmission: boolean("allow_late_submission").notNull().default(false),
  status: assignmentStatusEnum("status").notNull().default("draft"),
  ...timestamps,
}, (table) => [index("assignments_course_idx").on(table.courseId)]);

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  answerText: text("answer_text"),
  attachmentUrl: text("attachment_url"),
  status: submissionStatusEnum("status").notNull().default("draft"),
  score: real("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
  gradedBy: integer("graded_by").references(() => admins.id, { onDelete: "set null" }),
  ...timestamps,
}, (table) => [uniqueIndex("assignment_submissions_unique").on(table.assignmentId, table.studentId), index("assignment_submissions_student_idx").on(table.studentId)]);

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(), question: text("question").notNull(), answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0), published: boolean("published").notNull().default(true), ...timestamps,
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(), studentName: varchar("student_name", { length: 160 }).notNull(),
  studentLevel: varchar("student_level", { length: 100 }).notNull(), quote: text("quote").notNull(),
  sortOrder: integer("sort_order").notNull().default(0), published: boolean("published").notNull().default(true), ...timestamps,
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(), courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => admins.id, { onDelete: "set null" }), title: varchar("title", { length: 220 }).notNull(),
  body: text("body").notNull(), published: boolean("published").notNull().default(false), publishedAt: timestamp("published_at", { withTimezone: true }), ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(), adminId: integer("admin_id").references(() => admins.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(), entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }), metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(courseCategories, { fields: [courses.categoryId], references: [courseCategories.id] }),
  instructor: one(admins, { fields: [courses.instructorId], references: [admins.id] }),
  modules: many(courseModules), quizzes: many(quizzes), assignments: many(assignments), enrollments: many(enrollments),
}));
export const modulesRelations = relations(courseModules, ({ one, many }) => ({ course: one(courses, { fields: [courseModules.courseId], references: [courses.id] }), lessons: many(lessons) }));
export const studentsRelations = relations(students, ({ many }) => ({ enrollments: many(enrollments), quizAttempts: many(quizAttempts), assignmentSubmissions: many(assignmentSubmissions) }));
export const quizzesRelations = relations(quizzes, ({ one, many }) => ({ course: one(courses, { fields: [quizzes.courseId], references: [courses.id] }), questions: many(quizQuestions), attempts: many(quizAttempts) }));
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({ course: one(courses, { fields: [assignments.courseId], references: [courses.id] }), submissions: many(assignmentSubmissions) }));

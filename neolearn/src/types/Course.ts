export interface Course {
  id: string;
  title: string;       // ✅ "name" does not exist; should be "title"
  description: string;
  subject: string;     // ✅ Added "subject"
  syllabus: string;    // ✅ Added "syllabus"
  textbook: string;    // ✅ Added "textbook"
  userId: string;
  createdAt?: Date;
  topics?: string[];
}

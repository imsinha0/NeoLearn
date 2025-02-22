export interface Course {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt?: Date;
  // ... any other fields you need
}
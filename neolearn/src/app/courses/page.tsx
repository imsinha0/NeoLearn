"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, model } from '@/firebase';
import { CourseCard } from '../../components/CourseCard';
import { CourseDialog } from '../../components/CourseDialog';
import type { Course } from '../../types/Course';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      const q = query(collection(db, "courses"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      setCourses(userCourses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
      Loading...
    </div>;
  }

  const handleSaveCourse = async (course: Course) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (selectedCourse) {
        const courseRef = doc(db, "courses", course.id);
        await updateDoc(courseRef, { ...course, userId: user.uid });
        setCourses(courses.map(c => c.id === course.id ? course : c));
      } else {

        let prompt = "I will give you information about a course."
        prompt = prompt + "Please give me 8 topics about the course separated by a comma."
        prompt = prompt + "The title of the course is: " + course.title
        prompt = prompt + "The subject of the course is: " + course.subject
        prompt = prompt + "The description of the course is: " + course.description
        prompt = prompt + "The textbook of the course are: " + course.textbook
        prompt = prompt + "The syllabus of the course is: " + course.syllabus
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const topics = text.split(',').map(topic => topic.trim().replace(/^["']|["']$/g, '')).filter(topic => topic);

        const docRef = await addDoc(collection(db, "courses"), {
          ...course,
          userId: user.uid,
          createdAt: new Date(),
          topics: topics // Add the topics list to the courses document
        });
        setCourses([...courses, { ...course, id: docRef.id, topics }]); // Include topics in the course object
      }
      setIsDialogOpen(false);
      setSelectedCourse(undefined);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, "courses", id));
      console.log("Course deleted successfully: " + id);
      setCourses(courses.filter(course => course.id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleCourseClick = (course: Course) => {
    router.push(`/chat?courseId=${course.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={handleDeleteCourse}
              onEdit={handleEditCourse}
              onClick={handleCourseClick}
            />
          ))}
        </div>

        <CourseDialog
          isOpen={isDialogOpen}
          course={selectedCourse}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedCourse(undefined);
          }}
          onSave={handleSaveCourse}
        />
      </div>
    </div>
  );
}
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, model } from '@/firebase';
import { CourseCard } from '../../components/CourseCard';
import { CourseDialog } from '../../components/CourseDialog';
import type { Course } from '../../types/Course';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
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
      console.log("Deleting course with id: " + id);
      const courseRef = query(collection(db, "courses"), where("id", "==", id));
      const courseSnapshot = await getDocs(courseRef);
      if (!courseSnapshot.empty) {
        await deleteDoc(doc(db, "courses", courseSnapshot.docs[0].id));
        console.log("Course deleted successfully: " + courseSnapshot.docs[0].id);
      } else {
        console.log("No course found with id: id");
      }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            My Courses
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            Add Course
          </motion.button>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map(course => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="backdrop-blur-sm"
            >
              <CourseCard
                course={course}
                onDelete={handleDeleteCourse}
                onEdit={handleEditCourse}
                onClick={handleCourseClick}
              />
            </motion.div>
          ))}
        </motion.div>

        {courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-xl">
              No courses yet. Click &quot;Add Course&quot; to get started!
            </p>
          </motion.div>
        )}

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
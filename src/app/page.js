// pages.js
'use client';
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, "questions"), where("active", "==", true));
      const querySnapshot = await getDocs(q);
      const questionsArray = [];
      querySnapshot.forEach((doc) => {
        questionsArray.push({ id: doc.id, ...doc.data() });
      });
      setQuestions(questionsArray);
    };
    fetchQuestions();
  }, []);

  return (
    <div className="p-4 h-screen bg-white text-gray-800"> {/* White background for the entire page */}
    <div className=' flex w-full h-[100px] justify-start  items-center mb-8 pl-4 ' >
          <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        </div> 
      <h1 className="text-3xl font-bold mb-6 w-full text-center">Suallar</h1>
      <div className="flex flex-col md:flex-row gap-4"> {/* Use flex-col for vertical stacking */}
        {questions.map((question) => (
          <div key={question.id} className="border w-full gap-4 p-6 md:w-[400px] p-4 rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg bg-white"> {/* Card background color */}
            <h2 className="text-xl font-semibold">{question.title}</h2>
            <p className="text-gray-600">{question.description}</p>
            <Link href={`/${question.id}`} className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
              Cavabla
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className=" min-h-screen w-full bg-contain bg-white text-gray-800 flex flex-col relative   " 
    > {/* White background for the entire page */}
     <div
        className="absolute inset-0 bg-cover bg-center opacity-50  "
        style={{ backgroundImage: "url('/images/bg.png')" }}
      ></div>
      <div className=' flex flex-col w-full h-[100px] justify-center  items-start mb-8 pl-8 p-4 z-10' >
          <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
          <h2 className="pt-2 text-xs font-semibold italic">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
        </div> 
      <div className="flex flex-col  mt-4 p-4 z-10"> {/* Use flex-col for vertical stacking */}
      <h1 className="text-3xl font-bold mb-6 w-full text-center">Suallar</h1>
      <div className="flex flex-col md:flex-row gap-4 w-full" >
        {questions.map((question) => (
          <div key={question.id} className="border w-full gap-4 mb-4 p-6 md:w-[400px] p-4 rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg bg-white"> {/* Card background color */}
            <h2 className="text-xl font-semibold">{question.title}</h2>
            <p className="text-gray-600">{question.description}</p>
            <Link href={`/${question.id}`} className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
              Cavabla
            </Link>

          </div>
        ))}
        </div>
      </div>

        <div className="h-[50px] w-full   bottom-0 justify-center  absolute z-10 ">
          <h2 className="text-xs font-semibold italic w-full text-center" >UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN </h2>
          <h2 className="text-xs font-semibold italic w-full text-center">“İŞIQLI YOL”</h2>
        </div>
      
    </div>
  );
}

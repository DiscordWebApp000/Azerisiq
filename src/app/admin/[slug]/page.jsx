'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { db } from '../../../../firebase';
import { collection, getDocs, doc, updateDoc , deleteDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function QuestionDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const matchedQuestion = questionsArray.find(question => question.id === slug);
        if (matchedQuestion) {
          setQuestion(matchedQuestion);
        } else {
          setError(`No question found with ID: ${slug}`);
        }
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
      setLoading(false);
    };
    fetchQuestion();
  }, [slug]);

  const toggleActive = async () => {
    if (!question) return;
    try {
      const docRef = doc(db, 'questions', slug);
      await updateDoc(docRef, { active: !question.active });
      setQuestion({ ...question, active: !question.active });
    } catch (error) {
      console.error("Error toggling question status:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "questions", slug));
        alert("Soru silindi!");
        router.push('/admin');
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Soru silinirken bir hata oluştu.");
      }
    }
  };

  const handleEdit = async () => {
    const newTitle = prompt('Enter new title:', question.title);
    const newDescription = prompt('Enter new description:', question.description);

    if (newTitle && newDescription) {
      const questionRef = doc(db, 'questions', slug);
      try {
        await updateDoc(questionRef, {
          title: newTitle,
          description: newDescription
        });
        setQuestion(prev => ({ ...prev, title: newTitle, description: newDescription }));
        alert('Question has been updated successfully!');
      } catch (error) {
        console.error('Error updating question:', error);
        alert('There was an error updating the question.');
      }
    }
  };

  const totalAnswers = question?.answers ? question.answers.length : 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!question) {
    return <div>No question found. {slug}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-lg shadow-lg">
         <div className=' flex w-full h-[110px] justify-start items-center mb-8 ' >
          <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        </div>  
      
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{question.title}</h1>
      <p className="text-gray-600 mb-8 text-lg">{question.description}</p>

      {/* Buttons for editing, deleting, and toggling active state */}
      <div className="mb-8 flex items-center space-x-4">
        <button 
          onClick={handleEdit} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </button>
        <button 
          onClick={handleDelete} 
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete</span>
        </button>
        
        {/* Active/Inactive sliding toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{question.active ? 'Active' : 'Inactive'}</span>
          <div
            onClick={toggleActive}
            className={`w-14 h-7 flex items-center  rounded-full p-1 cursor-pointer ${
              question.active ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                question.active ? 'translate-x-7' : ''
              }`}
            ></div>
          </div>
        </div>

        <div>
          <Link href={`/admin/${question.id}/presentation`} className=' ml-6 bg-blue-500 text-white p-3  rounded-md hover:bg-blue-600 transition-all'>Prezentasiya</Link>
        </div>
      </div>

      {/* Display existing answers */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">{totalAnswers} cavab</h2>
        {question.answers && question.answers.map((ans, index) => (
          <div key={index} className="border p-4 my-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
            <p className="text-gray-700">{ans.answer}</p>
           
          </div>
        ))}
      </div>
    </div>
  );
}

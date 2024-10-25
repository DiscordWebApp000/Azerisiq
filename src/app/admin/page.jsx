// components/AdminPanel.js
'use client';
import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, query, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function AdminPanel() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const fetchQuestions = async () => {
    const q = query(collection(db, "questions"));
    const querySnapshot = await getDocs(q);
    const questionsArray = [];
    querySnapshot.forEach((doc) => {
      questionsArray.push({ id: doc.id, ...doc.data() });
    });
    setQuestions(questionsArray);
  };

  const addQuestion = async () => {
    try {
      const newId = generateRandomId();
      await addDoc(collection(db, "questions"), {
        title,
        description,
        active: true,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        randomId: newId,
      });
      fetchQuestions();
      setShowForm(false);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      const docRef = doc(db, "questions", editingQuestion.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      await updateDoc(docRef, {
        title,
        description,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
      });
      setTitle("");
      setDescription("");
      fetchQuestions();
      setEditingQuestion(null);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const deleteQuestion = async (id) => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setEditingQuestion(null);
    setShowForm(false);
  };

  const toggleQuestionStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "questions", id), { active: !currentStatus });
      setQuestions(questions.map(q => q.id === id ? { ...q, active: !currentStatus } : q));
    } catch (error) {
      console.error("Error toggling question status:", error);
    }
  };

  const startEditing = (question) => {
    setEditingQuestion(question);
    setTitle(question.title);
    setDescription(question.description);
    setShowForm(true);
  };

  const goToQuestionPage = (slug, id) => {
    router.push(`admin/${id}`);
  };

  // Kullanıcı doğrulama kontrolü
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "0000") {
      setIsAuthenticated(true);
      localStorage.setItem("isAdminAuthenticated", "true"); // Giriş yapıldığında localStorage'a kaydediyoruz
      fetchQuestions(); // Giriş yapıldığında verileri çek
    } else {
      alert("Yanlış parola. Lütfen tekrar deneyin.");
    }
  };

  useEffect(() => {
    const isAuthenticatedInStorage = localStorage.getItem("isAdminAuthenticated") === "true";
    setIsAuthenticated(isAuthenticatedInStorage); // localStorage'dan durumu kontrol ediyoruz

    if (isAuthenticatedInStorage) {
      fetchQuestions();
    }
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {isAuthenticated ? (
        <>
          <div className="w-full flex justify-between h-28 ">
            <h2 className="text-3xl font-semibold mt-2 text-gray-800">Admin Panel</h2>
            <div>
              <Image src='/images/azerisiq-logo2.png' width={90} height={10} alt='logo'></Image> 
            </div>
          </div>

          <button
            className={`mb-6 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${
              showForm ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) clearForm();
            }}
          >
            {showForm ? "Hide Form" : "Add Question"}
          </button>

          {showForm && (
            <div className="mb-8 bg-white shadow-md rounded-lg p-6 space-y-4 text-black">
              <input
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Başlık"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Açıklama"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button 
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg transition-colors duration-300 hover:bg-green-600"
                onClick={editingQuestion ? updateQuestion : addQuestion}
              >
                {editingQuestion ? "Güncelle" : "Soru Ekle"}
              </button>
            </div>
          )}

          <h3 className="text-2xl font-semibold text-gray-700 mb-6">Questions</h3>

          {loading ? (
            <p className="text-gray-500">Yükleniyor...</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className={`bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer ${question.active ? 'bg-white' : 'bg-gray-100'}`}
                  onClick={() => goToQuestionPage(question.slug, question.id)}
                >
                  <div className="flex flex-col md:flex-row md:justify-between items-center ">
                    <div className="md:w-1/2 w-full mb-4">
                      <h4 className="text-xl font-semibold text-gray-800">{question.title}</h4>
                      <p className="text-gray-600 mt-1">{question.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Status: {question.active ? "Active" : "Inactive"}</p>
                    </div>
                    <div className="flex items-center space-x-4 w-full md:w-[400px] justify-between">
                      <div className="flex flex-row">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuestionStatus(question.id, question.active);
                          }}
                          className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer ${
                            question.active ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          <div
                            className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                              question.active ? 'translate-x-7' : ''
                            }`}
                          ></div>
                        </div>
                        <span className="text-gray-600 pl-2">{question.active ? 'Aktif' : 'Pasif'}</span>
                      </div>
                      <button
                       className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(question);
                        }}
                      >
                       <FontAwesomeIcon icon={faEdit} />
                       <span>Edit</span>
                      </button>
                      <button
                       className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all flex items-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(question.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center justify-center h-screen ">
          <div className="flex flex-col items-center bg-gray-200 p-16 rounded-lg mb-20">
            <Image src='/images/azerisiq-logo.png' alt="logo" width={100} height={200} className="mt-[-40px] mb-8" />
            <h2 className="text-3xl mb-4 text-gray-500">Admin Login</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parola"
              className="border border-gray-300 p-2 rounded mb-4"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Giriş Yap</button>
          </div>
        </form>
      )}
    </div>
  );
}

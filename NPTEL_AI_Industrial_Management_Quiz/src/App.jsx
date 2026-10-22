import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WeekPractice from "./pages/WeekPractice.jsx";
import RandomQuiz from "./pages/RandomQuiz.jsx";
import FullTest from "./pages/FullTest.jsx";
import Quiz from "./pages/Quiz.jsx";
import Results from "./pages/Results.jsx";
import ReviewAnswers from "./pages/ReviewAnswers.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/weeks" element={<WeekPractice />} />
        <Route path="/random" element={<RandomQuiz />} />
        <Route path="/full" element={<FullTest />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/review/:id" element={<ReviewAnswers />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

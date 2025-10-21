// app/interview-prep/layout.jsx
import Header from '../dashboard/_components/Header';

export default function InterviewPrepLayout({ children }) {
  return (
    <div>
      {/* Add your existing Header/Navbar */}
      <Header />
      
      {/* Content */}
      <div className="mx-5 md:mx-20 lg:mx-36">
        {children}
      </div>
    </div>
  );
}

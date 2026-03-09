import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import Comment from './components/Comment';
import LoginForm from './components/LoginForm'

function App() {
  return (
    <>
      <Navbar/>

      <br/>

      <JobCard
        title="Software Developer"
        company="Google"
        jobType="Remote"
        salary="$80,000 - $100,000"
        />
      
      <br/>
      
      <Comment/>

      <LoginForm/>
    </>
  );
}


export default App

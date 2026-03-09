import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import JobCard from './components/JobCard';
import Comment from './components/Comment';
import Candidate from './components/Candidate';
import LoginForm from './components/LoginForm'

function App() {
  return (
    <>
      <Navbar/>

      <br/>

      <br/>

      <JobCard
        title="Software Developer"
        company="Google"
        jobType="Remote"
        salary="$80,000 - $100,000"
        />
      
      <br/>
      
      <Comment/>

      <br/>

      <Candidate/>
    
      <br/>
      <LoginForm/>

      <SearchBar/>
    </>
  );
}


export default App

import avatar from '../assets/img/avatarDefault.png'
import '../styles/Candidate.css'

export default function Candidate() {
  return (
    <div class="candBox1">
      <div class="candBox2">
        <img src={avatar} class="candPfp"/>

      </div>
      <div>
        <div class="name">
          John Smith
        </div>
        <div class="candidateBio">
          Candidate Bio (taken from profile)
        </div>
      </div>
    </div>
  );
}
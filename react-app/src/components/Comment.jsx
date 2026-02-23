import avatar from '../assets/img/avatarDefault.png'
import '../styles/Comment.css'

export default function Comment() {
  return (
    <div class="box1">
      <div class="box2">
        <img src={avatar} class="pfp"/>
      </div>
      <div>
        <div class="name">
          John Smith
        </div>
        <div class="comment">
          Only $80,000 minimum salary??? Seems low to me for this kind of position.
        </div>
      </div>
    </div>
  );
}
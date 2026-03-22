import "../styles/JobDetailsPage.css";

function Comment({
    userName,
    createdDate,
    comment
}) {

    return (
        <>
            <div className="discussion-comment-meta">
                <h3>{userName}</h3>
                <span>{createdDate ? new Date(createdDate).toLocaleDateString() : ""}</span>
            </div>
            <p>{comment}</p>
        </>
    );
}

export default Comment;
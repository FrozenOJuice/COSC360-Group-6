import { useEffect, useState } from "react";
import "../styles/JobDetailsPage.css";

function Comment({
    commentId,
    userName,
    createdDate,
    comment,
    isCommentOwned,
    onUpdate,
    onDelete,
    isActionLoading
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(comment);
    const [error, setError] = useState("");

    async function handleSave() {
        const trimmed = draft.trim();
        if (!trimmed) {
            setError("Comment cannot be empty.");
            return;
        }

        setError("");
        if (typeof onUpdate === "function") {
            const result = await onUpdate(commentId, trimmed);
            if (result?.ok) {
                setIsEditing(false);
                return;
            }

            if (result?.error?.message) {
                setError(result.error.message);
                return;
            }

            setError("Could not update comment.");
            return;
        }

        setIsEditing(false);
    }

    useEffect(() => {
        setDraft(comment);
    }, [comment]);

    function handleCancel() {
        setDraft(comment);
        setError("");
        setIsEditing(false);
    }

    return (
        <>
            <div className="discussion-comment-meta">
                <h3>{userName}</h3>
                <span>{createdDate ? new Date(createdDate).toLocaleDateString() : ""}</span>
                {isCommentOwned ? (
                    <span className="comment-actions">
                        {isEditing ? (
                            <>
                                <button type="button" disabled={isActionLoading} onClick={handleSave}>Save</button>
                                <button type="button" disabled={isActionLoading} onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button type="button" disabled={isActionLoading} onClick={() => setIsEditing(true)}>Edit</button>
                                <button className="delete-button" type="button" disabled={isActionLoading} onClick={() => onDelete?.(commentId)}>Delete</button>
                            </>
                        )}
                    </span>
                ) : null}
            </div>
            {isEditing ? (
                <>
                    <textarea 
                        className="discussion-editing-comment"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={4}
                        disabled={isActionLoading}
                    />
                    {error ? <p className="page-status">{error}</p> : null}
                </>
            ) : (
                <p>{comment}</p>
            )}
        </>
    );
}

export default Comment;
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJobById, fetchJobDiscussion, postJobDiscussionComment, updateJobDiscussionComment, deleteJobDiscussionComment } from "../lib/jobsApi";
import { useAuth } from "../auth/useAuth";
import { routePaths } from "../routing/routes";
import Comment from "../components/Comment";
import "../styles/JobDetailsPage.css";

function formatSalary(value, currency) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Salary unavailable";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}${currency ? ` ${currency}` : ""}`;
}

function JobDetailsPage({ jobId: jobIdProp }) {
  const params = useParams();
  const jobId = jobIdProp ?? params.jobId;
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discussion, setDiscussion] = useState(null);
  const [discussionLoading, setDiscussionLoading] = useState(true);
  const [discussionError, setDiscussionError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentActionLoading, setCommentActionLoading] = useState(false);
  const [commentActionError, setCommentActionError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadJob() {
      try {
        const response = await fetchJobById(jobId);

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || "Could not load this job.");
          setLoading(false);
          return;
        }

        setJob(response.data ?? null);
        setError("");
        setLoading(false);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Could not connect to the server.");
        setLoading(false);
      }
    }

    void loadJob();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  useEffect(() => {
    let isActive = true;

    async function loadDiscussion() {
      try {
        setDiscussionLoading(true);
        const response = await fetchJobDiscussion(jobId);

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setDiscussionError(response.data.message || "Could not load discussion.");
          setDiscussionLoading(false);
          return;
        }

        setDiscussion(response.data ?? { comments: [] });
        setDiscussionError("");
        setDiscussionLoading(false);
      } catch {
        if (!isActive) {
          return;
        }

        setDiscussionError("Could not connect to the server.");
        setDiscussionLoading(false);
      }
    }

    void loadDiscussion();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  const salaryLabel = formatSalary(job?.salary, job?.currency);
  const subtitle = [job?.category, job?.country].filter(Boolean).join(" • ");

  async function handleSubmitComment(event) {
    event.preventDefault();

    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    if (!user) {
      setCommentError("You must be logged in to comment.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");
      const response = await postJobDiscussionComment(jobId, newComment.trim());

      if (!response.ok) {
        setCommentError(response.error?.message || "Could not post comment.");
        return;
      }

      setDiscussion(response.data ?? { comments: [] });
      setNewComment("");
    } catch {
      setCommentError("Could not connect to the server.");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleUpdateComment(commentId, updatedText) {
    if (!user) {
      const actionError = "You must be logged in to update comments.";
      setCommentActionError(actionError);
      return { ok: false, error: new Error(actionError) };
    }

    try {
      setCommentActionLoading(true);
      setCommentActionError("");
      const response = await updateJobDiscussionComment(jobId, commentId, updatedText);

      if (!response.ok) {
        setCommentActionError(response.error?.message || "Could not update comment.");
        return response;
      }

      setDiscussion(response.data ?? { comments: [] });
      return response;
    } catch {
      setCommentActionError("Could not connect to the server.");
      return { ok: false, error: new Error("Could not connect to the server.") };
    } finally {
      setCommentActionLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!user) {
      setCommentActionError("You must be logged in to delete comments.");
      return;
    }

    try {
      setCommentActionLoading(true);
      setCommentActionError("");
      const response = await deleteJobDiscussionComment(jobId, commentId);

      if (!response.ok) {
        setCommentActionError(response.error?.message || "Could not delete comment.");
        return;
      }

      setDiscussion(response.data ?? { comments: [] });
    } catch {
      setCommentActionError("Could not connect to the server.");
    } finally {
      setCommentActionLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <section className="job-details-page">
        <Link className="job-details-back" to={routePaths.jobs}>
          Back to jobs
        </Link>

        {loading ? <p className="page-status">Loading job...</p> : null}
        {!loading && error ? <p className="page-status">{error}</p> : null}
        {!loading && !error && job ? (
          <article className="job-details-card">
            <p className="hero-eyebrow">Job Details</p>
            <h1>{job.title}</h1>
            {subtitle ? <p className="job-details-subtitle">{subtitle}</p> : null}

            <dl className="job-details-fields">
              <div>
                <dt>Salary</dt>
                <dd>{salaryLabel}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{job.category || "Unavailable"}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{job.country || "Unavailable"}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>{job.currency || "Unavailable"}</dd>
              </div>
            </dl>

            <h1 className="discussion-header">Discussion Section</h1>
            {discussionLoading ? <p className="page-status">Loading discussion...</p> : null}
            {!discussionLoading && discussionError ? <p className="page-status">{discussionError}</p> : null}
            {commentActionError ? <p className="page-status">{commentActionError}</p> : null}
            {!discussionLoading && !discussionError && discussion ? (
              <section className="discussion-list">
                {discussion.comments.length === 0 ? (
                  <p>No comments yet. Be the first to comment.</p>
                ) : (
                  <ul>
                    {discussion.comments.map((item) => (
                      <li key={item.id} className="discussion-comment">
                        <Comment
                          commentId={item.id}
                          userName={item.userName}
                          createdDate={item.createdAt}
                          comment={item.comment}
                          isCommentOwned={item.userId === user?.id || user?.role === "admin"}
                          isActionLoading={commentActionLoading}
                          onUpdate={handleUpdateComment}
                          onDelete={handleDeleteComment}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="discussion-add-comment">
              <h2>Leave a comment</h2>
              {user ? (
                <form onSubmit={handleSubmitComment}>
                  <label htmlFor="comment">Comment</label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    rows={4}
                    disabled={submittingComment}
                  />
                  {commentError ? <p className="page-status">{commentError}</p> : null}
                  <button type="submit" disabled={submittingComment}>
                    {submittingComment ? "Posting..." : "Post comment"}
                  </button>
                </form>
              ) : (
                <p>You must be logged in to post comments.</p>
              )}
            </section>
          </article>
        ) : null}
      </section>
    </main>
  );
}

export default JobDetailsPage;

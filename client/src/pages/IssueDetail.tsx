import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuth } from '../context/auth-context';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  municipality: string;
  upvoteCount: number;
  upvotedBy: string[];
  reportedBy: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
}

export function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    api
      .get(`/issues/${id}`)
      .then((res) => setIssue(res.data.issue))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get(`/issues/${id}/comments`).then((res) => setComments(res.data.comments));
  }, [id]);

  async function handleUpvote() {
    const res = await api.post(`/issues/${id}/upvote`);
    setIssue(res.data.issue);
  }

  async function handleAddComment(e: React.SyntheticEvent) {
    e.preventDefault();
    const res = await api.post(`/issues/${id}/comments`, { text: newComment });
    setComments([...comments, res.data.comment]);
    setNewComment('');
  }

  async function handleStatusChange(status: string) {
    const res = await api.patch(`/issues/${id}/status`, { status });
    setIssue(res.data.issue);
  }

  async function handleDelete() {
    if (!window.confirm(t('issueDetail.deleteConfirm'))) return;
    await api.delete(`/issues/${id}`);
    navigate('/issues');
  }

  if (loading) return <p className="p-8 text-slate-600">{t('issues.loading')}</p>;
  if (!issue) return <p className="p-8 text-slate-600">{t('issueDetail.notFound')}</p>;

  const canModerate = user?.role === 'moderator';
  const canDelete = user && (user.userId === issue.reportedBy || canModerate);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <Link to="/issues" className="text-sm text-blue-600 hover:underline">
        {t('issueDetail.backToList')}
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200 space-y-3">
        <div className="flex justify-between items-start">
          <h1 className="text-xl font-semibold text-slate-800">{issue.title}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {t(`issueDetail.status.${issue.status}`)}
          </span>
        </div>
        <p className="text-slate-600">{issue.description}</p>
        <p className="text-sm text-slate-500">
          {issue.municipality} · {issue.category}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleUpvote}
            disabled={!user}
            className={`text-sm px-3 py-1.5 rounded-md border ${
              user && issue.upvotedBy.includes(user.userId)
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-300 text-slate-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            👍 {issue.upvoteCount}
          </button>
          {!user && (
            <span className="text-xs text-slate-400">{t('issueDetail.loginToUpvote')}</span>
          )}
        </div>

        {(canModerate || canDelete) && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {canModerate && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                {t('issueDetail.changeStatus')}
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="reported">{t('issueDetail.status.reported')}</option>
                  <option value="in_progress">{t('issueDetail.status.in_progress')}</option>
                  <option value="resolved">{t('issueDetail.status.resolved')}</option>
                </select>
              </label>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:underline ml-auto"
              >
                {t('issueDetail.deleteIssue')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-slate-800">{t('issueDetail.comments')}</h2>

        {comments.length === 0 && (
          <p className="text-sm text-slate-500">{t('issueDetail.noComments')}</p>
        )}

        {comments.map((comment) => (
          <div key={comment._id} className="bg-white rounded-md border border-slate-200 p-3">
            <p className="text-sm text-slate-700">{comment.text}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('issueDetail.commentPlaceholder')}
              required
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              {t('issueDetail.postComment')}
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-400">{t('issueDetail.loginToComment')}</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { api } from "../../services/api";
import "../styles/LoansManager.css";

type ActiveLoan = {
  id: number;
  user_id: number;
  book_id: number;
  checkout_date: string;
  due_date: string;
  status: string;
  book_title: string;
  book_author: string;
  user_name: string;
  user_email: string;
  is_overdue: boolean;
};

export function LoansManager() {
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getActiveLoans();
      setLoans(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load active loans"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    setReturningId(loanId);
    setFeedback(null);
    try {
      await api.returnLoan(loanId);
      setFeedback({
        type: "success",
        message: "Book marked as returned successfully",
      });
      await fetchActiveLoans();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to mark loan as returned",
      });
    } finally {
      setReturningId(null);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const overdueCount = loans.filter((loan) => loan.is_overdue).length;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading loans...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="loans-manager">
      <div className="manager-header">
        <h2>Active Loans</h2>
        <div className="stats-badges">
          <span className="badge badge-total">{loans.length} Active</span>
          {overdueCount > 0 && (
            <span className="badge badge-overdue">{overdueCount} Overdue</span>
          )}
        </div>
      </div>

      {error && (
        <div className="feedback-banner error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button onClick={fetchActiveLoans} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}

      {feedback && (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loans.length === 0 ? (
        <Card>
          <CardContent>
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>No active loans</h3>
              <p>All books have been returned.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="loans-table">
          <div className="table-header">
            <span>Book</span>
            <span>User</span>
            <span>Dates</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loans.map((loan) => {
            const isProcessing = returningId === loan.id;
            return (
              <div
                key={loan.id}
                className={`table-row ${loan.is_overdue ? "overdue" : ""}`}
              >
                <div className="book-info">
                  <BookOpen className="icon" />
                  <div>
                    <p className="book-title">{loan.book_title}</p>
                    <p className="book-author">by {loan.book_author}</p>
                  </div>
                </div>

                <div className="user-info">
                  <Users className="icon" />
                  <div>
                    <p className="user-name">{loan.user_name}</p>
                    <p className="user-email">
                      <Mail size={14} /> {loan.user_email}
                    </p>
                  </div>
                </div>

                <div className="dates-info">
                  <div className="date-row">
                    <span className="date-label">
                      <Calendar size={14} /> Checked out
                    </span>
                    <span>{formatDate(loan.checkout_date)}</span>
                  </div>
                  <div className="date-row">
                    <span className="date-label">
                      <Clock size={14} /> Due
                    </span>
                    <span>{formatDate(loan.due_date)}</span>
                  </div>
                </div>

                <div className="status-badge">
                  <span
                    className={`badge ${
                      loan.is_overdue ? "badge-error" : "badge-good"
                    }`}
                  >
                    {loan.is_overdue ? "Overdue" : "On Time"}
                  </span>
                </div>

                <div className="actions">
                  <button
                    className="return-btn"
                    onClick={() => handleReturn(loan.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Mark Returned"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

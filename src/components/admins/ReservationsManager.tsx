/***********************
 * ReservationsManager.tsx - Admin Reservations Management
 * Displays and manages reservation queues
 ***********************/
import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Book,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { api } from "../../services/api";
import "../styles/ReservationsManager.css";

type Reservation = {
  id: number;
  user_id: number;
  book_id: number;
  reservation_date: string;
  position: number;
  status: string;
  user_name: string;
  user_email: string;
  book_title: string;
  book_author: string;
  available_copies: number;
};

export function ReservationsManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllReservations();
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reservations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (reservationId: number) => {
    setProcessingId(reservationId);
    setFeedback(null);

    try {
      const result = await api.fulfillReservation(reservationId);
      setFeedback({
        type: "success",
        message: "Reservation fulfilled and loan created successfully!",
      });

      // Refresh list
      await fetchReservations();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to fulfill reservation",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    setProcessingId(reservationId);
    setFeedback(null);

    try {
      await api.cancelReservation(reservationId);
      setFeedback({
        type: "success",
        message: "Reservation cancelled successfully",
      });

      // Refresh list
      await fetchReservations();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to cancel reservation",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group reservations by book
  const groupedReservations = reservations.reduce((acc, reservation) => {
    const bookKey = reservation.book_id;
    if (!acc[bookKey]) {
      acc[bookKey] = {
        book_title: reservation.book_title,
        book_author: reservation.book_author,
        available_copies: reservation.available_copies,
        queue: [],
      };
    }
    acc[bookKey].queue.push(reservation);
    return acc;
  }, {} as Record<number, { book_title: string; book_author: string; available_copies: number; queue: Reservation[] }>);

  const totalReservations = reservations.length;
  const booksWithReservations = Object.keys(groupedReservations).length;
  const readyReservations = reservations.filter(
    (r) => r.status === "ready"
  ).length;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading reservations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="reservations-manager">
      <div className="manager-header">
        <h2>Reservation Queues</h2>
        <div className="stats-badges">
          <span className="badge badge-total">{totalReservations} Total</span>
          <span className="badge badge-info">
            {booksWithReservations} Books
          </span>
          {readyReservations > 0 && (
            <span className="badge badge-ready">{readyReservations} Ready</span>
          )}
        </div>
      </div>

      {error && (
        <div className="feedback-banner error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button onClick={fetchReservations} variant="outline" size="sm">
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

      {totalReservations === 0 ? (
        <Card>
          <CardContent>
            <div className="empty-state">
              <Users size={48} />
              <h3>No Active Reservations</h3>
              <p>
                All books are available or there are no pending reservations.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="reservations-list">
          {Object.entries(groupedReservations).map(([bookId, data]) => (
            <Card key={bookId} className="book-queue-card">
              <CardContent>
                <div className="book-queue-header">
                  <div className="book-info-header">
                    <Book size={20} />
                    <div>
                      <h3>{data.book_title}</h3>
                      <p>by {data.book_author}</p>
                    </div>
                  </div>
                  <div className="queue-stats">
                    <span className="queue-length">
                      {data.queue.length} in queue
                    </span>
                    <span
                      className={`copies-badge ${
                        data.available_copies > 0 ? "available" : "unavailable"
                      }`}
                    >
                      {data.available_copies}{" "}
                      {data.available_copies === 1 ? "copy" : "copies"}{" "}
                      available
                    </span>
                  </div>
                </div>

                <div className="queue-list">
                  {data.queue.map((reservation, index) => {
                    const isProcessing = processingId === reservation.id;
                    const canFulfill = data.available_copies > 0 && index === 0;

                    return (
                      <div key={reservation.id} className="queue-item">
                        <div className="position-badge">
                          #{reservation.position}
                        </div>

                        <div className="reservation-details">
                          <div className="user-details">
                            <span className="user-name">
                              {reservation.user_name}
                            </span>
                            <span className="user-email">
                              {reservation.user_email}
                            </span>
                          </div>
                          <div className="reservation-meta">
                            <span className="reserved-date">
                              Reserved{" "}
                              {formatDate(reservation.reservation_date)}
                            </span>
                            {reservation.status === "ready" && (
                              <span className="status-ready">
                                Ready for pickup
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="queue-actions">
                          {canFulfill && (
                            <Button
                              onClick={() => handleFulfill(reservation.id)}
                              disabled={isProcessing}
                              className="fulfill-btn"
                              size="sm"
                            >
                              {isProcessing ? "Processing..." : "Fulfill"}
                            </Button>
                          )}
                          <Button
                            onClick={() => handleCancel(reservation.id)}
                            disabled={isProcessing}
                            variant="outline"
                            className="cancel-btn"
                            size="sm"
                          >
                            <XCircle size={16} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

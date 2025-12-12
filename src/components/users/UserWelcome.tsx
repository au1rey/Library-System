import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { BookOpen, Search, Clock, Star, TrendingUp } from "lucide-react";
import "../styles/userwelcome.css";
import { api } from "../../services/api";

interface UserWelcomeProps {
  onNavigate: (screen: string) => void;
}

type Loan = {
  loan_id: number;
  book_title: string;
  book_author: string;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: string;
  is_overdue: boolean;
  days_remaining?: number;
};

type StatSnapshot = {
  borrowed: number;
  current: number;
  favorites: number;
  available: number;
};

export function UserWelcome({ onNavigate }: UserWelcomeProps) {
  const [stats, setStats] = useState<StatSnapshot>({
    borrowed: 0,
    current: 0,
    favorites: 0,
    available: 0,
  });
  const [currentBooks, setCurrentBooks] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loansData, booksWithCopies] = await Promise.all([
          api.getUserLoans(currentUser.id),
          api.getBooksWithCopies(),
        ]);

        const activeLoans: Loan[] = loansData.filter(
          (loan: Loan) => loan.status === "active"
        );

        const favoriteIds = getFavoriteIds();
        const availableBooks = booksWithCopies.reduce(
          (sum: number, book: any) => sum + (book.available_copies || 0),
          0
        );

        setStats({
          borrowed: loansData.length,
          current: activeLoans.length,
          favorites: favoriteIds.length,
          available: availableBooks,
        });
        setCurrentBooks(activeLoans);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const recommendations = [
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      reason: "Based on your reading history",
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      reason: "Popular in Literature",
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      reason: "Similar to 1984",
    },
  ];

  if (!currentUser) {
    return (
      <div className="userwelcome-container">
        <div className="userwelcome-header">
          <h1>Welcome to the Library</h1>
          <p>Please sign in to view your personalized dashboard.</p>
        </div>
        <Button onClick={() => onNavigate("sign-in")}>Sign In</Button>
      </div>
    );
  }

  const userStats = [
    {
      title: "Books Borrowed",
      value: stats.borrowed.toString(),
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Currently Reading",
      value: stats.current.toString(),
      icon: Clock,
      color: "orange",
    },
    {
      title: "Favorites",
      value: stats.favorites.toString(),
      icon: Star,
      color: "yellow",
    },
    {
      title: "Books Available",
      value: stats.available.toLocaleString(),
      icon: TrendingUp,
      color: "green",
    },
  ];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusLabel = (loan: Loan) => {
    if (loan.is_overdue) return "overdue";
    if ((loan.days_remaining ?? 0) < 3) return "due";
    return "onTime";
  };

  return (
    <div className="userwelcome-container">
      <div className="userwelcome-header">
        <h1>Welcome to the Library</h1>
        <p>
          Discover, borrow, and manage your reading journey with our
          comprehensive library system. Search our extensive catalog, track your
          borrowed books, and explore new recommendations tailored just for you.
        </p>
      </div>

      {error && <div className="userwelcome-error">{error}</div>}

      <div className="userwelcome-stats-grid">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="userwelcome-stat-content">
              <div className="userwelcome-stat-info">
                <p>{stat.title}</p>
                <p>{stat.value}</p>
              </div>
              <stat.icon className={`userwelcome-stat-icon ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="userwelcome-actions-grid">
        <Card
          className="userwelcome-action-card"
          onClick={() => onNavigate("user-search")}
        >
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <Search className="userwelcome-action-icon" />
              Search Books
            </CardTitle>
            <CardDescription>
              Explore our extensive library catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="userwelcome-full-btn userwelcome-primary-btn">
              Browse Catalog
            </Button>
          </CardContent>
        </Card>

        <Card
          className="userwelcome-action-card"
          onClick={() => onNavigate("user-books")}
        >
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <BookOpen className="userwelcome-action-icon" />
              Your Books
            </CardTitle>
            <CardDescription>
              Manage your borrowed books and reading list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="userwelcome-full-btn">
              View Your Books
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="userwelcome-content-grid">
        <Card>
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <Clock className="userwelcome-action-icon" />
              Currently Reading
            </CardTitle>
            <CardDescription>Your active borrowed books</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p>Loading your current books...</p>
            ) : currentBooks.length === 0 ? (
              <p className="userwelcome-empty">You have no active loans.</p>
            ) : (
              <div className="userwelcome-current-list">
                {currentBooks.map((book) => {
                  const status = getStatusLabel(book);
                  return (
                    <div
                      key={book.loan_id}
                      className="userwelcome-current-item"
                    >
                      <div className="userwelcome-current-header">
                        <div>
                          <p className="userwelcome-book-title">
                            {book.book_title}
                          </p>
                          <p className="userwelcome-book-author">
                            by {book.book_author}
                          </p>
                        </div>

                        <div className="userwelcome-current-status">
                          <p className="userwelcome-book-due">
                            Due: {formatDate(book.due_date)}
                          </p>
                          <span className={`status-badge ${status}`}>
                            {status === "onTime"
                              ? "On Time"
                              : status === "due"
                              ? "Due Soon"
                              : "Overdue"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="userwelcome-card-footer">
              <Button
                variant="outline"
                className="userwelcome-full-btn"
                onClick={() => onNavigate("user-books")}
              >
                View All Your Books
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <Star className="userwelcome-action-icon" />
              Staff Picks!
            </CardTitle>
            <CardDescription>
              Selections curated by our librarians
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="userwelcome-book-list">
              {recommendations.map((book, index) => (
                <div key={index} className="userwelcome-recommendation-item">
                  <div className="userwelcome-recommendation-info">
                    <p className="userwelcome-book-title">{book.title}</p>
                    <p className="userwelcome-book-author">by {book.author}</p>
                  </div>
                  <p className="userwelcome-recommendation-reason">
                    {book.reason}
                  </p>
                  <Button size="sm" variant="outline">
                    Add to List
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="userwelcome-full-btn userwelcome-btn-spacing"
              onClick={() => onNavigate("user-search")}
            >
              Explore More Books
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getFavoriteIds(): number[] {
  try {
    const stored = localStorage.getItem("favoriteBookIds");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

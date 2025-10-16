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

interface UserWelcomeProps {
  onNavigate: (screen: string) => void;
}

export function UserWelcome({ onNavigate }: UserWelcomeProps) {
  // Mock data for user dashboard
  const userStats = [
    { title: "Books Borrowed", value: "12", icon: BookOpen, color: "blue" },
    { title: "Currently Reading", value: "3", icon: Clock, color: "orange" },
    { title: "Favorites", value: "8", icon: Star, color: "yellow" },
    {
      title: "Books Available",
      value: "2,547",
      icon: TrendingUp,
      color: "green",
    },
  ];

  const currentBooks = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      dueDate: "Dec 15, 2024",
      progress: 65,
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      dueDate: "Dec 20, 2024",
      progress: 30,
    },
    {
      title: "1984",
      author: "George Orwell",
      dueDate: "Dec 25, 2024",
      progress: 80,
    },
  ];

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

  return (
    <div className="userwelcome-container">
      {/* Welcome Header */}
      <div className="userwelcome-header">
        <h1>Welcome to the Library</h1>
        <p>
          Discover, borrow, and manage your reading journey with our
          comprehensive library system. Search our extensive catalog, track your
          borrowed books, and explore new recommendations tailored just for you.
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
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
            <Button className="userwelcome-full-btn">Browse Catalog</Button>
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
        {/* Currently Reading */}
        <Card>
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <Clock className="userwelcome-action-icon" />
              Currently Reading
            </CardTitle>
            <CardDescription>Track your reading progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="userwelcome-book-list-container">
              <div className="userwelcome-book-list">
                {currentBooks.map((book, index) => (
                  <div key={index} className="userwelcome-book-item">
                    <div className="userwelcome-book-header">
                      <div className="userwelcome-book-info">
                        <p className="userwelcome-book-title">{book.title}</p>
                        <p className="userwelcome-book-author">
                          by {book.author}
                        </p>
                      </div>
                      <p className="userwelcome-book-due">
                        Due: {book.dueDate}
                      </p>
                    </div>
                    <div className="userwelcome-progress-container">
                      <div
                        className="userwelcome-progress-bar"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <p className="userwelcome-progress-text">
                      {book.progress}% complete
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="userwelcome-full-btn userwelcome-btn-spacing"
              onClick={() => onNavigate("user-books")}
            >
              View All Your Books
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="userwelcome-action-title">
              <Star className="userwelcome-action-icon" />
              Recommended for You
            </CardTitle>
            <CardDescription>Books you might enjoy</CardDescription>
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

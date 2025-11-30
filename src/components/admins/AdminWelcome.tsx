import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Search,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import "../styles/AdminWelcome.css";
import { api } from "../../services/api";
import "../styles/AdminAddBook.css";
interface AdminWelcomeProps {
  onNavigate: (screen: string) => void;
}

export function AdminWelcome({ onNavigate }: AdminWelcomeProps) {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const statsRes = await api.request("/api/admin/dashboard-stats");
        // const activityRes = await api.request("/api/admin/recent-activity");

        setStats(statsRes);
        // setActivity(activityRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats({ totalBooks: 0, totalUsers: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Toal Users",
      value: stats.totalUsers,
      icon: Users,
      color: "green",
    },
    // TO:DO more stats
    //{ title: "Books Borrowed", value: stats.borrowedBooks, icon: TrendingUp, color: "orange" },
    //{ title: "Overdue Books", value: stats.overdueBooks, icon: AlertTriangle, color: "red" },
  ];

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1>Welcome Back, Admin</h1>
        <p>Here's what's happening in your library today</p>
      </header>

      {/* Stats Section */}
      <section className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className="stat-card">
            <CardContent>
              <div className="stat-card-content">
                <div>
                  <p className="stat-title">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
                <stat.icon className={`stat-icon ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="actions-grid">
        <Card
          className="action-card"
          onClick={() => onNavigate("admin-add-book")}
        >
          <CardHeader>
            <CardTitle>
              <Plus /> Add New Book
            </CardTitle>
            <CardDescription>
              Quickly add books to the library catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Add Book</Button>
          </CardContent>
        </Card>

        <Card
          className="action-card"
          onClick={() => onNavigate("admin-search")}
        >
          <CardHeader>
            <CardTitle>
              <Search /> Search & Manage
            </CardTitle>
            <CardDescription>Search and manage existing books</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Search Books</Button>
          </CardContent>
        </Card>

        <Card className="action-card">
          <CardHeader>
            <CardTitle>
              <FileText /> Generate Reports
            </CardTitle>
            <CardDescription>
              Export library analytics and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">View Reports</Button>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <Card className="recent-activity">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and actions in the library system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TO:DO ACTIVITY DISPLAY: No activity displayed for now */}
          {/* {activity.map((activity, index) => (
            <div key={index} className="activity-row">
             <div>
              <p className="activity-action">{activity.action}</p>
              <p className="activity-detail">{activity.book}</p>
            </div>
            <p className="activity-time">{activity.time}</p>
          </div>
        ))} */}
        </CardContent>
      </Card>
    </div>
  );
}

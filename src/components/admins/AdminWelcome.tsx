import { BookOpen, Plus, Users, TrendingUp, AlertTriangle, FileText, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import "../styles/AdminWelcome.css";


interface AdminWelcomeProps {
  onNavigate: (screen: string) => void;
}

export function AdminWelcome({ onNavigate }: AdminWelcomeProps) {
  const stats = [
    { title: "Total Books", value: "2,547", icon: BookOpen, color: "blue" },
    { title: "Active Users", value: "1,283", icon: Users, color: "green" },
    { title: "Books Borrowed", value: "847", icon: TrendingUp, color: "orange" },
    { title: "Overdue Books", value: "23", icon: AlertTriangle, color: "red" },
  ];

  const recentActivity = [
    { action: "New book added", book: "The Great Gatsby", time: "2 hours ago" },
    { action: "Book returned", book: "To Kill a Mockingbird", time: "4 hours ago" },
    { action: "User registered", book: "John Smith joined", time: "6 hours ago" },
    { action: "Book borrowed", book: "1984", time: "8 hours ago" },
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
        {stats.map((stat, index) => (
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
        <Card className="action-card" onClick={() => onNavigate("admin-add-book")}>
          <CardHeader>
            <CardTitle>
              <Plus /> Add New Book
            </CardTitle>
            <CardDescription>Quickly add books to the library catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Add Book</Button>
          </CardContent>
        </Card>

        <Card className="action-card" onClick={() => onNavigate("admin-search")}>
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
            <CardDescription>Export library analytics and reports</CardDescription>
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
          <CardDescription>Latest updates and actions in the library system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-row">
              <div>
                <p className="activity-action">{activity.action}</p>
                <p className="activity-detail">{activity.book}</p>
              </div>
              <p className="activity-time">{activity.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

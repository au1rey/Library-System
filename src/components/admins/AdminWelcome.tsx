import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Users,
  AlertTriangle,
  FileText,
  Search,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { LoansManager } from "./LoansManager";
import { ReservationsManager } from "./ReservationsManager";
import "../styles/AdminWelcome.css";
import { api } from "../../services/api";

interface AdminWelcomeProps {
  onNavigate: (screen: string) => void;
}

export function AdminWelcome({ onNavigate }: AdminWelcomeProps) {
  const [stats, setStats] = useState<any>(null);
  const [loanStats, setLoanStats] = useState<any>(null);
  const [reservationStats, setReservationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "dashboard" | "loans" | "reservations"
  >("dashboard");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [statsRes, loanStatsRes, reservationStatsRes] = await Promise.all([
          api.request("/api/admin/dashboard-stats"),
          api.getLoanStats(),
          api.getReservationStats(),
        ]);

        setStats(statsRes);
        setLoanStats(loanStatsRes);
        setReservationStats(reservationStatsRes);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats({ totalBooks: 0, totalUsers: 0 });
        setLoanStats({ active_loans: 0, overdue_loans: 0 });
        setReservationStats({ pending_reservations: 0, ready_reservations: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;
  }

  if (activeView === "loans") {
    return (
      <div className="admin-container">
        <div className="view-header">
          <Button onClick={() => setActiveView("dashboard")} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
        <LoansManager />
      </div>
    );
  }

  if (activeView === "reservations") {
    return (
      <div className="admin-container">
        <div className="view-header">
          <Button onClick={() => setActiveView("dashboard")} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
        <ReservationsManager />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "green",
    },
    {
      title: "Active Loans",
      value: loanStats.active_loans || 0,
      icon: Clock,
      color: "orange",
      highlight: loanStats.overdue_loans > 0,
      subtitle:
        loanStats.overdue_loans > 0
          ? `${loanStats.overdue_loans} overdue`
          : null,
    },
    {
      title: "Reservations",
      value: reservationStats.pending_reservations || 0,
      icon: AlertTriangle,
      color: "purple",
      subtitle:
        reservationStats.ready_reservations > 0
          ? `${reservationStats.ready_reservations} ready`
          : null,
    },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Welcome Back, Admin</h1>
        <p>Here's what's happening in your library today</p>
      </header>

      <section className="stats-grid">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className={`stat-card ${stat.highlight ? "highlight" : ""}`}
          >
            <CardContent>
              <div className="stat-card-content">
                <div>
                  <p className="stat-title">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="stat-subtitle">{stat.subtitle}</p>
                  )}
                </div>
                <stat.icon className={`stat-icon ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="actions-grid">
        <Card className="action-card" onClick={() => onNavigate("admin-add-book")}>
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

        <Card className="action-card" onClick={() => setActiveView("loans")}>
          <CardHeader>
            <CardTitle>
              <Clock /> Manage Loans
            </CardTitle>
            <CardDescription>
              View and process active book loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              View Loans
              {loanStats.overdue_loans > 0 && (
                <span className="badge-mini">{loanStats.overdue_loans}</span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="action-card" onClick={() => setActiveView("reservations")}>
          <CardHeader>
            <CardTitle>
              <Users /> Manage Reservations
            </CardTitle>
            <CardDescription>
              Process reservation queues and fulfillments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              View Reservations
              {reservationStats.ready_reservations > 0 && (
                <span className="badge-mini">
                  {reservationStats.ready_reservations}
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="action-card">
          <CardHeader>
            <CardTitle>
              <FileText /> Generate Reports
            </CardTitle>
            <CardDescription>
              NOT AVAILABLE. COMING SOON.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {(loanStats.overdue_loans > 0 ||
        reservationStats.ready_reservations > 0) && (
        <Card className="alerts-card">
          <CardHeader>
            <CardTitle>
              <AlertTriangle /> Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="alerts-list">
              {loanStats.overdue_loans > 0 && (
                <div className="alert-item error">
                  <AlertTriangle size={20} />
                  <span>
                    {loanStats.overdue_loans}{" "}
                    {loanStats.overdue_loans === 1 ? "loan is" : "loans are"}{' '}
                    overdue
                  </span>
                  <Button onClick={() => setActiveView("loans")} size="sm">
                    Review
                  </Button>
                </div>
              )}
              {reservationStats.ready_reservations > 0 && (
                <div className="alert-item success">
                  <CheckCircle size={20} />
                  <span>
                    {reservationStats.ready_reservations}{" "}
                    {reservationStats.ready_reservations === 1
                      ? "reservation is"
                      : "reservations are"}{" "}
                    ready for pickup
                  </span>
                  <Button onClick={() => setActiveView("reservations")} size="sm">
                    Review
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

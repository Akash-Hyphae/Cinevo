import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CityModal from './components/CityModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import HomePage from './pages/HomePage.jsx';
import MoviesPage from './pages/MoviesPage.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';
import CinemaShowsPage from './pages/CinemaShowsPage.jsx';
import SeatSelectionPage from './pages/SeatSelectionPage.jsx';
import BookingSummaryPage from './pages/BookingSummaryPage.jsx';
import TicketSuccessPage from './pages/TicketSuccessPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ConcurrencyTester from './components/ConcurrencyTester.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CityProvider } from './context/CityContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CityProvider>
            <div className="min-h-screen flex flex-col bg-[#090b10] text-slate-100 selection:bg-violet-600 selection:text-white">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movies/:id" element={<MovieDetailsPage />} />
                  <Route path="/cinemas" element={<CinemaShowsPage />} />
                  <Route path="/seat-selection/:showId" element={<SeatSelectionPage />} />
                  <Route path="/booking-summary/:bookingId" element={<BookingSummaryPage />} />
                  <Route path="/ticket-success/:bookingId" element={<TicketSuccessPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route
                    path="/concurrency-test"
                    element={
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <ConcurrencyTester />
                      </div>
                    }
                  />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                </Routes>
              </main>

              <Footer />

              {/* Global Modals */}
              <CityModal />
              <AuthModal />
            </div>
          </CityProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

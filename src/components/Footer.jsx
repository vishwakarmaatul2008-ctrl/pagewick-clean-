import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand">PAGEWICK</span>
          <p>Stories worth staying up for.</p>
        </div>
        <nav className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/refund">Refund Policy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <p className="footer-copy">&copy; {year} Pagewick. All rights reserved.</p>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <div className="page container page-pad">
      <Seo title="Page Not Found" />
      <div className="empty-state">
        <h2>This page doesn't exist</h2>
        <p>The story or page you're looking for may have moved.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to Home
        </Link>
      </div>
    </div>
  )
}

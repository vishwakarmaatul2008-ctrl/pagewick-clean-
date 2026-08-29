import Seo from '../components/Seo'

export default function Contact() {
  return (
    <div className="page container page-pad legal-page">
      <Seo title="Contact" description="Get in touch with Pagewick." />
      <h1 className="page-title">Contact</h1>
      <p>
        For questions, feedback, or story submissions, reach out at{' '}
        <a href="mailto:hello@example.com">[add contact email]</a>.
      </p>
    </div>
  )
}

import Seo from '../components/Seo'

export default function Refund() {
  return (
    <div className="page container page-pad legal-page">
      <Seo title="Refund & Cancellation Policy" description="Pagewick's refund and cancellation policy." />
      <h1 className="page-title">Refund &amp; Cancellation Policy</h1>
      <p className="legal-updated">Last updated: [add date]</p>

      <p>
        Pagewick does not currently process any payments — premium stories
        cannot yet be purchased or unlocked. Because no transactions take
        place in V1, there is nothing to refund or cancel at this stage.
      </p>

      <p>
        Once premium unlocking through Razorpay is enabled, this page will be
        updated with a clear refund window, eligibility criteria, and the
        process for requesting a refund or cancellation.
      </p>

      <h2>Contact</h2>
      <p>
        Questions can be sent to [add contact email] and will be answered
        even before payments go live.
      </p>
    </div>
  )
}

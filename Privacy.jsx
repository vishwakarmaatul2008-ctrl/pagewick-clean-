import Seo from '../components/Seo'

export default function Privacy() {
  return (
    <div className="page container page-pad legal-page">
      <Seo title="Privacy Policy" description="How Pagewick handles your data." />
      <h1 className="page-title">Privacy Policy</h1>
      <p className="legal-updated">Last updated: [add date]</p>

      <p>
        Pagewick ("we", "us") does not require an account to use the site. This
        policy explains what limited data is involved when you use Pagewick.
      </p>

      <h2>Data stored on your device</h2>
      <p>
        Pagewick saves your bookmarks, reading progress, and story ratings using
        your browser's local storage. This information stays on your device
        and is not transmitted to our servers. Clearing your browser data or
        switching devices will remove it.
      </p>

      <h2>Data we may collect</h2>
      <p>
        If Pagewick is deployed with basic hosting analytics (for example,
        aggregated page-view logs from our hosting provider), that data does
        not identify you personally. Update this section if analytics or
        payment processing is added.
      </p>

      <h2>Payments</h2>
      <p>
        Pagewick does not process payments at this time. When premium unlocking
        is enabled through Razorpay, this policy will be updated to describe
        what payment data is handled and by whom.
      </p>

      <h2>Cookies</h2>
      <p>Pagewick does not use tracking or advertising cookies.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to [add contact email].
      </p>
    </div>
  )
}

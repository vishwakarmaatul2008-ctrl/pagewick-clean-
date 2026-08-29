import Seo from '../components/Seo'

export default function Terms() {
  return (
    <div className="page container page-pad legal-page">
      <Seo title="Terms of Service" description="The terms for using Pagewick." />
      <h1 className="page-title">Terms of Service</h1>
      <p className="legal-updated">Last updated: [add date]</p>

      <h2>Using Pagewick</h2>
      <p>
        Pagewick provides access to original fiction for reading. No account is
        required for V1. You agree to use Pagewick for personal, non-commercial
        reading only.
      </p>

      <h2>Content ownership</h2>
      <p>
        Stories published on Pagewick belong to their respective authors or to
        Pagewick. You may not copy, redistribute, or republish story content
        without permission.
      </p>

      <h2>Free and premium stories</h2>
      <p>
        Some stories are marked Free and others Premium. Premium unlocking is
        not yet available while payments are being set up. This section will
        be updated once purchases are enabled.
      </p>

      <h2>Availability</h2>
      <p>
        Pagewick is provided "as is." We may update, change, or remove stories
        and features at any time as the platform develops.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms as Pagewick grows. Continued use of Pagewick means you accept the current version.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent to [add contact email].</p>
    </div>
  )
}

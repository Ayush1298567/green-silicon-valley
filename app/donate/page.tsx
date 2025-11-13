export const dynamic = "force-dynamic";

export default function DonatePage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Support Green Silicon Valley</h1>
      <p className="mt-3 text-gsv-gray max-w-2xl">
        Your contribution helps students bring environmental STEM education to local classrooms.
      </p>
      <div className="card p-6 mt-6 max-w-xl">
        <a className="inline-flex items-center rounded-lg bg-gsv-green px-4 py-2 text-white shadow-soft" href="/api/donations/gofundme?source=site">
          Donate on GoFundMe
        </a>
        <p className="text-xs text-gsv-gray mt-3">
          You’ll be redirected to our official GoFundMe page. Thank you for supporting GSV.
        </p>
      </div>
    </div>
  );
}



import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-gsv-gray mt-2">We couldn’t find what you’re looking for.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-gsv-green text-white px-4 py-2">Back to home</Link>
    </div>
  );
}



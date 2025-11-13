export default function ContactPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-3 text-gsv-gray max-w-2xl">
        Get in touch with the GSV founders. Your message will be stored and,
        if email is configured, forwarded to the team.
      </p>
      <div className="card p-6 mt-6">
        <form className="grid gap-3" action="/api/contact" method="post">
          <input className="border rounded-lg px-3 py-2" name="name" placeholder="Your name" required />
          <input className="border rounded-lg px-3 py-2" name="email" placeholder="Your email" type="email" required />
          <textarea className="border rounded-lg px-3 py-2 min-h-[120px]" name="message" placeholder="Message" required />
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white w-fit">Send</button>
        </form>
      </div>
    </div>
  );
}



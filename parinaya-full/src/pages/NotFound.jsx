import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <h1 className="font-display text-5xl text-ink mb-4">404</h1>
      <p className="text-ink/60 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-flex px-7 py-3.5 bg-ink text-paper text-sm tracking-wide uppercase hover:bg-gold-dark transition-colors duration-200"
      >
        Return Home
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  category: string | null;
  created_at: string;
}

interface Props {
  posts: BlogPost[];
}

export default function RecentBlogPosts({ posts }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="card overflow-hidden hover:shadow-xl transition-shadow group"
        >
          {post.cover_image ? (
            <div className="aspect-video bg-gray-200 overflow-hidden relative">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gsv-greenSoft to-green-100 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
          )}
          
          <div className="p-6">
            {post.category && (
              <span className="inline-block px-3 py-1 bg-gsv-greenSoft text-gsv-green text-xs font-medium rounded-full mb-3">
                {post.category}
              </span>
            )}
            
            <h3 className="font-semibold text-lg mb-3 group-hover:text-gsv-green transition-colors">
              {post.title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gsv-gray">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString()}
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}


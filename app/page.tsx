import { allBlogs } from ".contentlayer/generated";

import Avatar from "@/app/components/ui/Avatar";

export default function Home() {
  const blogs = allBlogs
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    // 3 most recent
    .filter((_, i) => i < 3);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <div className="flex animate-in flex-col gap-8">
        <div
          className="animate-in"
          style={{ "--index": 1 } as React.CSSProperties}
        >
          <Avatar alt="Gabriel Falis" initials="gf" size="lg" />
        </div>
        <div
          className="animate-in space-y-4"
          style={{ "--index": 2 } as React.CSSProperties}
        >
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Gabriel Falis
          </h1>
          <p className="max-w-lg text-secondary">
            Hello, my name is Gabriel Falis. I’m a full stack developer and
            primarily a mobile app developer based in Europe, Slovakia. I run my
            own development studio to build mobile apps that I’d like to use and
            help create quality apps for startups and businesses.
          </p>
        </div>
      </div>
      {/* <div
        className="animate-in"
        style={{ "--index": 3 } as React.CSSProperties}
      >
        <BentoGrid />
      </div> */}
      {/* <div
        className="flex animate-in flex-col gap-8"
        style={{ "--index": 4 } as React.CSSProperties}
      >
        <div className="space-y-4">
          <Link
            className="group flex items-center gap-2 text-xl font-semibold tracking-tight text-primary"
            href="/blog"
          >
            Latest blogs
            <ArrowUpRightIcon className="h-5 w-5 text-tertiary transition-all group-hover:text-primary" />
          </Link>
          <p className="max-w-lg text-secondary">
            I occasionally write about programming, productivity, and more.
            Check me out and subscribe to stay up to date.
          </p>
        </div>
        <PostList posts={blogs} />
      </div> */}
    </div>
  );
}

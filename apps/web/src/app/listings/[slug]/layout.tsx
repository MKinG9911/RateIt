import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/listings/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: 'Listing | RateIt',
        description: 'Explore authentic community ratings and reviews on RateIt.',
      };
    }

    const json = await res.json();
    const listing = json?.data;

    if (!listing) {
      return {
        title: 'Listing Not Found | RateIt',
      };
    }

    const title = `${listing.name} — Reviews & Rating | RateIt`;
    const ratingSummary = listing.averageRating
      ? `Rated ${listing.averageRating.toFixed(1)}/5.0 across ${listing.reviewCount} community reviews. `
      : '';
    const description = `${ratingSummary}${
      listing.description
        ? listing.description.slice(0, 200)
        : `Read verified user reviews and rate ${listing.name} on RateIt.`
    }`;

    const images = listing.imageUrl ? [{ url: listing.imageUrl, alt: listing.name }] : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: 'RateIt',
        images,
      },
      twitter: {
        card: listing.imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: listing.imageUrl ? [listing.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: 'RateIt — Rate & Review Everything',
      description: 'Community-driven ratings and reviews for products, places, and services.',
    };
  }
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

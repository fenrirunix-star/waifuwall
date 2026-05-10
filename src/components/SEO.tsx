import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: object;
}

export function SEO({ 
  title = "WaifuWall | Premium AI Anime Wallpapers", 
  description = "Discover high-quality, premium AI-generated anime wallpapers. Download thousands of 4K anime backgrounds for desktop and mobile.",
  keywords = "anime wallpaper, ai anime art, 4k wallpapers, waifu wallpaper, anime backgrounds",
  image = "/og-image.png", // Base image if none provided
  url = "https://waifuwall-psi.vercel.app",
  type = "website",
  schema
}: SEOProps) {
  const siteName = "WaifuWall";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Schema Markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Additional Tags */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}

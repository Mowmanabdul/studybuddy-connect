import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO = ({ 
  title = "Thuto AI – AI-Powered Maths & Science Tutoring",
  description = "Personalized 1-on-1 tutoring for Grades 8-12. AI diagnostic tests, expert South African tutors, and smart homework help for CAPS curriculum success."
}: SEOProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
  </Helmet>
);

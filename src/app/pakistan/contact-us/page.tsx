import GlobalOffices from '@/components/GlobalOffices/page';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Contact Us | Pakistan | JnS Education ',
  description: 'Get in touch with our team in the Pakistan for any inquiries or support.',
};
export default function ContactUsPage() {
    return (
        <>
        <PageHero
        title="Contact Us"
        bgImage="/images/events/events-banner.webp"
      />
      <GlobalOffices />
        </>
    )
}
import GlobalOffices from '@/components/GlobalOffices/page';
import PageHero from '@/components/PageHero';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'JnS Education | Contact Us | Middle East',
  description: 'Get in touch with our team in the Middle East for any inquiries or support.',
};
export default function ContactUsPage() {
    return (
        <>
        <PageHero
        title="Contact Us"
        bgImage="https://www.purdue.edu/hla/sites/hla-happenings/wp-content/uploads/sites/14/2024/02/TC406538-1024x576.jpg"
      />
      <GlobalOffices />
        </>
    )
}
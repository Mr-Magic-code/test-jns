import PakHeader from '@/components/Headers/PakHeader';
import PakFooter from '@/components/Footers/PakFooter';

export default function PakistanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PakHeader />
      <main className="flex-1">
        {children}
      </main>
      <PakFooter />
    </>
  );
}
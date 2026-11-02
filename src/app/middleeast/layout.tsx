import MEHeader from '@/components/Headers/MEHeader';
import MEFooter from '@/components/Footers/MEFooter';

export default function MiddleEastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MEHeader />
      <main className="flex-1">{children}</main>
      <MEFooter />
    </>
  );
}
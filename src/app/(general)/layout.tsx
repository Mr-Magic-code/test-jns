import GenHeader from '@/components/Headers/GenHeader';
import GenFooter from '@/components/Footers/GenFooter';
export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GenHeader />
      <main className="flex-1">
        {children}
        </main>
        <GenFooter />
    </>
  );
}
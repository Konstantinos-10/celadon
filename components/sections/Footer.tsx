/* Fixed behind the page at z-index 0. The main element scrolls past
   and uncovers it, so this element never moves itself. */
export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 top-auto z-0 h-screen bg-pitch text-bone">
      <div className="page-shell section-pad grid-12">
        <h2 className="text-h2 col-span-full">Footer</h2>
      </div>
    </footer>
  );
}

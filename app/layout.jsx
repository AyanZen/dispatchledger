import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Dispatch Ledger",
  description: "Franchise credit and dispatch management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: Who owes us what, and how late — answered on a light violet console. Refuses a dark gold ledger and the five-equal-KPI dashboard.
OWN-WORLD: Lavender ground, floating white cards at 20px, one violet accent (#6d4aec); left capture dock, main chart board, right ageing rail; Manrope, tabular rupees.
STORY: An admin sees the outstanding balance, who is past terms, and can record a payment without leaving the nav.
FIRST VIEWPORT: Sticky white sidebar with capture dock; three metric cards with sparklines; wide dispatched-vs-received chart; ageing donut; right rail of overdue, activity, and the signed-in account.
FORM: Brief-pinned Geex-style admin console, light only.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

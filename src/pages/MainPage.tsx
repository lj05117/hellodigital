import { HorizontalCaseSection } from "../components/HorizontalCaseSection";
import { caseItems } from "../fixtures/caseData";

export default function MainPage() {
  return (
    <div className="page-shell">
      <main className="page-flow">
        <section className="empty-block"></section>

        <HorizontalCaseSection items={caseItems} />

        <section className="empty-block"></section>
      </main>
    </div>
  );
}

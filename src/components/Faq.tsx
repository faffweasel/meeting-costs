const FAQ_ITEMS = [
  {
    question: 'Why 1,890 working hours per year?',
    answer:
      '252 working days (365 minus 104 weekend days, 8 bank holidays, and 1 discretionary day) at 7.5 hours per day. Some calculators use 1,820 (7-hour days) or 2,080 (US 40-hour weeks). We use 7.5 hours because that\u2019s the standard contracted day for most UK professional and public sector roles.',
  },
  {
    question: 'Why not include employer on-costs by default?',
    answer:
      'The salary cost is what most people intuitively understand. It\u2019s the number on the job advert. On-costs (employer NI, pension, apprenticeship levy) are what the organisation actually pays, adding 20\u201335%. We show both when you toggle on-costs, because both are useful. If you\u2019re making a case to reduce meetings, the \u201ctrue cost\u201d figure is more compelling.',
  },
  {
    question: 'Does this include all employer costs?',
    answer:
      'On-costs cover employer National Insurance (15% above \u00a35,000), pension contributions (3% auto-enrolment minimum), and the apprenticeship levy (0.5%). It doesn\u2019t include recruitment costs, equipment, office space, training, or management overhead. The real cost of an employee\u2019s time is higher still.',
  },
  {
    question: 'Is this accurate?',
    answer:
      'It\u2019s an estimate. People don\u2019t work every minute they\u2019re paid for, salary is only one component of compensation, and not everyone in a meeting is equally expensive. The point isn\u2019t precision, it\u2019s making the invisible cost of meetings visible.',
  },
  {
    question: 'What if people have very different salaries?',
    answer:
      'Without on-costs, only the total salary matters. Simple mode with the right average gives the same result. With on-costs enabled, individual salaries matter because pension contributions are capped per person. Use Advanced mode to see the difference.',
  },
  {
    question: 'How do I actually reduce meeting costs?',
    answer:
      'Audit every meeting for two weeks: who attends, how long, and whether a decision was made. Cut any meeting where no decision happens. Shorten defaults: 25 minutes instead of 30, 50 instead of 60. Replace status updates with async tools. Ask: does everyone invited actually need to be there?',
  },
  {
    question: 'Is my data stored anywhere?',
    answer:
      'No. Everything runs in your browser. No data is sent to any server. No cookies, no accounts, no analytics.',
  },
] as const;

function Faq(): React.ReactNode {
  return (
    <section className="mt-12 text-left">
      <h2 className="mb-4 text-center font-bold" style={{ color: 'var(--muted)' }}>
        FAQ
      </h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details key={item.question} className="group">
            <summary className="cursor-pointer py-2" style={{ color: 'var(--text)' }}>
              {item.question}
            </summary>
            <p className="pb-3 pt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export { Faq };

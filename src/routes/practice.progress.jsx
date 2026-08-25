import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/practice/progress")({
  head: () => ({
    meta: [
      { title: "Your Musical Journey — Instrumento" },
      {
        name: "description",
        content: "Track practice time, completed exercises, streaks, and personal best scores.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const stats = {
    totalPracticeTime: "2h 45m",
    sessionsCompleted: 18,
    averageAccuracy: "91%",
    bestInstrument: "Piano",
    currentStreak: "5 Days",
  };

  const recentHistory = [
    { date: "Today", exercise: "C Major Scale", instrument: "Piano", accuracy: "95%", streak: "12" },
    { date: "Yesterday", exercise: "Backbeat Groove", instrument: "Drums", accuracy: "88%", streak: "8" },
    { date: "3 days ago", exercise: "Twinkle Twinkle", instrument: "Piano", accuracy: "92%", streak: "14" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4">
        <h1 className="font-display text-4xl uppercase tracking-tight">Your Musical Journey</h1>
        <p className="label-mono mt-1">Artistic Practice Stats & Musical Progress</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="panel p-5">
          <p className="label-mono">PRACTICE TIME</p>
          <p className="font-display text-3xl text-signal mt-1">{stats.totalPracticeTime}</p>
        </div>
        <div className="panel p-5">
          <p className="label-mono">SESSIONS COMPLETED</p>
          <p className="font-display text-3xl text-foreground mt-1">{stats.sessionsCompleted}</p>
        </div>
        <div className="panel p-5">
          <p className="label-mono">AVG ACCURACY</p>
          <p className="font-display text-3xl text-signal mt-1">{stats.averageAccuracy}</p>
        </div>
        <div className="panel p-5">
          <p className="label-mono">CURRENT STREAK</p>
          <p className="font-display text-3xl text-foreground mt-1">{stats.currentStreak}</p>
        </div>
      </div>

      <div className="panel p-5 space-y-4">
        <h3 className="font-display text-xl uppercase tracking-tight">Recent Sessions</h3>
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-panel-edge text-muted-foreground uppercase label-mono">
              <th className="pb-3">Date</th>
              <th className="pb-3">Exercise</th>
              <th className="pb-3">Instrument</th>
              <th className="pb-3">Accuracy</th>
              <th className="pb-3">Best Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-edge">
            {recentHistory.map((item, idx) => (
              <tr key={idx} className="hover:bg-accent">
                <td className="py-3 text-muted-foreground">{item.date}</td>
                <td className="py-3 font-bold text-foreground">{item.exercise}</td>
                <td className="py-3 text-signal">{item.instrument}</td>
                <td className="py-3">{item.accuracy}</td>
                <td className="py-3">{item.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

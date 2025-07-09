export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="bg-card text-card-foreground border border-border shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold">ChainCare UI Test</h1>
        <p className="text-muted-foreground mt-2">This is your custom theme in action.</p>
        <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow">
          Primary Action
        </button>
      </div>
    </div>
  );
}

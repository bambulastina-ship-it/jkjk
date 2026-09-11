const App = () => {
  const { Hero, AdvisoryCapabilities } = window;
  return (
    <main className="bg-black">
      <Hero />
      <AdvisoryCapabilities />
    </main>
  );
};

window.App = App;

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

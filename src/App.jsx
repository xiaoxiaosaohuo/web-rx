import Terminal from './components/Terminal';
import Editor from './components/Editor';
import Plot from './components/Plot';
import Files from './components/Files';
import './App.css';

function App({ webR, terminalInterface, filesInterface, plotInterface }) {
  return (
    <div className="repl">
      <Editor
        webR={webR}
        terminalInterface={terminalInterface}
        filesInterface={filesInterface}
      />
      <Files webR={webR} filesInterface={filesInterface} />
      <Terminal webR={webR} terminalInterface={terminalInterface} />
      <Plot plotInterface={plotInterface} />
    </div>
  );
}

export default App;

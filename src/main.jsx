import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebR } from 'webr';
import App from './App.jsx';
import './index.css';

const terminalInterface = {
  println: (msg) => {
    console.log(msg);
  },
  read: () => Promise.reject(new Error('Unable to read from webR terminal.')),
  write: (msg) => {
    console.log(msg);
  },
};

const filesInterface = {
  refreshFilesystem: () => Promise.resolve(),
  openFileInEditor: () => {
    throw new Error('Unable to open file, editor not initialised.');
  },
};

const plotInterface = {
  newPlot: () => {},
  drawImage: (img) => {
    throw new Error('Unable to plot, plotting not initialised.');
  },
};

async function handleCanvasMessage(msg) {
  if (msg.data.event === 'canvasImage') {
    plotInterface.drawImage(msg.data.image);
  } else if (msg.data.event === 'canvasNewPage') {
    plotInterface.newPlot();
  }
}

async function handlePagerMessage(msg) {
  const { path, title, deleteFile } = msg.data;
  await filesInterface.openFileInEditor(title, path, true);
  if (deleteFile) {
    webR.FS.unlink(path);
  }
}

const webR = new WebR();
globalThis.webR = webR;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App
      webR={webR}
      terminalInterface={terminalInterface}
      filesInterface={filesInterface}
      plotInterface={plotInterface}
    />
  </React.StrictMode>
);

(async () => {
  await webR.init();

  // Set the default graphics device and pager
  await webR.evalRVoid('webr::pager_install()');
  await webR.evalRVoid('webr::canvas_install()');

  // shim function from base R with implementations for webR
  // see ?webr::shim_install for details.
  await webR.evalRVoid('webr::shim_install()');

  // If supported, show a menu when prompted for missing package installation
  // const showMenu =
  //   crossOriginIsolated || navigator.serviceWorker.controller
  //     ? 'TRUE'
  //     : 'FALSE';

  // await webR.evalRVoid(`webr::global_prompt_install(${showMenu})`, {
  //   withHandlers: false,
  // });

  // Clear the loading message
  terminalInterface.write('\x1b[2K\r');

  for (;;) {
    const output = await webR.read();
    switch (output.type) {
      case 'stdout':
        terminalInterface.println(output.data);
        break;
      case 'stderr':
        terminalInterface.println(`\x1b[1;31m${output.data}\x1b[m`);
        break;
      case 'prompt':
        filesInterface.refreshFilesystem();
        terminalInterface.read(output.data).then((command) => {
          webR.writeConsole(command);
        });
        break;
      case 'canvas':
        await handleCanvasMessage(output);
        break;
      case 'pager':
        await handlePagerMessage(output);
        break;
      case 'closed':
        throw new Error('The webR communication channel has been closed');
      default:
        console.error(`Unimplemented output type: ${output.type}`);
        console.error(output.data);
    }
  }
})();

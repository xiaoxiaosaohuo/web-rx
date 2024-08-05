// Originally from src/Components/codeMirror/utils.ts in rstudio/shinylive
// MIT License - Copyright (c) 2022 RStudio, PBC

import { Text } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export function offsetToPosition(cmDoc, offset) {
  const line = cmDoc.lineAt(offset);
  return { line: line.number, col: offset - line.from };
}

export function positionToOffset(cmDoc, pos) {
  const line = cmDoc.line(pos.line);
  // Try go to the next computed position (line.from + pos.col), but don't go
  // past the end of the line (line.to).
  const newOffset = Math.min(line.from + pos.col, line.to);

  // If the new offset is beyond the end of the document, just go to the end.
  if (newOffset > cmDoc.length) {
    return cmDoc.length;
  }
  return newOffset;
}

export function getSelectedText(cmView) {
  const cmState = cmView.state;
  return cmState.sliceDoc(
    cmState.selection.main.from,
    cmState.selection.main.to
  );
}

export function getCurrentLineText(cmView) {
  const cmState = cmView.state;
  const offset = cmState.selection.main.head;
  const pos = offsetToPosition(cmState.doc, offset);
  const lineText = cmState.doc.line(pos.line).text;
  return lineText;
}

export function moveCursorToNextLine(cmView) {
  const cmState = cmView.state;
  const offset = cmState.selection.main.head;
  const pos = offsetToPosition(cmState.doc, offset);
  pos.line += 1;

  // Don't go past the bottom
  if (pos.line > cmState.doc.lines) {
    return;
  }

  const nextLineOffset = positionToOffset(cmState.doc, pos);
  cmView.dispatch({ selection: { anchor: nextLineOffset } });
}

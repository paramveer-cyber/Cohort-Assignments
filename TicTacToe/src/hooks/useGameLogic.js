import { useState, useCallback } from 'react';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function detectWin(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

const EMPTY_BOARD = Array(9).fill(null);

export function useGameLogic() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [turn, setTurn] = useState('X');
  const [result, setResult] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [history, setHistory] = useState([]);

  const play = useCallback((index) => {
    if (result || board[index]) return;

    const next = board.map((v, i) => (i === index ? turn : v));
    const win = detectWin(next);
    const isDraw = !win && next.every(Boolean);

    setBoard(next);
    setHistory((h) => [...h, { board: next, turn }]);

    if (win) {
      setResult({ type: 'win', winner: win.winner });
      setWinLine(win.line);
      setScores((s) => ({ ...s, [win.winner]: s[win.winner] + 1 }));
    } else if (isDraw) {
      setResult({ type: 'draw' });
    } else {
      setTurn((t) => (t === 'X' ? 'O' : 'X'));
    }
  }, [board, turn, result]);

  const reset = useCallback(() => {
    setBoard(EMPTY_BOARD);
    setTurn('X');
    setResult(null);
    setWinLine([]);
    setHistory([]);
  }, []);

  const resetAll = useCallback(() => {
    reset();
    setScores({ X: 0, O: 0 });
  }, [reset]);

  return { board, turn, result, winLine, scores, history, play, reset, resetAll };
}

import { useCallback, useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import './App.css';
import Cell from './Cell';

function sum(array) {
  return array.reduce((s, x) => s + x);
}

function App() {
  const [totalMinutes] = useState(5);

  const [table, setTable] = useState(
    Array.from({ length: 24 * 34 }, () => ({
      rotation: Math.floor(Math.random() * 8),
      clicked: false,
    }))
  );
  const [finished, setFinished] = useState(false);
  const [T, setT] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [M, setM] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [N, setN] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [Nt, setNt] = useState(0);
  const [A, setA] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [At, setAt] = useState(0);
  const [P, setP] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [Pt, setPt] = useState(0);
  const [Q, setQ] = useState(Array.from({ length: totalMinutes }, () => 0));
  const [Qt, setQt] = useState(0);
  const [S, setS] = useState(0);
  const [Kp, setKp] = useState(0);
  const [Ta, setTa] = useState(0);

  const onFinish = useCallback(() => {
    setFinished(true);

    const slices = T.map((t, i) => table.slice(T[i - 1], t + 1));

    const M = slices.map(
      (slice) => slice.filter((cell) => cell.rotation === 2).length
    );
    setM(M);

    const N = slices.map(
      (slice) =>
        slice.filter(
          (cell) =>
            (cell.rotation === 2 && !cell.clicked) ||
            (cell.rotation !== 2 && cell.clicked)
        ).length
    );
    setN(N);

    const A = M.map((m, i) => (m - N[i]) / m);
    setA(A);

    const Q = slices.map((slice) => slice.length);
    setQ(Q);

    const P = A.map((a, i) => a * Q[i]);
    setP(P);

    const Qt = sum(Q);
    setQt(Qt);

    const Nt = sum(N);
    setNt(Nt);

    const S = 0.54 * Qt - 2.8 * Nt;
    setS(S);

    const Pt = sum(P) / P.length;
    setPt(Pt);

    const Kp = ((P[0] - P[5]) / Pt) * 500;
    setKp(Kp);

    const At = sum(A) / A.length;
    setAt(At);

    const Ta = ((A[0] - A[5]) / At) * 100;
    setTa(Ta);
  }, [T, table]);

  const timer = useTimer({
    expiryTimestamp: Date.now() + totalMinutes * 60 * 1000,
    onExpire: onFinish,
  });

  const cellClicked = useCallback(
    (index) => {
      if (
        timer.isRunning &&
        !table.slice(index + 1).some((cell) => cell.clicked)
      ) {
        const cell = table[index];
        cell.clicked = true;
        setTable(table.slice());
      }
    },
    [table, timer.isRunning]
  );

  const [shouldDoubleClick, setShouldDoubleClick] = useState(false);

  const cellDoubleClicked = useCallback(
    (index) => {
      if (
        (timer.minutes === 0 && timer.seconds === 0) ||
        (shouldDoubleClick &&
          !table.slice(index + 1).some((cell) => cell.clicked))
      ) {
        T[totalMinutes - timer.minutes - 1] = index;
        setT(T.slice());
        setShouldDoubleClick(false);
        if (timer.minutes !== 0)
          timer.restart(Date.now() + (timer.minutes * 60 - 1) * 1000, true);
        else onFinish();
      }
    },
    [T, onFinish, shouldDoubleClick, table, timer, totalMinutes]
  );

  useEffect(() => {
    if (timer.seconds === 0 && timer.minutes !== totalMinutes) {
      setShouldDoubleClick(true);
      timer.pause();
    }
  }, [timer, timer.minutes, timer.seconds, totalMinutes]);

  const renderArray = useCallback(
    (array, letter, avg) => (
      <>
        {array.map((x, i) => (
          <p key={i}>
            {letter}
            {i + 1} = {x}
          </p>
        ))}
        {avg !== undefined ? (
          <p>
            {letter}t = {avg}
          </p>
        ) : (
          <></>
        )}
        <br />
      </>
    ),
    []
  );

  return (
    <>
      <div className="container">
        <button onClick={timer.start}>Start</button>

        <div className="grid">
          {table.map((cell, i) => (
            <Cell
              key={i}
              index={i}
              cell={cell}
              cellClicked={cellClicked}
              cellDoubleClicked={cellDoubleClicked}
            />
          ))}
        </div>

        <span style={{ color: shouldDoubleClick ? 'red' : 'black' }}>{`${
          timer.minutes.toString().length < 2
            ? '0' + timer.minutes
            : timer.minutes
        }:${
          timer.seconds.toString().length < 2
            ? '0' + timer.seconds
            : timer.seconds
        }`}</span>
      </div>

      {/* {finished ? ( */}
      <div>
        <h1>Результаты:</h1>
        {renderArray(M, 'M')}
        {renderArray(N, 'N', Nt)}
        {renderArray(A, 'A', At)}
        {renderArray(Q, 'Q', Qt)}
        {renderArray(P, 'P', Pt)}
        <p>S = {S}</p>
        <p>Kp = {Kp}</p>
        <p>Ta = {Ta}</p>
      </div>
      {/* ) : ( */}
      {/* <></> */}
      {/* )} */}
    </>
  );
}

export default App;

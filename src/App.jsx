import { useCallback, useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import './App.css';
import Cell from './Cell';

function sum(array) {
  return array.reduce((s, x) => s + +x, 0);
}

function App() {
  const [totalMinutes] = useState(5);

  const [table, setTable] = useState(
    Array.from({ length: 24 * 34 }, () => ({
      rotation: Math.floor(Math.random() * 8),
      clicked: false,
    }))
  );
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [T, setT] = useState([]);
  const [M, setM] = useState([]);
  const [N, setN] = useState([]);
  const [Nt, setNt] = useState(0);
  const [A, setA] = useState([]);
  const [At, setAt] = useState(0);
  const [P, setP] = useState([]);
  const [Pt, setPt] = useState(0);
  const [Q, setQ] = useState([]);
  const [Qt, setQt] = useState(0);
  const [S, setS] = useState(0);
  const [Kp, setKp] = useState(0);
  const [Ta, setTa] = useState(0);

  const onFinish = useCallback(
    (T, timePassed) => {
      if (!timePassed) timePassed = totalMinutes * 60;

      setFinished(true);

      const slices = T.map((t, i) => table.slice(T[i - 1] + 1, t + 1));

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

      const A = M.map((m, i) => (m ? (m - N[i]) / m : N[i] ? 0 : 1));
      setA(A);

      const Q = slices.map((slice) => slice.length);
      setQ(Q);

      const P = A.map((a, i) => a * Q[i]);
      setP(P);

      const Qt = sum(Q);
      setQt(Qt);

      const Nt = sum(N);
      setNt(Nt);

      const S = (0.54 * Qt - 2.8 * Nt) / timePassed;
      setS(S);

      const Pt = sum(P) / P.length;
      setPt(Pt);

      const Kp = ((P[0] - P[P.length - 1]) / Pt) * 500;
      setKp(Kp);

      const At = sum(A) / A.length;
      setAt(At);

      const Ta = Math.abs(((A[0] - A[A.length - 1]) / At) * 100);
      setTa(Ta);

      console.log({
        T,
        M,
        N,
        A,
        Q,
        P,
        Qt,
        Nt,
        S,
        Pt,
        Kp,
        At,
        Ta,
      });
    },
    [table, totalMinutes]
  );

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
        T.push(index);
        setT(T.slice());
        setShouldDoubleClick(false);
        if (timer.minutes !== 0)
          timer.restart(Date.now() + (timer.minutes * 60 - 1) * 1000, true);
        else onFinish(T);
      }
    },
    [T, onFinish, shouldDoubleClick, table, timer]
  );

  useEffect(() => {
    if (!finished && timer.seconds === 0 && timer.minutes !== totalMinutes) {
      setShouldDoubleClick(true);
      timer.pause();
    }
  }, [finished, timer, timer.minutes, timer.seconds, totalMinutes]);

  const renderArray = useCallback(
    (array, letter, avg) => (
      <>
        {array.map((x, i) => (
          <p key={i}>
            {letter}
            {i + 1} = {x ? x : 0}
          </p>
        ))}
        {avg !== undefined ? (
          <p>
            {letter}t = {avg ? avg : 0}
          </p>
        ) : (
          <></>
        )}
        <br />
      </>
    ),
    []
  );

  const onStartClick = useCallback(() => {
    timer.start();
    setStarted(true);
  }, [timer]);

  const onFinishClick = useCallback(() => {
    T.push(table.length - 1);
    setT(T.slice());
    onFinish(T, totalMinutes * 60 - timer.minutes * 60 - timer.seconds);
    timer.restart(Date.now);
  }, [T, onFinish, table.length, timer, totalMinutes]);

  return (
    <>
      <div className="container">
        <div className="left-container">
          <div className="button-group">
            <button
              className="button"
              disabled={started}
              onClick={onStartClick}
            >
              Start
            </button>
            <button
              className="button"
              disabled={finished || !started}
              onClick={onFinishClick}
            >
              Finish
            </button>
          </div>
          <h2 style={{ marginBottom: 0 }}>Инструкция:</h2>
          <ol>
            <li>
              Нажмите кнопку <b>Start</b>
            </li>
            <li>
              Нажимайте по порядку на{' '}
              <div style={{ display: 'inline-block' }}>
                <Cell cell={{ rotation: 2 }} width={20} height={20} />
              </div>{' '}
              с отверстием на 3 часа
            </li>
            <li>
              При истечении каждой минуты, таймер и поле станет красным и вам
              надо нажать двойным кликом на кольцо, на котором остановились
            </li>
            <li>
              Если вы закончили раньше времени, нажмите кнопку <b>Finish</b>
            </li>
            <li>
              После окончания пролистайте страницу вниз для получения
              результатов
            </li>
            <li>
              <div style={{ display: 'inline-block' }}>
                <Cell
                  cell={{ rotation: 2, clicked: true }}
                  finished={true}
                  width={20}
                  height={20}
                />
              </div>{' '}
              - правильный
              <br />
              <div style={{ display: 'inline-block' }}>
                <Cell
                  cell={{ rotation: 1, clicked: true }}
                  finished={true}
                  width={20}
                  height={20}
                />
              </div>{' '}
              - неправильный
              <br />
              <div style={{ display: 'inline-block' }}>
                <Cell
                  cell={{ rotation: 2 }}
                  finished={true}
                  width={20}
                  height={20}
                />
              </div>{' '}
              - пропущенный
            </li>
          </ol>
        </div>

        <div
          className="grid"
          style={{
            backgroundColor: shouldDoubleClick
              ? 'rgb(255, 0, 0, 0.4)'
              : 'transparent',
          }}
        >
          {table.map((cell, i) => (
            <Cell
              key={i}
              index={i}
              cell={cell}
              cellClicked={cellClicked}
              cellDoubleClicked={cellDoubleClicked}
              finished={finished}
              T={T}
            />
          ))}
        </div>

        <span
          style={{
            color: shouldDoubleClick ? 'red' : 'black',
            fontSize: '32px',
            width: '20%',
            textAlign: 'center',
          }}
        >{`${
          timer.minutes.toString().length < 2
            ? '0' + timer.minutes
            : timer.minutes
        }:${
          timer.seconds.toString().length < 2
            ? '0' + timer.seconds
            : timer.seconds
        }`}</span>
      </div>

      {finished ? (
        <div style={{ marginLeft: '50px' }}>
          <h1>Результаты:</h1>
          <h3>M – число колец, которые следовало вычеркнуть.</h3>
          {renderArray(M, 'M')}
          <h3>
            N – число пропущенных и неправильно вычеркнутых колец.
            <br />
            Nt – число пропущенных и неправильно зачеркнутых колец за 5 минут.
          </h3>
          {renderArray(N, 'N', Nt)}
          <h3>
            A – показатель точности работы.
            <br />
            At- средняя точность за 5 минут.
          </h3>
          {renderArray(A, 'A', At)}
          <h3>
            Q – общее количество колец, просмотренных за минуту.
            <br />
            Qt – количество просмотренных колец за 5 минут.
          </h3>
          {renderArray(Q, 'Q', Qt)}
          <h3>
            P – показатель продуктивности работы.
            <br />
            Pt - средняя продуктивность за 5 мин.
          </h3>
          {renderArray(P, 'P', Pt)}
          <h3>Показатель скорости переработки информации S = {S}</h3>
          <h3>Коэффициент выносливости Kp = {Kp}</h3>
          <h3>Коэффициент точности Ta = {Ta}</h3>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default App;

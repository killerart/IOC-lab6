function Cell({
  cell,
  cellClicked,
  cellDoubleClicked,
  index,
  finished,
  T,
  width,
  height,
}) {
  const tIndex = T?.indexOf(index);
  return (
    <div
      className={`grid-item ${cell.clicked ? 'clicked' : 'missed'}${
        !finished ? '' : cell.rotation === 2 ? ' correct' : ' incorrect'
      }`}
      onClick={() => cellClicked?.(index)}
      onDoubleClick={() => cellDoubleClicked?.(index)}
    >
      {tIndex >= 0 ? <span className="cell-number">{tIndex + 1}</span> : <></>}
      <svg
        width={width ?? 22}
        height={height ?? 22}
        viewBox="0 0 22 22"
        fill="none"
        style={{ transform: `rotate(${45 * cell.rotation}deg)` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="svg-fill" cx="11" cy="11" r="9" />
        <path
          d="M14.6275 2.21982C16.6588 3.05905 18.3363 4.57666 19.3741 6.51406C20.412 8.45147 20.7459 10.6888 20.3191 12.8448C19.8923 15.0009 18.7311 16.9422 17.0334 18.3381C15.3357 19.7339 13.2065 20.498 11.0087 20.5C8.8108 20.502 6.68023 19.7419 4.97997 18.3491C3.27971 16.9564 2.11498 15.0171 1.68421 12.8619C1.25345 10.7066 1.58332 8.46872 2.61761 6.52942C3.65189 4.59011 5.32661 3.06943 7.35641 2.22648"
          stroke="black"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

export default Cell;

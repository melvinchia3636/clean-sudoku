import { createContext, useContext, useEffect, useRef, useState } from "react";
import "animate.css";

const themes = {
  green: {
    background: "bg-zinc-900",
    backgroundText: "text-zinc-900",
    answer: "text-green-500",
    board: "text-green-700",
    border: "border-green-800",
    borderHorizontalThick: "after:border-green-500",
    borderHorizontalThin: "after:border-green-800",
    separatorVertical: "before:border-green-500",
    selected: "after:bg-green-500",
    selectedText: "!text-zinc-900",
    selectedMatch: "after:border-green-500/30",
    coverAfter: "after:bg-zinc-900",
    coverBefore: "before:bg-zinc-900",
  },
  cyan: {
    background: "bg-zinc-900",
    backgroundText: "text-zinc-900",
    answer: "text-cyan-100",
    board: "text-cyan-500",
    border: "border-cyan-800",
    borderHorizontalThick: "after:border-cyan-500",
    borderHorizontalThin: "after:border-cyan-800",
    separatorVertical: "before:border-cyan-500",
    selected: "after:bg-cyan-500",
    selectedText: "!text-zinc-900",
    selectedMatch: "after:bg-cyan-500/30",
    coverAfter: "after:bg-zinc-900",
    coverBefore: "before:bg-zinc-900",
  },
  light: {
    background: "bg-zinc-100",
    backgroundText: "text-zinc-100",
    answer: "text-blue-500",
    board: "text-zinc-700",
    border: "border-zinc-300",
    borderHorizontalThick: "after:border-zinc-500",
    borderHorizontalThin: "after:border-zinc-300",
    separatorVertical: "before:border-zinc-500",
    selected: "after:bg-zinc-500",
    selectedText: "!text-zinc-100",
    selectedMatch: "after:bg-zinc-500/30",
    coverAfter: "after:bg-zinc-100/0",
    coverBefore: "before:bg-zinc-100/0",
  },
};

const BoardContext = createContext({
  board: [],
  selected: [-1, -1],
  answer: [],
  candidates: [],
  setSelected: () => {},
  theme: "green",
});

const CandidateCell = ({ xi, yi }) => {
  const { selected, answer, theme } = useContext(BoardContext);
  console.log(theme);

  return (
    <div className="candidate-container">
      {"123456789".split("").map((e) => (
        <div
          className={`
          candidate-cell
          ${
            JSON.stringify(selected) === JSON.stringify([yi, xi])
              ? themes[theme]["backgroundText"]
              : themes[theme]["answer"]
          }
          ${
            typeof answer[yi][xi] === "string" &&
            !answer[yi][xi].includes(e) &&
            "!text-transparent"
          }
        `}
        >
          {e}
        </div>
      ))}
    </div>
  );
};

const CellInner = ({ xi, yi }) => {
  const { answer, candidates, theme } = useContext(BoardContext);

  return (
    <div
      className={`
      cell-inner
      ${themes[theme]["coverBefore"]}
      ${[3, 6].includes(xi) && xi !== 0 && "before:left-0 before:block"}
      ${!((xi + 1) % 3) && xi !== 8 && "before:right-0 before:block"}
    `}
    >
      {candidates[yi][xi] ? (
        <CandidateCell xi={xi} yi={yi} />
      ) : (
        answer[yi][xi] !== 0 && answer[yi][xi]
      )}
    </div>
  );
};

const CellContainer = ({ xi, yi }) => {
  const { selected, answer, theme } = useContext(BoardContext);

  return (
    <div
      className={`
      cell-container
      ${themes[theme]["border"]}
      ${
        selected[0] === yi && selected[1] === xi
          ? `after:w-10 after:h-10 ${themes[theme]["selectedText"]} ${themes[theme]["selected"]}`
          : selected[0] !== -1 &&
            answer[selected[0]][selected[1]] !== 0 &&
            answer[selected[0]][selected[1]] === answer[yi][xi]
          ? `after:h-10 after:w-10 ${themes[theme]["selectedMatch"]}`
          : "after:w-0 after:h-0"
      }
      ${
        xi !== 8 &&
        (!((xi + 1) % 3)
          ? "separator-vertical " + themes[theme]["separatorVertical"]
          : "border-r")
      }
    `}
    >
      <CellInner xi={xi} yi={yi} />
    </div>
  );
};

const Cell = ({ xi, yi }) => {
  const { board, setSelected, theme } = useContext(BoardContext);

  return (
    <div
      className={`
        relative
        ${board[yi][xi] ? themes[theme]["board"] : themes[theme]["answer"]}
          ${
            yi % 3 < 2 &&
            xi % 3 < 2 &&
            "grid-cover-middle " + themes[theme]["coverAfter"]
          }
          ${
            !(yi % 3) &&
            (xi + 1) % 3 &&
            "grid-cover-top " + themes[theme]["coverBefore"]
          }
          ${
            yi % 3 &&
            (xi + 1) % 3 &&
            "grid-cover-bottom " + themes[theme]["coverBefore"]
          }
      `}
      onClick={() => setSelected([yi, xi])}
    >
      <CellContainer xi={xi} yi={yi} />
    </div>
  );
};

const Row = ({ y, yi }) => {
  const { theme } = useContext(BoardContext);

  return (
    <div
      className={`
      row
      ${
        yi !== 8 &&
        (!((yi + 1) % 3)
          ? "border-horizontal thick " + themes[theme]["borderHorizontalThick"]
          : "border-horizontal thin " + themes[theme]["borderHorizontalThin"])
      }`}
    >
      {y.map((_, xi) => (
        <Cell xi={xi} yi={yi} />
      ))}
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState("light");
  const [board, _setBoard] = useState();
  const [answer, _setAnswer] = useState();
  const [solution, setSolution] = useState();
  const [solved, setSolved] = useState(false);
  const [selected, _setSelected] = useState([-1, -1]);
  const [candidates, _setCandidates] = useState(
    Array(9)
      .fill(0)
      .map(() =>
        Array(9)
          .fill(0)
          .map(() => false)
      )
  );

  const boardRef = useRef(board);
  const setBoard = (data) => {
    boardRef.current = data;
    _setBoard(data);
  };

  const answerRef = useRef(answer);
  const setAnswer = (data) => {
    answerRef.current = data;
    _setAnswer(data);
  };

  const selectedRef = useRef(selected);
  const setSelected = (data) => {
    selectedRef.current = data;
    _setSelected(data);
  };

  const candidatesRef = useRef(candidates);
  const setCandidates = (data) => {
    candidatesRef.current = data;
    _setCandidates(data);
  };

  const fetchBoard = () => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "https://cors-anywhere.thecodeblog.net/sudoku.com/api/level/hard",
      true
    );
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const { mission, solution } = JSON.parse(xhr.responseText);
          const newBoard = mission
            .match(/.{1,9}/g)
            .map((e) => e.split("").map((e) => parseInt(e)));
          setBoard(newBoard);
          setSolution(solution);
          setAnswer(JSON.parse(JSON.stringify(newBoard)));
          setSolved(false);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  useEffect(() => {
    if (answer && solution) {
      if (candidates.every((e) => e.every((e) => !e))) {
        if (answer.map((e) => e.join("")).join("") === solution) {
          setSolved(true);
          fetchBoard();
        }
      }
    }
  }, [answer]);

  const updateBoardUponNumberInsert = (number) => {
    const answer = JSON.parse(JSON.stringify(answerRef.current));
    const candidates = JSON.parse(JSON.stringify(candidatesRef.current));

    for (let i = 0; i < 9; i++) {
      // check row candidates
      if (
        candidatesRef.current[selectedRef.current[0]][i] &&
        i !== selectedRef.current[1]
      ) {
        answer[selectedRef.current[0]][i] = answer[selectedRef.current[0]][i]
          .toString()
          .replace(number, "");
      }

      // check column candidates
      if (
        candidatesRef.current[i][selectedRef.current[1]] &&
        i !== selectedRef.current[0]
      ) {
        answer[i][selectedRef.current[1]] = answer[i][selectedRef.current[1]]
          .toString()
          .replace(number, "");
      }

      // check box candidates
      const boxX = Math.floor(selectedRef.current[1] / 3) * 3;
      const boxY = Math.floor(selectedRef.current[0] / 3) * 3;
      for (let y = boxY; y < boxY + 3; y++) {
        for (let x = boxX; x < boxX + 3; x++) {
          if (
            candidatesRef.current[y][x] &&
            JSON.stringify([y, x]) !== JSON.stringify(selectedRef.current)
          ) {
            answer[y][x] = answer[y][x].toString().replace(number, "");
          }
        }
      }
    }

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (!answer[y][x]) {
          answer[y][x] = 0;
          candidates[y][x] = false;
        }
      }
    }

    setAnswer(answer);
    setCandidates(candidates);
  };

  const setCandidatesState = (state) => {
    const newCandidates = JSON.parse(JSON.stringify(candidatesRef.current));
    newCandidates[selectedRef.current[0]][selectedRef.current[1]] = state;
    setCandidates(newCandidates);
  };

  const insertNumber = (number) => {
    setCandidatesState(false);
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        newAnswer[selectedRef.current[0]][selectedRef.current[1]] = number;
        setAnswer(newAnswer);
        updateBoardUponNumberInsert(number.toString());
      }
    }
  };

  const insertCandidate = (number) => {
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        const num = newAnswer[selectedRef.current[0]][selectedRef.current[1]]
          .toString()
          .replace("0", "");
        if (
          candidatesRef.current[selectedRef.current[0]][selectedRef.current[1]]
        ) {
          if (!num.includes(number)) {
            newAnswer[selectedRef.current[0]][selectedRef.current[1]] =
              num + number;
          } else {
            newAnswer[selectedRef.current[0]][selectedRef.current[1]] =
              num.replace(number, "");
            if (!newAnswer[selectedRef.current[0]][selectedRef.current[1]]) {
              newAnswer[selectedRef.current[0]][selectedRef.current[1]] = 0;
              setCandidatesState(false);
              setAnswer(newAnswer);
              return;
            }
          }
        } else {
          newAnswer[selectedRef.current[0]][selectedRef.current[1]] =
            num + (num.includes(number) ? "" : number);
        }
        setAnswer(newAnswer);
        setCandidatesState(true);
      }
    }
  };

  const removeNumber = () => {
    setCandidatesState(false);
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        newAnswer[selectedRef.current[0]][selectedRef.current[1]] = 0;
        setAnswer(newAnswer);
      }
    }
  };

  useEffect(() => {
    const listener = document.addEventListener("keydown", (e) => {
      if ("123456789".split("").includes(e.key)) {
        if (
          (navigator.oscpu.includes("Mac") && e.metaKey) ||
          (!navigator.oscpu.includes("Mac") && e.ctrlKey)
        ) {
          insertCandidate(e.key);
        } else {
          insertNumber(parseInt(e.key));
        }
        e.preventDefault();
      }
      if (e.key === "Backspace") {
        removeNumber();
      }
    });
    return () => document.removeEventListener("keydown", listener);
  }, []);

  return (
    <BoardContext.Provider
      value={{
        board: board,
        selected: selected,
        answer: answer,
        candidates: candidates,
        setSelected: setSelected,
        theme,
      }}
    >
      <div
        className={`w-full h-screen overflow-hidden ${themes[theme]["background"]} ${themes[theme]["answer"]} flex items-center justify-center select-none text-2xl`}
      >
        {board && answer && (
          <>
            <div
              className={`animate__animated ${
                solved ? "animate__backOutLeft" : "animate__backInRight"
              }`}
            >
              {board.map((y, yi) => (
                <Row y={y} yi={yi} />
              ))}
            </div>
          </>
        )}
      </div>
    </BoardContext.Provider>
  );
}

export default App;

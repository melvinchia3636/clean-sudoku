import { createContext, useContext, useEffect, useRef, useState } from "react"
import "animate.css";

const BoardContext = createContext({
  board: [],
  selected: [-1, -1],
  answer: [],
  candidates: [],
  setSelected: () => {},
})

const CandidateCell = ({ xi, yi }) => {
  const {
    selected,
    answer
  } = useContext(BoardContext);

  return (
    <div className="candidate-container">
      {"123456789".split("").map(e => (
        <div className={`
          candidate-cell
          ${
            JSON.stringify(selected) === JSON.stringify([yi, xi]) 
              ? "text-zinc-900"
              : "text-green-500"
          }
          ${
            typeof answer[yi][xi] === "string" 
            && !answer[yi][xi].includes(e)
            && "!text-transparent"
          }
        `}>
          {e}
        </div>
      ))}
    </div>
  )
}

const CellInner = ({ xi, yi }) => {
  const {
    answer,
    candidates
  } = useContext(BoardContext);

  return (
    <div className={`
      cell-inner
      ${
        (xi+1)%3 
        && xi !== 0
        && "before:left-0 before:block"
      }
      ${
        !((xi+1)%3)
        && xi !== 8
        && "before:right-0 before:block"
      }
    `}>
      {
        candidates[yi][xi]
          ? <CandidateCell xi={xi} yi={yi} />
          : answer[yi][xi] !== 0 && answer[yi][xi]
      }
    </div>
  )
}

const CellContainer = ({ xi, yi }) => {
  const {
    selected,
    answer
  } = useContext(BoardContext);

  return (
    <div className={`
      cell-container 
      ${
        selected[0] === yi 
        && selected[1] === xi 
          ? "after:w-10 after:h-10 !text-zinc-900 after:bg-green-500" 
          : selected[0] !== -1 
            && answer[selected[0]][selected[1]] !== 0
            && answer[selected[0]][selected[1]] === answer[yi][xi]  
              ? "after:h-10 after:w-10 after:bg-green-500/30" 
              : "after:w-0 after:h-0"
      }
      ${
        xi !== 8 
        && (
          !((xi+1)%3) 
            ? "separator-vertical"
            : "border-r"
        )
      }
    `}>
      <CellInner xi={xi} yi={yi} />
    </div>
  )
}

const Cell = ({ xi, yi }) => {
  const {
    board,
    setSelected
  } = useContext(BoardContext);

  return (
    <div
      className={`
        relative
        ${
          board[yi][xi]
            ? "text-green-700"
            : "text-green-500"
          }
          ${
            yi%3 < 2
            && xi%3 < 2
            && "grid-cover-middle"
          }
          ${
            !((yi)%3)
            && (xi + 1)%3
            && "grid-cover-right"
          }
          ${
            (yi)%3
            && ((xi + 1)%3)
            && ""
        }
      `}
      onClick={
        () => setSelected([yi, xi])
      }
    >
      <CellContainer xi={xi} yi={yi} />
    </div>
  )
}

const Row = ({ y, yi }) => {

  return (
    <div className={`
      row
      ${
        yi !== 8
        && (
          !((yi+1)%3)
            ? "border-horizontal thick"
            : "border-horizontal thin"
        )
      }`
    }>
      {
        y.map((_, xi) => (
          <Cell xi={xi} yi={yi} />
        ))
      }
    </div>
  )
}

function App() {
  const [board, _setBoard] = useState();
  const [answer, _setAnswer] = useState();
  const [selected, _setSelected] = useState([-1, -1])
  const [candidates, _setCandidates] = useState(Array(9).fill(0).map(() => Array(9).fill(0).map(() => false)))

  const boardRef = useRef(board);
  const setBoard = data => {
    boardRef.current = data;
    _setBoard(data);
  };

  const answerRef = useRef(answer);
  const setAnswer = data => {
    answerRef.current = data;
    _setAnswer(data);
  };

  const selectedRef = useRef(selected);
  const setSelected = data => {
    selectedRef.current = data;
    _setSelected(data);
  };

  const candidatesRef = useRef(candidates);
  const setCandidates = data => {
    candidatesRef.current = data;
    _setCandidates(data);
  };

  useEffect(() => {
    document.cookie = "mode=classic;"
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://cors-anywhere.thecodeblog.net/sudoku.com/api/level/hard", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const { mission } = JSON.parse((xhr.responseText));
          const newBoard = mission.match(/.{1,9}/g).map(e => e.split("").map(e => parseInt(e)))
          setBoard(newBoard);
          setAnswer(JSON.parse(JSON.stringify(newBoard)))
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  }, [])

  const setCandidatesState = (state) => {
    const newCandidates = JSON.parse(JSON.stringify(candidatesRef.current));
    newCandidates[selectedRef.current[0]][selectedRef.current[1]] = state;
    setCandidates(newCandidates)
  }

  const insertNumber = (number) => {
    setCandidatesState(false);
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        newAnswer[selectedRef.current[0]][selectedRef.current[1]] = number;
        setAnswer(newAnswer);
      }
    }
  }

  const insertCandidate = (number) => {
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        const num = newAnswer[selectedRef.current[0]][selectedRef.current[1]].toString().replace("0", "")
        if (candidatesRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
          if (!num.includes(number)) {
            newAnswer[selectedRef.current[0]][selectedRef.current[1]] = num + number;
          } else {
            newAnswer[selectedRef.current[0]][selectedRef.current[1]] = num.replace(number, "");
            if (!newAnswer[selectedRef.current[0]][selectedRef.current[1]]) {
              newAnswer[selectedRef.current[0]][selectedRef.current[1]] = 0;
              setCandidatesState(false);
              setAnswer(newAnswer);
              return;
            }
          }
        } else {
          newAnswer[selectedRef.current[0]][selectedRef.current[1]] = num+(num.includes(number) ? "" : number);
        }
        setAnswer(newAnswer);
      }
    }
    setCandidatesState(true);
  }

  const removeNumber = () => {
    setCandidatesState(false);
    if (selectedRef.current[0] !== -1 && selectedRef.current[1] !== -1) {
      if (!boardRef.current[selectedRef.current[0]][selectedRef.current[1]]) {
        let newAnswer = JSON.parse(JSON.stringify(answerRef.current));
        newAnswer[selectedRef.current[0]][selectedRef.current[1]] = 0;
        setAnswer(newAnswer);
      }
    }
  }
  
  useEffect(() => {
    const listener = document.addEventListener("keydown", (e) => {
      if ("123456789".split("").includes(e.key)) {
        if ((navigator.oscpu.includes("Mac") && e.metaKey) || (!navigator.oscpu.includes("Mac") && e.ctrlKey)) {
          insertCandidate(e.key)
        } else {
          insertNumber(parseInt(e.key))
        }
        e.preventDefault();
      }
      if (e.key === "Backspace") {
        removeNumber()
      }
    })
    return () => document.removeEventListener('keydown', listener)
  }, []);

  return (
    <BoardContext.Provider value={{
      board: board,
      selected: selected,
      answer: answer,
      candidates: candidates,
      setSelected: setSelected,
    }}>
      <div className="w-full h-screen overflow-hidden bg-zinc-900 text-green-500 flex items-center justify-center select-none text-2xl">
        {board && answer && <>
          <div className="animate__animated animate__backInRight">
            {board.map((y, yi) => <Row y={y} yi={yi} />)}
          </div>
          </>}
      </div>
    </BoardContext.Provider>
  )
}

export default App

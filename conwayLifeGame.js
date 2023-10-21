const CellState = {
  alive: "alive",
  dead: "dead",
};

Object.freeze(CellState);

class Cell {
  constructor(state = CellState.dead) {
      this.state = state;
  }

  setState(state) {
      this.state = state;
  }
}

class ConwayGame {
  constructor(rows = 100, columns = 100) {
      this.rowsContainer = this._generateCells(rows, columns);
      this.updateInterval = null;
      this.isPaused = false;
  }

  load() {
      this._prepareInitialGrid();
  }

  start() {
      this._startInterval();
  }

  stop() {
      this._pauseInterval();
      this._clearGrid();
  }

  pause() {
      this._pauseInterval();
  }

  _clearGrid() {
      for (let rowIndex = 0; rowIndex < this.rowsContainer.length; rowIndex++) {
          for (let cellIndex = 0; cellIndex < this.rowsContainer[rowIndex].length; cellIndex++) {
              const cell = this.rowsContainer[rowIndex][cellIndex];
              cell.setState(CellState.dead);
              const element = document.getElementById(`Row${rowIndex}-Cell${cellIndex}`);
              element.style.backgroundColor = "white";
          }
      }
  }

  _startInterval() {
      if (!this.updateInterval) {
          this.updateInterval = setInterval(() => {
              if (!this.isPaused) {
                  this._updateCellStates();
                  this._updateGrid();
              }
          }, 100);
      } else {
          console.log("Interval is already running.");
      }
  }

  _pauseInterval() {
      if (this.updateInterval) {
          clearInterval(this.updateInterval);
          this.updateInterval = null;
      } else {
          console.log("Interval is not running.");
      }
  }

  _toggleCellState(rowIndex, cellIndex) {
      const cell = this.rowsContainer[rowIndex][cellIndex];
      const element = document.getElementById(`Row${rowIndex}-Cell${cellIndex}`);
      const state = cell.state;
      cell.setState(state === CellState.alive ? CellState.dead : CellState.alive);
      element.style.backgroundColor = state === CellState.alive ? "white" : "red";
  }

  _prepareInitialGrid() {
    const grid = document.querySelector(".grid-container");
  
    for (let rowIndex = 0; rowIndex < this.rowsContainer.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < this.rowsContainer[rowIndex].length; cellIndex++) {
        const cell = this.rowsContainer[rowIndex][cellIndex];
        const element = document.createElement("div");
        element.className = "grid-item";
        element.id = `Row${rowIndex}-Cell${cellIndex}`;
  
        element.addEventListener("click", () => {
          this._toggleCellState(rowIndex, cellIndex);
        });
  
        element.addEventListener("mouseover", (event) => {
          if (event.buttons === 1) {
            this._toggleCellState(rowIndex, cellIndex);
          }
        });
  
        grid.appendChild(element);
      }
    }
  }
  

  _generateCells(rows, columns) {
      const cellsRows = [];
      for (let row = 0; row < rows; row++) {
          const cellsOnRow = [];
          for (let column = 0; column < columns; column++) {
              const cell = new Cell();
              cellsOnRow.push(cell);
          }
          cellsRows.push(cellsOnRow);
      }
      return cellsRows;
  }

  _updateGrid() {
      const grid = document.querySelector(".grid-container");

      const fragment = document.createDocumentFragment();

      for (let rowIndex = 0; rowIndex < this.rowsContainer.length; rowIndex++) {
          for (let cellIndex = 0; cellIndex < this.rowsContainer[rowIndex].length; cellIndex++) {
              const cell = this.rowsContainer[rowIndex][cellIndex];
              const element = document.getElementById(`Row${rowIndex}-Cell${cellIndex}`);
              element.className = "grid-item";
              element.style.backgroundColor = cell.state === CellState.alive ? "red" : "white";
              fragment.appendChild(element);
          }
      }

      while (grid.firstChild) {
          grid.removeChild(grid.firstChild);
      }

      grid.appendChild(fragment);
  }

  _updateCellStates() {
      const newRowsContainer = [];

      for (let rowIndex = 0; rowIndex < this.rowsContainer.length; rowIndex++) {
          const tempRow = [];

          for (let cellIndex = 0; cellIndex < this.rowsContainer[rowIndex].length; cellIndex++) {
              const aliveCellCounter = this._countAliveNeighbors(rowIndex, cellIndex);
              const cell = this.rowsContainer[rowIndex][cellIndex];
              const newCell = new Cell(cell.state);

              if ((aliveCellCounter === 2 || aliveCellCounter === 3) && cell.state === CellState.alive) {
                  newCell.setState(CellState.alive);
              } else if (aliveCellCounter === 3 && cell.state === CellState.dead) {
                  newCell.setState(CellState.alive);
              } else {
                  newCell.setState(CellState.dead);
              }

              tempRow.push(newCell);
          }

          newRowsContainer.push(tempRow);
      }

      this.rowsContainer = newRowsContainer;
  }

  _countAliveNeighbors(rowIndex, cellIndex) {
      const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1],
      ];

      let aliveCellCounter = 0;

      for (const [rowOffset, colOffset] of neighbors) {
          const neighborRow = rowIndex + rowOffset;
          const neighborCol = cellIndex + colOffset;

          if (
              neighborRow >= 0 &&
              neighborRow < this.rowsContainer.length &&
              neighborCol >= 0 &&
              neighborCol < this.rowsContainer[neighborRow].length
          ) {
              const neighbor = this.rowsContainer[neighborRow][neighborCol];

              if (neighbor.state === CellState.alive) {
                  aliveCellCounter++;
              }
          }
      }

      return aliveCellCounter;
  }

  [Symbol.iterator]() {
      let currentIndex = 0;
      const cells = this.rowsContainer;

      return {
          next: function () {
              if (currentIndex < cells.length) {
                  return { value: cells[currentIndex++], done: false };
              } else {
                  return { value: undefined, done: true };
              }
          },
      };
  }
}
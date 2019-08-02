function runKeyboardEvent(keyValue) {
  const typeArg = 'keydown';
  const KeyboardEventInit = {
    bubbles: true, // read bubble and capture events
    key: keyValue,
    code: keyValue,
  };
  const keyboardEvent = new KeyboardEvent(typeArg, KeyboardEventInit);
  document.dispatchEvent(keyboardEvent);
}

function Queue() {
  // initialise the queue and offset
  let queue = [];
  let offset = 0;

  // Returns the length of the queue.
  this.getLength = function() {
    return queue.length - offset;
  };

  // Returns true if the queue is empty, and false otherwise.
  this.isEmpty = function() {
    return queue.length == 0;
  };

  // Enqueues the specified item
  this.enqueue = function(item) {
    queue.push(item);
  };

  /* Dequeues an item and returns it. If the queue is empty,
   * the value 'undefined' is returned
   */
  this.dequeue = function() {
    // if the queue is empty, return immediately
    if (queue.length == 0) return undefined;

    // store the item at the front of the queue
    const item = queue[offset];

    // increment the offset and remove the free space if necessary
    if (++offset * 2 >= queue.length) {
      queue = queue.slice(offset);
      offset = 0;
    }

    // return the dequeued item
    return item;
  };

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = function() {
    return queue.length > 0 ? queue[offset] : undefined;
  };
}

function MazeSolver() {
  let maze, rows, cols;

  return {
    setMaze: setMaze,
    findPath: findPath,
  };

  // setup maze
  function setMaze(m) {
    maze = m;
    rows = maze.length;
    cols = maze[0].length;
  }

  // uses BFS algorithm which guaranty smallest path if reachable
  function findPath(from, to) {
    const queue = new Queue();
    // marks whether in already tried or not
    const visited = new Array(rows)
      .fill(null)
      .map(() => new Array(cols).fill(false));

    // add starting position to queue
    queue.enqueue([...from]);
    visited[from[0]][from[1]] = true;

    while (!queue.isEmpty()) {
      const [row, col] = queue.dequeue();
      // get all possible neighbours
      const neighbours = getNeighbours(row, col);

      for (let i = 0; i < neighbours.length; i += 1) {
        const [nrow, ncol, direction] = neighbours[i];
        if (visited[nrow][ncol]) {
          continue;
        }
        // add neighbour to queue
        queue.enqueue([nrow, ncol]);
        visited[nrow][ncol] = direction;

        // a valid path is found
        if (maze[nrow][ncol] === 'B') {
          return backtrackPath(from, to, visited);
        }
      }
    }
    throw new Error('No Path Found');
  }

  function getNeighbours(row, col) {
    const result = [];
    const neighbours = [
      [row - 1, col, 'N'],
      [row + 1, col, 'S'],
      [row, col - 1, 'W'],
      [row, col + 1, 'E'],
    ];

    neighbours.forEach(([nrow, ncol, direction]) => {
      if (
        nrow >= 0 &&
        nrow < rows &&
        ncol >= 0 &&
        ncol < cols &&
        maze[nrow][ncol] !== 'X'
      ) {
        result.push([nrow, ncol, direction]);
      }
    });
    return result;
  }

  function backtrackPath(from, to, path) {
    const result = [];

    let [row, col] = to;
    while (row !== from[0] || col !== from[1]) {
      result.push(path[row][col]);
      if (path[row][col] === 'N') {
        row += 1;
      } else if (path[row][col] === 'S') {
        row -= 1;
      } else if (path[row][col] === 'W') {
        col += 1;
      } else if (path[row][col] === 'E') {
        col -= 1;
      } else {
        throw Error('Invalid Path');
      }
    }

    return result.reverse();
  }
}

function runSolver(maze) {
  const mazeSolver = MazeSolver();
  const from = [maze.startingPosition[1], maze.startingPosition[0]];
  const to = [maze.endingPosition[1], maze.endingPosition[0]];

  mazeSolver.setMaze(maze.map);
  const directions = mazeSolver.findPath(from, to);

  const guide = { W: 'left', N: 'up', E: 'right', S: 'down' };
  const keyCodes = {
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    down: 'ArrowDown',
  };
  directions.forEach((d) => runKeyboardEvent(keyCodes[guide[d]]));
}

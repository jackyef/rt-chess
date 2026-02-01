export type StockfishEvaluation = {
  type: 'cp' | 'mate'
  value: number
}

type StockfishEvaluationSubscriber = (evaluation: StockfishEvaluation) => void

export const createStockfishClient = () => {
  const worker = new Worker('/engine/stockfish-17.1-lite-51f59da.js');
  const subscribers = new Set<StockfishEvaluationSubscriber>()
  let analysisId = 0

  function send(command: string) {
    worker.postMessage(command)
  }

  function normalizeEvalScore(score: number, fen: string) {
    // Stockfish always returns cp from perspective of who is to move.
    // e.g.: +3 actually means black is winning if it's black turn to move.
    const sideToMove = fen.split(' ')[1] // "w" | "b"
    return sideToMove === 'w' ? score : -score
  }

  function evaluateFen(fen: string, depth = 14) {
    analysisId += 1
    const currentAnalysisId = analysisId

    send(`stop`);
    send(`ucinewgame`);
    send(`position fen ${fen}`)
    send(`go depth ${depth}`)

    worker.onmessage = (e) => {
      if (analysisId !== currentAnalysisId) {
        // This message is from a previous analysis; ignore it
        return
      }

      const line = String(e.data)

      handleStockfishOutputLine(line, fen)
    }
  }

  function subscribe(subscriber: StockfishEvaluationSubscriber) {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  function handleStockfishOutputLine(line: string, fen: string) {
    // Example:
    // info depth 12 score cp 34
    // info depth 18 score mate -3
    if (!line.includes('score')) {
      return
    }

    const match =
      line.match(/score cp (-?\d+)/) ||
      line.match(/score mate (-?\d+)/)

    if (!match) return

    const isMate = line.includes('score mate')
    const value = Number(match[1])


    if (isMate && value === 0) {
      // Game over, no need to send further updates
      return
    }

    const evalScore: StockfishEvaluation = {
      type: isMate ? 'mate' : 'cp',
      value: normalizeEvalScore(value, fen)
    }

    subscribers.forEach((s) => s(evalScore))
  }

  send('uci')
  send('setoption name Threads value 1')
  send('setoption name Hash value 16')
  send('isready')

  return {
    evaluateFen,
    subscribe,
    close: () => {
      worker.terminate()
    }
  }
}

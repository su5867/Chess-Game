import { Move } from '../types/chess';

interface MoveHistoryProps {
  moves: Move[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  // Group moves into pairs (white and black)
  const movePairs: [Move?, Move?][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Move History</h3>
      
      <div className="move-history max-h-[300px] overflow-y-auto space-y-1">
        {moves.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">
            No moves yet
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {movePairs.map((pair, index) => (
                <tr key={index} className="hover:bg-zinc-800/50">
                  <td className="py-1 pr-3 text-zinc-500 font-mono text-xs w-8">
                    {index + 1}.
                  </td>
                  <td className="py-1 pr-2 font-mono text-zinc-300">
                    {pair[0]?.notation || ''}
                  </td>
                  <td className="py-1 font-mono text-zinc-300">
                    {pair[1]?.notation || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {moves.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
          {moves.length} move{moves.length !== 1 ? 's' : ''} played
        </div>
      )}
    </div>
  );
}

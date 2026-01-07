interface CodeStatsProps {
  code: string;
}

export function CodeStats({ code }: CodeStatsProps) {
  const lines = code.split('\n').length;
  const characters = code.length;
  const words = code.split(/\s+/).filter((w) => w.length > 0).length;
  const comments = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;

  const stats = [
    { label: 'Lignes', value: lines.toLocaleString() },
    { label: 'Caractères', value: characters.toLocaleString() },
    { label: 'Mots', value: words.toLocaleString() },
    { label: 'Commentaires', value: comments.toLocaleString() },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <span className="text-gray-500">{stat.label}:</span>
          <span className="font-semibold text-gray-900">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}


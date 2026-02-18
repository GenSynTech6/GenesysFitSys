import React, { createContext, useContext, useState } from "react";

const ranks = [
  { min: 1, max: 5, name: "Aprendiz" },
  { min: 6, max: 10, name: "Rank E" },
  { min: 11, max: 20, name: "Rank D" },
  { min: 21, max: 35, name: "Rank C" },
  { min: 41, max: 45, name: "Rank B" },
  { min: 46, max: 55, name: "Rank A" },
  { min: 56, max: 70, name: "Rank S" },
  { min: 71, max: 85, name: "Rank S Internacional" },
  { min: 86, max: 100, name: "Monarca" },
];

const XpContext = createContext<any>(null);

export function XpProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [nivel, setNivel] = useState(1);

  const xpNecessario = 100 * nivel * nivel;
  const rankAtual = ranks.find(r => nivel >= r.min && nivel <= r.max)?.name || "???";

  const ganharXp = (valor: number) => {
    let novoXp = xp + valor;
    if (novoXp >= xpNecessario) {
      setNivel(nivel + 1);
      novoXp = novoXp - xpNecessario;
      alert(`🎉 Level Up! Você agora é nível ${nivel + 1} (${rankAtual})`);
    }
    setXp(novoXp);
  };

  return (
    <XpContext.Provider value={{ xp, nivel, xpNecessario, rankAtual, ganharXp }}>
      {children}
    </XpContext.Provider>
  );
}

export function useXpSystem() {
  return useContext(XpContext);
}

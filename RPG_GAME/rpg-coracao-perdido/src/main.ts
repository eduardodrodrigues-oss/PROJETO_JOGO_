import { Game } from "./Game";

// Inicializa o jogo assim que a página carregar
window.addEventListener("DOMContentLoaded", () => {
  const game = new Game("game-container");
  game.start();
});
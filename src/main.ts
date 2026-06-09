
import Phaser from "phaser";
import { PenaltyScene } from "./scenes/PenaltyScene";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: "#3aa655",
  scene: [PenaltyScene]
});

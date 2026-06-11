
import Phaser from "phaser";
import { PenaltyScene } from "./scenes/PenaltyScene";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  backgroundColor: "#000000",
  scale:{
        mode:Phaser.Scale.FIT,
        autoCenter:Phaser.Scale.CENTER_BOTH
    },
  scene: [PenaltyScene]
});
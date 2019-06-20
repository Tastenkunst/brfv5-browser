import { setupCameraExample, simpleTrack, simpleDraw } from "../utils/utils__init.mjs";

setupCameraExample(
  "68l_max",
  document.body,
  null,
  (brfv5Manager, brfv5Config, input, canvas) => {

  simpleTrack(brfv5Manager, brfv5Config, input, canvas);
  simpleDraw(brfv5Manager, brfv5Config, canvas);
});
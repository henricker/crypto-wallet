import { mainLoop } from "./producer-cli.js";
import { server } from "./producer-server.js";

server.listen(3000, () => {
    mainLoop()
});
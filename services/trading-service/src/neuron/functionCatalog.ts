import { registerFunction } from "./registry";

registerFunction({
  id: "echo",
  name: "Echo",
  description: "Echo payload",
  layer: "L0",
  status: "ACTIVE",
  tags: ["test"]
});

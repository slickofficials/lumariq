import neuronRouter from "./router";

export function mountNeuron(app: any) {
  app.use(neuronRouter);
}

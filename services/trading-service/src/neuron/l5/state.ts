export type SystemState = {
  country: string;
  liquidityIndex: number;
  logisticsStress: number;
  fraudPressure: number;
  demandIndex: number;
};

export const DefaultState: SystemState = {
  country: "NG",
  liquidityIndex: 1,
  logisticsStress: 0,
  fraudPressure: 0,
  demandIndex: 1
};

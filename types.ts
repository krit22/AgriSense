export interface Prediction {
  className: string;
  probability: number;
}

export interface Remedy {
  name: string;
  type: string;
  action: string;
}

export interface AgentResponse {
  diagnosis: string;
  advice: string;
  remedies: Remedy[];
  productMatch: string;
}
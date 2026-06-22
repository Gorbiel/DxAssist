export type InputSchema = Record<string, string>;

export type AdditionalDataSchema = Record<string, InputSchema>;

export type AdditionalData = Record<string, Record<string, string>>;

export interface DiagnosticModel {
  id: string;
  name: string;
  type: string;
  input_schema?: InputSchema;
  additional_data_schema?: AdditionalDataSchema;
}

export type DiagnosticResultValue = string | number | boolean | null;

export type DiagnosticResultDetails = Record<string, Record<string, DiagnosticResultValue>>;

export interface AggregatedDiagnosticResult {
  aggregated: Record<string, number>;
  details: DiagnosticResultDetails;
  weights: Record<string, number>;
}

export type SingleDiagnosticResult = Record<string, DiagnosticResultValue>;

export type DiagnosticResult = AggregatedDiagnosticResult | SingleDiagnosticResult;

export interface DiagnosticAnalysisResponse {
  result: DiagnosticResult;
}

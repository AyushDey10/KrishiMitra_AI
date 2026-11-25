export type FeatureMeta = {
  key: string;
  label: string;
  unit: string;
  group: "Soil" | "Climate";
  decimals: number;
  step: number;
  help: string;
  median: number;
  min: number;
  max: number;
  primary: boolean;
};

export type FieldMeta = {
  key: string;
  label: string;
  unit: string;
  group: string;
  decimals: number;
  step: number;
  help: string;
};

export type DatasetFacts = {
  records: number;
  raw_records: number;
  districts: number;
  states: number;
  crop_classes: number;
  seasons: number;
  year_start: number;
  year_end: number;
};

export type Meta = {
  seasons: string[];
  features: FeatureMeta[];
  primary_fields: string[];
  observed_fields: FieldMeta[];
  crops: string[];
  crop_counts: Record<string, number>;
  dataset: DatasetFacts;
  method: {
    model: string;
    features: number;
    classes: number;
    validation: string;
  };
  practices_count: number;
  disclaimers: Record<string, string>;
};

export type RankedCrop = {
  rank: number;
  crop: string;
  score: number;
};

export type ObservedCondition = {
  p25: number;
  median: number;
  p75: number;
};

export type ObservedContext = {
  crop: string;
  n: number;
  share: number;
  conditions: Record<string, ObservedCondition>;
  class_f1: number | null;
};

export type Practice = {
  id: string;
  name: string;
  region: string;
  state: string;
  practice_type: string;
  associated_crops: string[];
  description: string;
  purpose: string[];
  conditions: string;
  limitations: string;
  evidence_status: string;
  source: string;
};

export type InputFlag = {
  field: string;
  issue: "adjusted" | "outside_observed_range";
  detail: string;
};

export type PredictResponse = {
  season: string;
  baseline: RankedCrop[];
  resolved_inputs: Record<string, number>;
  input_flags: InputFlag[];
  observed_context: ObservedContext[];
  practices: Practice[];
  method: {
    model: string;
    features: number;
    classes: number;
    training_records?: number;
    validation: string;
  };
  disclaimers: Record<string, string>;
};

export type ScenarioRow = {
  rank: number;
  baseline_crop: string;
  baseline_score: number;
  scenario_crop: string;
  scenario_score: number;
  score_change: number;
};

export type ScenarioResponse = {
  season: string;
  rainfall_change_pct: number;
  rainfall_original: number;
  rainfall_modified: number;
  baseline: RankedCrop[];
  scenario: RankedCrop[];
  delta: ScenarioRow[];
  input_flags: InputFlag[];
  practices: Practice[];
  method: PredictResponse["method"];
  disclaimers: Record<string, string>;
};

export type ClassMetrics = {
  crop: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
};

export type CropItem = {
  crop: string;
  n: number;
  share: number;
  conditions: Record<string, ObservedCondition>;
  class_f1: number | null;
  metrics: ClassMetrics | null;
  practices: string[];
};

export type CropsResponse = {
  count: number;
  items: CropItem[];
  observed_fields: FieldMeta[];
  disclaimers: Record<string, string>;
};

export type PracticesResponse = {
  count: number;
  items: Practice[];
  filters: {
    crops: string[];
    regions: string[];
    states: string[];
  };
  matching: string;
};

export type MetricsResponse = {
  means: {
    accuracy: number;
    balanced_accuracy: number;
    macro_f1: number;
    top_3_accuracy: number;
  };
  folds: Record<string, number>[];
  feature_importance: { key: string; importance: number }[];
  source: string;
  dataset: DatasetFacts;
};

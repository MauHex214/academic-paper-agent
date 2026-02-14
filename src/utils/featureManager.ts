import fs from 'fs';
import path from 'path';

const FEATURE_LIST_PATH = path.join(process.cwd(), 'feature_list.json');
const PROGRESS_PATH = path.join(process.cwd(), 'claude-progress.txt');

export interface Feature {
  id: number;
  category: string;
  name: string;
  description: string;
  steps: string[];
  passes: boolean;
  priority: string;
}

export interface FeatureList {
  project: string;
  version: string;
  totalFeatures: number;
  completedFeatures: number;
  features: Feature[];
}

export function loadFeatureList(): FeatureList {
  const content = fs.readFileSync(FEATURE_LIST_PATH, 'utf-8');
  return JSON.parse(content);
}

export function saveFeatureList(data: FeatureList): void {
  fs.writeFileSync(FEATURE_LIST_PATH, JSON.stringify(data, null, 2));
}

export function getNextFeature(): Feature | null {
  const data = loadFeatureList();
  const pending = data.features.filter(f => !f.passes && f.priority === 'high');
  return pending.length > 0 ? pending[0] : null;
}

export function completeFeature(featureId: number): void {
  const data = loadFeatureList();
  const feature = data.features.find(f => f.id === featureId);
  if (feature) {
    feature.passes = true;
    data.completedFeatures = data.features.filter(f => f.passes).length;
    saveFeatureList(data);
    console.log(`✅ Feature ${featureId} marked as complete`);
  }
}

export function getProgressSummary(): { total: number; completed: number; inProgress: number } {
  const data = loadFeatureList();
  return {
    total: data.totalFeatures,
    completed: data.completedFeatures,
    inProgress: 0
  };
}

export function appendProgress(message: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n### ${timestamp}\n- ${message}\n`;
  fs.appendFileSync(PROGRESS_PATH, entry);
}

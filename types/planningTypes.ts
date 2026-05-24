export type PlanningResource = {
  title: string;
  url: string;
};

export type FinancialPlanningTip = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  keyPoints: string[];
  actionItems: string[];
  resources: PlanningResource[];
};

export type FinancialPlanningResponse = {
  financialPlanningTips: FinancialPlanningTip[];
};

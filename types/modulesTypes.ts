export interface LearnModule {
    id: string;
    slug: string;
    title: string;
    description: string;
    level: string;
    estimatedTimeMinutes: number;
    topicsCount: number;
    questionsCount: number;
    category: string;
    tags: string[];
    createdAt: string | null;
}

interface LearnModuleSection {
    id: string;
    title: string;
    content: string;
    source: Record<string, any>;
}

interface LearnModuleTopic {
    id: string;
    name: string;
}

export interface LearnModuleQuestion {
    id: string;
    type: string;
    question: string;
    options: string[];
    explanation: string;
    correctAnswer: number;
}

interface LearnModuleQuiz {
    id: string;
    title: string;
    questionsCount: number;
    passingScore: number;
    questions: LearnModuleQuestion[];
}

interface LearnModuleContent {
    introduction: string | null;
    sections: LearnModuleSection[];
    practicalTips: string[];
}

interface LearnModuleDetail extends LearnModule {
    learningObjectives: string[];
    content: LearnModuleContent;
    topics: LearnModuleTopic[];
    quiz: LearnModuleQuiz;
}

interface QuizAttempt {
    attempt: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: string;
}

export interface ModuleProgress {
    userId: string;
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progressPercentage: number;
    completedSections: string[];
    quizAttempts: QuizAttempt[];
    startedAt: string;
    lastAccessedAt: string;
    completedAt: string | null;
}

export interface LearnModuleDetailResponse {
    module: LearnModuleDetail;
    progress: ModuleProgress;
}
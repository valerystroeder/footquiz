export interface Question {
    question: QuestionComponent;
    answer: AnswerComponent;
    asked: number;
    category: string;
}

export type QuestionComponent =
    | TextQuestionComponent
    | ClockDrawingQuestionComponent
    | ClockTextQuestionComponent
    | TimeDisplayQuestionComponent;

export type AnswerComponent =
    | MultipleChoiceAnswerComponent
    | TimePickerAnswerComponent;

export interface TextQuestionComponent {
    component: "text";
    text: string;
}

export interface ClockDrawingQuestionComponent {
    component: "clockDrawing";
    hour: number;
    minute: number;
}

export interface ClockTextQuestionComponent {
    component: "clockText";
    hour: number;
    minute: number;
}

export interface TimeDisplayQuestionComponent {
    component: "timeDisplay";
    hour: number;
    minute: number;
}

export interface MultipleChoiceAnswerComponent {
    component: "multipleChoice";
    answers: string[];
    correct: number;
}

export interface TimePickerAnswerComponent {
    component: "timePicker";
}
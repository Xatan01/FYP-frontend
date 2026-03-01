import React from "react";
import ChoiceButtons from "./ChoiceButtons";
import DragDropInteraction from "./DragDropInteraction";
import TrueFalseButtons from "./TrueFalseButtons";

export default function QuestionInteraction({ question, value, onChange, onDragStateChange }) {
  if (!question) return null;

  if (question.type === "true_false") {
    return <TrueFalseButtons value={value} onSelect={onChange} />;
  }

  if (question.type === "drag_drop") {
    return (
      <DragDropInteraction
        question={question}
        value={value}
        onChange={onChange}
        onDragStateChange={onDragStateChange}
      />
    );
  }

  return <ChoiceButtons options={question.options} value={value} onSelect={onChange} />;
}

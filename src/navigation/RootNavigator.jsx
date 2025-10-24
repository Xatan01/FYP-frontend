import React from "react";
import TabNavigator from "./TabNavigator";

export default function RootNavigator({ userData, learningPath, onCompleteLesson }) {
  // Pass all props down to the TabNavigator
  return (
    <TabNavigator
      userData={userData}
      learningPath={learningPath}
      onCompleteLesson={onCompleteLesson}
    />
  );
}
import { Panel } from '@/shared/ui/components';

import type { question_game } from './types/types';
import type { propsLevel } from './Level';
import Level from './Level';

interface props_GameFish extends propsLevel {
  questions: question_game[];
  initData?: question_game;
  isInitData?: boolean;
  addClassBtnFish?: string;
  video_interpreter?: video_interpreter;
}
interface video_interpreter {
  a11yURL: string;
  contentURL: string;
}

export function GameFish({
  addClassBtnFish,
  questions,
  video_interpreter,
  initData,
  isInitData = true,
  children,
  ...props
}: props_GameFish) {
  return (
    <Panel>
      <div id="fullscreen__section">
        {isInitData && initData && (
          <Panel.Section
            interpreter={{
              a11yURL: `${video_interpreter?.a11yURL}_1.mp4`,
              contentURL: `${video_interpreter?.contentURL}_1.mp4 `
            }}>
            <Level intro question={initData} {...props} />
          </Panel.Section>
        )}
        {questions.map((quest, index) => (
          <Panel.Section
            key={index}
            interpreter={{
              a11yURL: `${video_interpreter?.a11yURL}_${index + (isInitData ? 2 : 1)}.mp4`,
              contentURL: `${video_interpreter?.contentURL}_${index + (isInitData ? 2 : 1)}.mp4 `
            }}>
            <Level
              addClassBtnFish={addClassBtnFish}
              question={quest}
              index={index + 1 === questions.length ? undefined : index + 1}
              {...props}
              questionsCount={questions.length}
            />
          </Panel.Section>
        ))}
        {children}
      </div>
    </Panel>
  );
}

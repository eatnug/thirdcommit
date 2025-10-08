/**
 * Todo Entity
 *
 * 도메인의 핵심 개념을 표현하는 순수한 타입
 * 프레임워크나 외부 라이브러리에 의존하지 않음
 */
export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

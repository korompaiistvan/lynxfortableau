// local / state
import { AtomEffect, DefaultValue } from "recoil";

export const guardRecoilDefaultValue = (candidate: unknown): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) return true;
  return false;
};

export const logChangesEffect = (key: string) =>
  (({ onSet }) => {
    onSet((newValue) => {
      console.debug(`${key}: ${JSON.stringify(newValue)}`);
    });
  }) as AtomEffect<any>;

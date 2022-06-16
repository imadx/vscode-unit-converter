import { Selection, window } from "vscode";
import { UnitConversion } from "../types";

export const getSelectionText = (selection: Selection): string | null => {
  const editor = window.activeTextEditor!;
  return editor.document.getText(selection);
};

export const getConvertedToken = (
  conversion: UnitConversion,
  input: string | null,
): string | null => {
  if (typeof input !== "string") return input;

  switch (conversion) {
    case UnitConversion.pxToRem:
      return input.replace(/(\d+\.?\d*|\.\d*)px/g, getPxToRem);
    case UnitConversion.remToPx:
      return input.replace(/(\d+\.?\d*|\.\d*)rem/g, getRemToPx);
  }
};

const numberFormat = Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  useGrouping: false,
});

export const getPxToRem = (
  _matched: string,
  matchedValue: string,
  _index: number,
  inputString: string,
) => {
  const _matchedValue = Number(matchedValue);
  if (_matchedValue === 0) return "0";
  if (_matchedValue === 1) {
    if (inputString.includes("border")) {
      window.showWarningMessage(
        "Converting 1px to rem for borders will avoid displaying the border, Using 'thin' where applicable",
      );

      return "thin";
    }

    return "0.0625rem";
  }

  return numberFormat.format(_matchedValue / 16) + "rem";
};

export const getRemToPx = (_matched: string, matchedValue: string) => {
  const _matchedValue = Number(matchedValue);
  if (_matchedValue === 0) return "0";

  return numberFormat.format(_matchedValue * 16) + "px";
};

export const getUnitConverterFunction = (unitConversion: UnitConversion) => {
  return (selectedText: string | null) =>
    getConvertedToken(unitConversion, selectedText);
};

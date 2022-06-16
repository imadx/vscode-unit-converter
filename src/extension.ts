import * as vscode from "vscode";
import { Unit, UnitConversion } from "./types";
import {
  getConvertedToken,
  getSelectionText,
  getUnitConverterFunction,
} from "./utils/filters";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "unit-converter.convert-px-to-rem",
      async () => await convertSelectionsToUnit(UnitConversion.pxToRem),
    ),
    vscode.commands.registerCommand(
      "unit-converter.convert-rem-to-px",
      async () => await convertSelectionsToUnit(UnitConversion.remToPx),
    ),
  );
}

const convertSelectionsToUnit = async (unitConversion: UnitConversion) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage(
      "This command can be used only with an active text editor window",
    );
    return;
  }

  // No selections
  if (editor.selections.length === 1 && !getSelectionText(editor.selection)) {
    let input = await vscode.window.showInputBox({
      placeHolder: getPromptInputPlaceholder(unitConversion),
    });

    if (!input) {
      return;
    }

    if (input.match(/\d+/)) {
      input = getUnitAppendedInputValue(unitConversion, input);
    }

    replaceUpdatedTokens(
      editor,
      [editor.selection],
      [getConvertedToken(unitConversion, input || null) || ""],
    );
    return;
  }

  // Update existing selections
  let updatedTokens = editor.selections
    .map(getSelectionText)
    .map(getUnitConverterFunction(unitConversion));

  replaceUpdatedTokens(editor, editor.selections, updatedTokens);
};

const replaceUpdatedTokens = (
  editor: vscode.TextEditor,
  selections: readonly vscode.Selection[],
  updatedTokens: (string | null)[],
) => {
  editor.edit((builder) => {
    selections.forEach((selection, i) => {
      const _token = updatedTokens[i];
      if (typeof _token !== "string") {
        return;
      }

      builder.replace(selection, _token);
    });
  });
};

export function deactivate() {}

const getPromptInputPlaceholder = (unitConversion: UnitConversion) => {
  switch (unitConversion) {
    case UnitConversion.pxToRem:
      return `Enter a value in px to convert: (eg: 12px)`;
    case UnitConversion.remToPx:
      return `Enter a value in rem to convert: (eg: 2.5rem)`;
  }
};

const getUnitAppendedInputValue = (
  unitConversion: UnitConversion,
  value: string,
): string => {
  switch (unitConversion) {
    case UnitConversion.pxToRem:
      return value + "px";
    case UnitConversion.remToPx:
      return value + "rem";
    default:
      return value;
  }
};

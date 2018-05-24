"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _draftJs = require("draft-js");

var changeCurrentInlineStyle = function changeCurrentInlineStyle(editorState, matchArr, style) {
  var currentContent = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var key = selection.getStartKey();
  var index = matchArr.index;

  var blockMap = currentContent.getBlockMap();
  var block = blockMap.get(key);
  var currentInlineStyle = block.getInlineStyleAt(index).merge();
  var newStyle = currentInlineStyle.merge([style]);
  var focusOffset = index + matchArr[0].length;

  var wordSelection = _draftJs.SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset: focusOffset
  });

  var inlineStyles = [];
  var markdownCharacterLength = (matchArr[0].length - matchArr[1].length) / 2;

  var newContentState = currentContent;

  // remove markdown delimiter at end
  newContentState = _draftJs.Modifier.removeRange(newContentState, wordSelection.merge({
    anchorOffset: wordSelection.getFocusOffset() - markdownCharacterLength
  }));

  var afterSelection = newContentState.getSelectionAfter();

  afterSelection = afterSelection.merge({
    anchorOffset: afterSelection.getFocusOffset() - markdownCharacterLength,
    focusOffset: afterSelection.getFocusOffset() - markdownCharacterLength
  });

  // remove markdown delimiter at start
  newContentState = _draftJs.Modifier.removeRange(newContentState, wordSelection.merge({
    focusOffset: wordSelection.getAnchorOffset() + markdownCharacterLength
  }));

  // apply style
  newContentState = _draftJs.Modifier.applyInlineStyle(newContentState, wordSelection.merge({
    anchorOffset: index,
    focusOffset: focusOffset - markdownCharacterLength * 2
  }), style);

  var newEditorState = _draftJs.EditorState.push(editorState, newContentState, "change-inline-style");

  return _draftJs.EditorState.setInlineStyleOverride(_draftJs.EditorState.forceSelection(newEditorState, afterSelection), _immutable.OrderedSet.of(""));
};

exports.default = changeCurrentInlineStyle;
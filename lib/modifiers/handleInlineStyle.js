"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _changeCurrentInlineStyle = require("./changeCurrentInlineStyle");

var _changeCurrentInlineStyle2 = _interopRequireDefault(_changeCurrentInlineStyle);

var _draftJs = require("draft-js");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleChange = function handleChange(editorState, line, whitelist) {
  var newEditorState = editorState;
  Object.keys(_constants.inlineMatchers).filter(function (matcher) {
    return whitelist.includes(matcher);
  }).some(function (k) {
    _constants.inlineMatchers[k].some(function (re) {
      var matchArr = void 0;
      do {
        matchArr = re.exec(line);
        if (matchArr) {
          newEditorState = (0, _changeCurrentInlineStyle2.default)(newEditorState, matchArr, k);
        }
      } while (matchArr);
      return newEditorState !== editorState;
    });
    return newEditorState !== editorState;
  });
  return newEditorState;
};

var getLine = function getLine(editorState, anchorOffset) {
  var selection = editorState.getSelection().merge({ anchorOffset: anchorOffset });
  var key = editorState.getSelection().getStartKey();

  return editorState.getCurrentContent().getBlockForKey(key).getText().slice(0, selection.getFocusOffset());
};

var handleInlineStyle = function handleInlineStyle(whitelist, editorState, character) {
  var selection = editorState.getSelection();
  var line = getLine(editorState, selection.getAnchorOffset());
  var newEditorState = handleChange(editorState, line, whitelist);
  var lastEditorState = editorState;

  while (newEditorState !== lastEditorState) {
    lastEditorState = newEditorState;
    line = getLine(newEditorState, selection.getAnchorOffset());
    newEditorState = handleChange(newEditorState, line, whitelist);
  }

  if (newEditorState !== editorState) {
    var newContentState = newEditorState.getCurrentContent();
    selection = newEditorState.getSelection();

    if (character === "\n") {
      newContentState = _draftJs.Modifier.splitBlock(newContentState, selection);
    } else {
      newContentState = _draftJs.Modifier.insertText(newContentState, selection, character);
    }

    newEditorState = _draftJs.EditorState.push(newEditorState, newContentState, "change-inline-style");
  }

  return newEditorState;
};

exports.default = handleInlineStyle;
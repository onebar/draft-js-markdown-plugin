"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _draftJsCheckableListItem = require("draft-js-checkable-list-item");

var _immutable = require("immutable");

var _Code = require("./components/Code");

var _Code2 = _interopRequireDefault(_Code);

var _draftJs = require("draft-js");

var _adjustBlockDepth = require("./modifiers/adjustBlockDepth");

var _adjustBlockDepth2 = _interopRequireDefault(_adjustBlockDepth);

var _handleBlockType = require("./modifiers/handleBlockType");

var _handleBlockType2 = _interopRequireDefault(_handleBlockType);

var _handleInlineStyle = require("./modifiers/handleInlineStyle");

var _handleInlineStyle2 = _interopRequireDefault(_handleInlineStyle);

var _splitBlockAndChange = require("./modifiers/splitBlockAndChange");

var _splitBlockAndChange2 = _interopRequireDefault(_splitBlockAndChange);

var _handleNewCodeBlock = require("./modifiers/handleNewCodeBlock");

var _handleNewCodeBlock2 = _interopRequireDefault(_handleNewCodeBlock);

var _resetInlineStyle = require("./modifiers/resetInlineStyle");

var _resetInlineStyle2 = _interopRequireDefault(_resetInlineStyle);

var _insertEmptyBlock = require("./modifiers/insertEmptyBlock");

var _insertEmptyBlock2 = _interopRequireDefault(_insertEmptyBlock);

var _handleLink = require("./modifiers/handleLink");

var _handleLink2 = _interopRequireDefault(_handleLink);

var _handleImage = require("./modifiers/handleImage");

var _handleImage2 = _interopRequireDefault(_handleImage);

var _leaveList = require("./modifiers/leaveList");

var _leaveList2 = _interopRequireDefault(_leaveList);

var _insertText = require("./modifiers/insertText");

var _insertText2 = _interopRequireDefault(_insertText);

var _changeCurrentBlockType = require("./modifiers/changeCurrentBlockType");

var _changeCurrentBlockType2 = _interopRequireDefault(_changeCurrentBlockType);

var _link = require("./decorators/link");

var _link2 = _interopRequireDefault(_link);

var _image = require("./decorators/image");

var _image2 = _interopRequireDefault(_image);

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultLanguages = {
  bash: "Bash",
  c: "C",
  cpp: "C++",
  css: "CSS",
  go: "Go",
  html: "HTML",
  java: "Java",
  js: "JavaScript",
  kotlin: "Kotlin",
  mathml: "MathML",
  perl: "Perl",
  ruby: "Ruby",
  scala: "Scala",
  sql: "SQL",
  svg: "SVG",
  swift: "Swift"
};

var INLINE_STYLE_CHARACTERS = [" ", "*", "_"];

var defaultRenderSelect = function defaultRenderSelect(_ref) {
  var options = _ref.options,
      onChange = _ref.onChange,
      selectedValue = _ref.selectedValue;
  return _react2.default.createElement(
    "select",
    { value: selectedValue, onChange: onChange },
    options.map(function (_ref2) {
      var label = _ref2.label,
          value = _ref2.value;
      return _react2.default.createElement(
        "option",
        { key: value, value: value },
        label
      );
    })
  );
};

function inLink(editorState) {
  var selection = editorState.getSelection();
  var contentState = editorState.getCurrentContent();
  var block = contentState.getBlockForKey(selection.getAnchorKey());
  var entityKey = block.getEntityAt(selection.getFocusOffset());
  return entityKey != null && contentState.getEntity(entityKey).getType() === "LINK";
}

function inCodeBlock(editorState) {
  var startKey = editorState.getSelection().getStartKey();
  if (startKey) {
    var currentBlockType = editorState.getCurrentContent().getBlockForKey(startKey).getType();
    if (currentBlockType === "code-block") return true;
  }

  return false;
}

function checkCharacterForState(config, editorState, character) {
  var newEditorState = (0, _handleBlockType2.default)(config.features.block, editorState, character);
  if (editorState === newEditorState && config.features.inline.includes("IMAGE")) {
    newEditorState = (0, _handleImage2.default)(editorState, character, config.entityType.IMAGE);
  }
  if (editorState === newEditorState && config.features.inline.includes("LINK")) {
    newEditorState = (0, _handleLink2.default)(editorState, character, config.entityType.LINK);
  }
  if (newEditorState === editorState && config.features.block.includes("CODE")) {
    var contentState = editorState.getCurrentContent();
    var selection = editorState.getSelection();
    var key = selection.getStartKey();
    var currentBlock = contentState.getBlockForKey(key);
    var text = currentBlock.getText();
    var type = currentBlock.getType();
    if (type !== "code-block" && _constants.CODE_BLOCK_REGEX.test(text)) newEditorState = (0, _handleNewCodeBlock2.default)(editorState);
  }
  if (editorState === newEditorState) {
    newEditorState = (0, _handleInlineStyle2.default)(config.features.inline, editorState, character);
  }
  return newEditorState;
}

function checkReturnForState(config, editorState, ev) {
  var newEditorState = editorState;
  var contentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var isCollapsed = selection.isCollapsed();
  var key = selection.getStartKey();
  var endOffset = selection.getEndOffset();
  var currentBlock = contentState.getBlockForKey(key);
  var blockLength = currentBlock.getLength();
  var type = currentBlock.getType();
  var text = currentBlock.getText();

  if (/-list-item$/.test(type) && text === "") {
    newEditorState = (0, _leaveList2.default)(editorState);
  }

  var isHeader = /^header-/.test(type);
  var isBlockQuote = type === "blockquote";
  var isAtEndOfLine = endOffset === blockLength;
  var atEndOfHeader = isHeader && isAtEndOfLine;
  var atEndOfBlockQuote = isBlockQuote && isAtEndOfLine;

  if (newEditorState === editorState && isCollapsed && (atEndOfHeader || atEndOfBlockQuote)) {
    // transform markdown (if we aren't in a codeblock that is)
    if (!inCodeBlock(editorState)) {
      newEditorState = checkCharacterForState(config, newEditorState, "\n");
    }
    if (newEditorState === editorState) {
      newEditorState = (0, _insertEmptyBlock2.default)(newEditorState);
    } else {
      newEditorState = _draftJs.RichUtils.toggleBlockType(newEditorState, type);
    }
  } else if (isCollapsed && (isHeader || isBlockQuote) && !isAtEndOfLine) {
    newEditorState = (0, _splitBlockAndChange2.default)(newEditorState);
  }
  if (newEditorState === editorState && type !== "code-block" && config.features.block.includes("CODE") && _constants.CODE_BLOCK_REGEX.test(text)) {
    newEditorState = (0, _handleNewCodeBlock2.default)(editorState);
  }
  if (newEditorState === editorState && type === "code-block") {
    if (/```\s*$/.test(text)) {
      newEditorState = (0, _changeCurrentBlockType2.default)(newEditorState, type, text.replace(/```\s*$/, ""));
      newEditorState = (0, _insertEmptyBlock2.default)(newEditorState);
    } else if (ev.shiftKey) {
      newEditorState = (0, _insertEmptyBlock2.default)(newEditorState);
    } else {
      newEditorState = (0, _insertText2.default)(editorState, "\n");
    }
  }

  return newEditorState;
}

var defaultConfig = {
  renderLanguageSelect: defaultRenderSelect,
  languages: defaultLanguages,
  features: {
    inline: _constants.defaultInlineWhitelist,
    block: _constants.defaultBlockWhitelist
  },
  entityType: _constants.ENTITY_TYPE
};

var createMarkdownPlugin = function createMarkdownPlugin() {
  var _config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var store = {};

  var config = _extends({}, defaultConfig, _config, {
    features: _extends({}, defaultConfig.features, _config.features),
    entityType: _extends({}, defaultConfig.entityType, _config.entityType)
  });

  return {
    store: store,
    blockRenderMap: (0, _immutable.Map)({
      "code-block": {
        element: "code",
        wrapper: _react2.default.createElement("pre", { spellCheck: "false" })
      }
    }).merge(_draftJsCheckableListItem.blockRenderMap),
    decorators: [(0, _link2.default)({
      entityType: config.entityType.LINK
    }), (0, _image2.default)({
      entityType: config.entityType.IMAGE
    })],
    initialize: function initialize(_ref3) {
      var setEditorState = _ref3.setEditorState,
          getEditorState = _ref3.getEditorState;

      store.setEditorState = setEditorState;
      store.getEditorState = getEditorState;
    },
    blockStyleFn: function blockStyleFn(block) {
      switch (block.getType()) {
        case _draftJsCheckableListItem.CHECKABLE_LIST_ITEM:
          return _draftJsCheckableListItem.CHECKABLE_LIST_ITEM;
        default:
          break;
      }
      return null;
    },
    blockRendererFn: function blockRendererFn(block, _ref4) {
      var setReadOnly = _ref4.setReadOnly,
          setEditorState = _ref4.setEditorState,
          getEditorState = _ref4.getEditorState,
          getEditorRef = _ref4.getEditorRef;

      switch (block.getType()) {
        case _draftJsCheckableListItem.CHECKABLE_LIST_ITEM:
          {
            return {
              component: _draftJsCheckableListItem.CheckableListItem,
              props: {
                onChangeChecked: function onChangeChecked() {
                  return setEditorState(_draftJsCheckableListItem.CheckableListItemUtils.toggleChecked(getEditorState(), block));
                },
                checked: !!block.getData().get("checked")
              }
            };
          }
        case _constants.CODE_BLOCK_TYPE:
          {
            return {
              component: _Code2.default,
              props: {
                setEditorState: setEditorState,
                renderLanguageSelect: config.renderLanguageSelect,
                languages: config.languages,
                setReadOnly: setReadOnly,
                language: block.getData().get("language"),
                getEditorState: getEditorState
              }
            };
          }

        default:
          return null;
      }
    },
    onTab: function onTab(ev, _ref5) {
      var getEditorState = _ref5.getEditorState,
          setEditorState = _ref5.setEditorState;

      var editorState = getEditorState();
      var newEditorState = (0, _adjustBlockDepth2.default)(editorState, ev);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    handleReturn: function handleReturn(ev, editorState, _ref6) {
      var setEditorState = _ref6.setEditorState;

      if (inLink(editorState)) return "not-handled";

      var newEditorState = checkReturnForState(config, editorState, ev);
      var selection = newEditorState.getSelection();

      // exit code blocks
      if (inCodeBlock(editorState) && !(0, _immutable.is)(editorState.getImmutable(), newEditorState.getImmutable())) {
        setEditorState(newEditorState);
        return "handled";
      }

      newEditorState = checkCharacterForState(config, newEditorState, "\n");
      var content = newEditorState.getCurrentContent();

      // if there are actually no changes but the editorState has a
      // current inline style we want to split the block
      if ((0, _immutable.is)(editorState.getImmutable(), newEditorState.getImmutable()) && editorState.getCurrentInlineStyle().size > 0) {
        content = _draftJs.Modifier.splitBlock(content, selection);
      }

      newEditorState = (0, _resetInlineStyle2.default)(newEditorState);

      if (editorState !== newEditorState) {
        setEditorState(_draftJs.EditorState.push(newEditorState, content, "split-block"));
        return "handled";
      }

      return "not-handled";
    },
    handleBeforeInput: function handleBeforeInput(character, editorState, _ref7) {
      var setEditorState = _ref7.setEditorState;

      if (character !== " ") {
        return "not-handled";
      }

      // If we're in a code block - don't transform markdown
      if (inCodeBlock(editorState)) return "not-handled";

      // If we're in a link - don't transform markdown
      if (inLink(editorState)) return "not-handled";

      var newEditorState = checkCharacterForState(config, editorState, character);
      if (editorState !== newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    handleKeyCommand: function handleKeyCommand(command, editorState, _ref8) {
      var setEditorState = _ref8.setEditorState;

      switch (command) {
        case "backspace":
          {
            // When a styled block is the first thing in the editor,
            // you cannot delete it. Typing backspace only deletes the content
            // but never deletes the block styling.
            // This piece of code fixes the issue by changing the block type
            // to 'unstyled' if we're on the first block of the editor and it's empty
            var selection = editorState.getSelection();
            var currentBlockKey = selection.getStartKey();
            if (!currentBlockKey) return "not-handled";

            var content = editorState.getCurrentContent();
            var currentBlock = content.getBlockForKey(currentBlockKey);
            var firstBlock = content.getFirstBlock();
            if (firstBlock !== currentBlock) return "not-handled";

            var currentBlockType = currentBlock.getType();
            var isEmpty = currentBlock.getLength() === 0;
            if (!isEmpty || currentBlockType === "unstyled") return "not-handled";

            setEditorState((0, _changeCurrentBlockType2.default)(editorState, "unstyled", ""));
            return "handled";
          }
        default:
          {
            return "not-handled";
          }
      }
    },
    handlePastedText: function handlePastedText(text, html, editorState, _ref9) {
      var setEditorState = _ref9.setEditorState;

      if (html) {
        return "not-handled";
      }
      // If we're in a code block don't add markdown to it
      if (inCodeBlock(editorState)) return "not-handled";
      var newEditorState = editorState;
      var buffer = [];
      for (var i = 0; i < text.length; i++) {
        // eslint-disable-line no-plusplus
        if (INLINE_STYLE_CHARACTERS.indexOf(text[i]) >= 0) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join("") + text[i]);
          newEditorState = checkCharacterForState(config, newEditorState, text[i]);
          buffer = [];
        } else if (text[i].charCodeAt(0) === 10) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join(""));
          var tmpEditorState = checkReturnForState(config, newEditorState, {});
          if (newEditorState === tmpEditorState) {
            newEditorState = (0, _insertEmptyBlock2.default)(tmpEditorState);
          } else {
            newEditorState = tmpEditorState;
          }
          buffer = [];
        } else if (i === text.length - 1) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join("") + text[i]);
          buffer = [];
        } else {
          buffer.push(text[i]);
        }
      }

      if (editorState !== newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    }
  };
};

exports.default = createMarkdownPlugin;
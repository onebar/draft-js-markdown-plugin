"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _imageStrategy = require("./imageStrategy");

var _imageStrategy2 = _interopRequireDefault(_imageStrategy);

var _Image = require("../../components/Image");

var _Image2 = _interopRequireDefault(_Image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createImageDecorator = function createImageDecorator(_ref) {
  var entityType = _ref.entityType;
  return {
    strategy: (0, _imageStrategy2.default)({ entityType: entityType }),
    component: _Image2.default
  };
};

exports.default = createImageDecorator;
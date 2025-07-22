"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Datasheet = void 0;
var form_data_1 = __importDefault(require("form-data"));
var const_1 = require("../const");
var field_1 = require("./field");
var record_1 = require("./record");
var view_1 = require("./view");
var Datasheet = /** @class */ (function () {
    function Datasheet(spaceId, datasheetId, apitable) {
        this.apitable = apitable;
        this.spaceId = spaceId;
        this.datasheetId = datasheetId;
    }
    Object.defineProperty(Datasheet.prototype, "fields", {
        get: function () {
            return new field_1.FieldManager(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Datasheet.prototype, "views", {
        get: function () {
            return new view_1.ViewManager(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Datasheet.prototype, "records", {
        get: function () {
            return new record_1.RecordManager(this);
        },
        enumerable: false,
        configurable: true
    });
    /**
    * Create Form.
    */
    Datasheet.prototype.create = function (datasheetCreateRo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.spaceId) {
                            throw new Error('Please enter the spaceId parameter when building the space object to determine the space station for the operation.');
                        }
                        return [4 /*yield*/, this.apitable.request({
                                path: "/spaces/" + this.spaceId + "/datasheets",
                                method: 'post',
                                data: datasheetCreateRo
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Upload files.
     * @param file
     * @returns
     */
    Datasheet.prototype.upload = function (file, options) {
        return __awaiter(this, void 0, void 0, function () {
            var form;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Only one file is allowed to be uploaded at a time.
                        if (Array.isArray(file)) {
                            file = file[0];
                        }
                        form = new form_data_1.default();
                        form.append('file', file, options);
                        return [4 /*yield*/, this.apitable.request({
                                path: "/datasheets/" + this.datasheetId + "/attachments",
                                method: 'post',
                                data: form,
                                headers: __assign({ 'Content-Type': 'multipart/form-data' }, (form.getHeaders ? form.getHeaders() : {})),
                                timeout: this.apitable.config.requestTimeout || const_1.DEFAULT_REQUEST_TIMEOUT * 10,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Datasheet.prototype.createEmbedLink = function (embedLinkCreateRo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.spaceId) {
                            throw new Error('Please enter the spaceId parameter when building the space object to determine the space station for the operation.');
                        }
                        return [4 /*yield*/, this.apitable.request({
                                path: "/spaces/" + this.spaceId + "/nodes/" + this.datasheetId + "/embedlinks",
                                method: 'post',
                                data: embedLinkCreateRo
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Datasheet.prototype.getEmbedLinks = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.spaceId) {
                            throw new Error('Please enter the spaceId parameter when building the space object to determine the space station for the operation.');
                        }
                        return [4 /*yield*/, this.apitable.request({
                                path: "/spaces/" + this.spaceId + "/nodes/" + this.datasheetId + "/embedlinks",
                                method: 'get'
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param linkId
     * @returns
     */
    Datasheet.prototype.deleteEmbedLink = function (linkId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.spaceId) {
                            throw new Error('Please enter the spaceId parameter when building the space object to determine the space station for the operation.');
                        }
                        return [4 /*yield*/, this.apitable.request({
                                path: "/spaces/" + this.spaceId + "/nodes/" + this.datasheetId + "/embedlinks/" + linkId,
                                method: 'delete'
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Datasheet;
}());
exports.Datasheet = Datasheet;

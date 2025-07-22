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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordManager = void 0;
var const_1 = require("../const");
var RecordManager = /** @class */ (function () {
    function RecordManager(datasheet) {
        this.datasheet = datasheet;
        this.datasheetId = datasheet.datasheetId;
        this.apitable = datasheet.apitable;
    }
    Object.defineProperty(RecordManager.prototype, "APIEndpoint", {
        get: function () {
            return "/datasheets/" + this.datasheetId + "/records";
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Automatically handles paging and returns recordsets by batch.
     * for await (let eachPageRecords of dst.records.queryAll()){
     *    console.log(eachPageRecords)
     * }
     * @param params
     */
    RecordManager.prototype.queryAll = function (params) {
        return __asyncGenerator(this, arguments, function queryAll_1() {
            var pageNum, total, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageNum = 0;
                        total = 0;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, __await(this.apitable.request({
                            path: this.APIEndpoint,
                            params: __assign({ pageSize: const_1.MAX_RECORD_SIZE, pageNum: ++pageNum }, params),
                            method: 'get',
                        }))];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw Error(result.message);
                        }
                        total = result.data.total;
                        return [4 /*yield*/, __await(result.data.records)];
                    case 3: return [4 /*yield*/, _a.sent()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (const_1.MAX_RECORD_SIZE * pageNum <= total) return [3 /*break*/, 1];
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RecordManager.prototype.query = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apitable.request({
                            path: this.APIEndpoint,
                            params: params,
                            method: 'get',
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RecordManager.prototype.get = function (recordIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _recordIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _recordIds = Array.isArray(recordIds) ? recordIds : [recordIds];
                        if (!_recordIds.length)
                            throw new TypeError('recordIds cant be empty');
                        return [4 /*yield*/, this.apitable.request({
                                path: this.APIEndpoint,
                                params: {
                                    recordIds: _recordIds,
                                },
                                method: 'get',
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RecordManager.prototype.create = function (newRecords, fieldKey) {
        if (fieldKey === void 0) { fieldKey = this.apitable.config.fieldKey; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apitable.request({
                            path: this.APIEndpoint,
                            params: {
                                fieldKey: fieldKey,
                            },
                            method: 'post',
                            data: {
                                records: newRecords,
                                fieldKey: fieldKey,
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RecordManager.prototype.update = function (records, fieldKey) {
        if (fieldKey === void 0) { fieldKey = this.apitable.config.fieldKey; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!records.length)
                            throw new TypeError('records cant be empty');
                        return [4 /*yield*/, this.apitable.request({
                                path: this.APIEndpoint,
                                params: {
                                    fieldKey: fieldKey
                                },
                                method: 'patch',
                                data: {
                                    records: records,
                                    fieldKey: fieldKey,
                                },
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RecordManager.prototype.delete = function (recordIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _recordIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _recordIds = Array.isArray(recordIds) ? recordIds : [recordIds];
                        return [4 /*yield*/, this.apitable.request({
                                path: this.APIEndpoint,
                                params: {
                                    recordIds: _recordIds,
                                },
                                method: 'delete',
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RecordManager;
}());
exports.RecordManager = RecordManager;

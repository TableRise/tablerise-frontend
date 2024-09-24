'use client';
"use strict";
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
exports.__esModule = true;
var react_1 = require("react");
var input_1 = require("./input");
var api_1 = require("@/server/users/api");
var getCookie_1 = require("@/utils/getCookie");
function Form() {
    //const [showPass, setShowPass] = useState<boolean>(false);
    //const [loading, setLoading] = useState<boolean>(false);
    var _a = react_1.useState(''), userEmail = _a[0], setEmail = _a[1];
    var _b = react_1.useState(''), userPassword = _b[0], setPassword = _b[1];
    function validateInput(email, password) {
        var MIN_LENGTH_PASS = 6;
        var validHas = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        if (!validHas.test(email) || password.length < MIN_LENGTH_PASS) {
            return false;
        }
        return true;
    }
    function handleLogin(data) {
        return __awaiter(this, void 0, Promise, function () {
            var userEmail, userPassword, isValid, token, login, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userEmail = data.userEmail, userPassword = data.userPassword;
                        isValid = validateInput(userEmail, userPassword);
                        if (!isValid) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, getCookie_1.getToken()];
                    case 2:
                        token = _a.sent();
                        if (!token) return [3 /*break*/, 4];
                        return [4 /*yield*/, api_1.postLogin(data)];
                    case 3:
                        login = _a.sent();
                        localStorage.setItem('login', login);
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        return [2 /*return*/, error_1];
                    case 6: return [2 /*return*/, 'dados inválidos'];
                }
            });
        });
    }
    return (React.createElement("main", { className: "h-300 w-5/6" },
        React.createElement("form", { className: "flex flex-col w-4/4", onSubmit: function (event) {
                event.preventDefault();
            } },
            React.createElement(input_1["default"], { type: "email", name: "E-mail", placeholder: "Insira o seu e-mail", id: "emailInput", onChange: setEmail }),
            React.createElement(input_1["default"], { type: "password", name: "Password", placeholder: "Insira a sua senha", id: "passwordInput", onChange: setPassword }),
            React.createElement("a", { href: "#" }, "Esqueceu a senha?"),
            " ",
            React.createElement("button", { type: "button", onClick: function () { return handleLogin({ userEmail: userEmail, userPassword: userPassword }); } }, "Entrar"))));
}
exports["default"] = Form;

"use strict";
// Sistema di autenticazione Firebase
// Utilizza Firebase Auth per l'autenticazione
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.authClient = void 0;
var firebaseAuth_1 = require("./firebaseAuth.cjs");
var FirebaseAuthClient = /** @class */ (function () {
    function FirebaseAuthClient() {
        // Firebase Auth gestisce automaticamente l'inizializzazione
    }
    FirebaseAuthClient.prototype.convertFirebaseUser = function (firebaseUser) {
        var _a, _b, _c;
        return {
            id: firebaseUser.id,
            email: firebaseUser.email,
            name: firebaseUser.name || ((_a = firebaseUser.displayName) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || '',
            surname: firebaseUser.surname || ((_b = firebaseUser.displayName) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || '',
            username: firebaseUser.username || ((_c = firebaseUser.email) === null || _c === void 0 ? void 0 : _c.split('@')[0]) || '',
            phone: firebaseUser.phone || firebaseUser.phoneNumber || '',
            role: firebaseUser.role || 'user',
            created_at: firebaseUser.created_at || new Date().toISOString(),
            updated_at: firebaseUser.updated_at || new Date().toISOString()
        };
    };
    // Registrazione
    FirebaseAuthClient.prototype.signUp = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var result, user, session, error_1;
            var email = _b.email, password = _b.password, options = _b.options;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, firebaseAuth_1.firebaseAuth.signUp({ email: email, password: password, options: options })];
                    case 1:
                        result = _c.sent();
                        if (result.error) {
                            return [2 /*return*/, {
                                    data: { user: null, session: null },
                                    error: result.error
                                }];
                        }
                        if (result.data.user && result.data.session) {
                            user = this.convertFirebaseUser(result.data.user);
                            session = {
                                user: user,
                                access_token: result.data.session.access_token
                            };
                            return [2 /*return*/, {
                                    data: { user: user, session: session },
                                    error: null
                                }];
                        }
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: 'Errore durante la registrazione' }
                            }];
                    case 2:
                        error_1 = _c.sent();
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: error_1.message || 'Errore durante la registrazione' }
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Login
    FirebaseAuthClient.prototype.signInWithPassword = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var result, user, session, error_2;
            var email = _b.email, password = _b.password;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, firebaseAuth_1.firebaseAuth.signInWithPassword({ email: email, password: password })];
                    case 1:
                        result = _c.sent();
                        if (result.error) {
                            return [2 /*return*/, {
                                    data: { user: null, session: null },
                                    error: result.error
                                }];
                        }
                        if (result.data.user && result.data.session) {
                            user = this.convertFirebaseUser(result.data.user);
                            session = {
                                user: user,
                                access_token: result.data.session.access_token
                            };
                            return [2 /*return*/, {
                                    data: { user: user, session: session },
                                    error: null
                                }];
                        }
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: 'Errore durante il login' }
                            }];
                    case 2:
                        error_2 = _c.sent();
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: error_2.message || 'Errore durante il login' }
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Logout
    FirebaseAuthClient.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, firebaseAuth_1.firebaseAuth.signOut()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, { error: { message: error_3.message || 'Errore durante il logout' } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Ottieni sessione corrente
    FirebaseAuthClient.prototype.getSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, user, session, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, firebaseAuth_1.firebaseAuth.getSession()];
                    case 1:
                        result = _a.sent();
                        if (result.error || !result.data.session) {
                            return [2 /*return*/, { data: { session: null } }];
                        }
                        user = this.convertFirebaseUser(result.data.session.user);
                        session = {
                            user: user,
                            access_token: result.data.session.access_token
                        };
                        return [2 /*return*/, { data: { session: session } }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, { data: { session: null } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Reset password tramite Firebase
    FirebaseAuthClient.prototype.resetPasswordForEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Firebase gestisce automaticamente l'invio dell'email di reset
                    // Per ora ritorniamo successo, in futuro si può implementare con Firebase Auth
                    console.log("Reset password richiesto per: ".concat(email));
                    return [2 /*return*/, { error: null }];
                }
                catch (error) {
                    return [2 /*return*/, { error: { message: error.message || 'Errore durante il reset password' } }];
                }
                return [2 /*return*/];
            });
        });
    };
    // Listener per cambiamenti di autenticazione
    FirebaseAuthClient.prototype.onAuthStateChange = function (callback) {
        var _this = this;
        return firebaseAuth_1.firebaseAuth.onAuthStateChange(function (event, firebaseSession) {
            if (firebaseSession && firebaseSession.user) {
                var user = _this.convertFirebaseUser(firebaseSession.user);
                var session = {
                    user: user,
                    access_token: firebaseSession.access_token
                };
                callback(event, session);
            }
            else {
                callback(event, null);
            }
        });
    };
    return FirebaseAuthClient;
}());
// Istanza globale
exports.authClient = new FirebaseAuthClient();
// Oggetto compatibile con l'interfaccia Supabase
exports.supabase = {
    auth: exports.authClient
};
exports.default = exports.supabase;

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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebase = exports.firestore = exports.firebaseAuth = exports.FirestoreWrapper = exports.FirebaseAuthWrapper = void 0;
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var firebaseClient_1 = require("./firebaseClient");
// Wrapper per compatibilità con l'API Supabase
var FirebaseAuthWrapper = /** @class */ (function () {
    function FirebaseAuthWrapper() {
    }
    // Simula supabase.auth.signInWithPassword
    FirebaseAuthWrapper.prototype.signInWithPassword = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var userCredential, user, error_1;
            var _c, _d, _e;
            var email = _b.email, password = _b.password;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 4]);
                        if (!firebaseClient_1.auth) {
                            throw new Error('Firebase Auth not initialized');
                        }
                        return [4 /*yield*/, (0, auth_1.signInWithEmailAndPassword)(firebaseClient_1.auth, email, password)];
                    case 1:
                        userCredential = _f.sent();
                        user = this.convertFirebaseUser(userCredential.user);
                        _c = {};
                        _d = {
                            user: user
                        };
                        _e = {
                            user: user
                        };
                        return [4 /*yield*/, userCredential.user.getIdToken()];
                    case 2: return [2 /*return*/, (_c.data = (_d.session = (_e.access_token = _f.sent(),
                            _e),
                            _d),
                            _c.error = null,
                            _c)];
                    case 3:
                        error_1 = _f.sent();
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: error_1.message, code: error_1.code }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Simula supabase.auth.signUp
    FirebaseAuthWrapper.prototype.signUp = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var userCredential, user, userProfile, convertedUser, error_2;
            var _c, _d, _e;
            var _f, _g, _h, _j, _k, _l, _m, _o;
            var email = _b.email, password = _b.password, options = _b.options;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        _p.trys.push([0, 6, , 7]);
                        if (!firebaseClient_1.auth || !firebaseClient_1.db) {
                            throw new Error('Firebase not initialized');
                        }
                        return [4 /*yield*/, (0, auth_1.createUserWithEmailAndPassword)(firebaseClient_1.auth, email, password)];
                    case 1:
                        userCredential = _p.sent();
                        user = userCredential.user;
                        if (!((_f = options === null || options === void 0 ? void 0 : options.data) === null || _f === void 0 ? void 0 : _f.full_name)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, auth_1.updateProfile)(user, {
                                displayName: options.data.full_name
                            })];
                    case 2:
                        _p.sent();
                        _p.label = 3;
                    case 3:
                        userProfile = {
                            id: user.uid,
                            email: user.email,
                            full_name: ((_g = options === null || options === void 0 ? void 0 : options.data) === null || _g === void 0 ? void 0 : _g.full_name) || '',
                            username: ((_h = options === null || options === void 0 ? void 0 : options.data) === null || _h === void 0 ? void 0 : _h.username) || '',
                            phone: ((_j = options === null || options === void 0 ? void 0 : options.data) === null || _j === void 0 ? void 0 : _j.phone) || '',
                            date_of_birth: ((_k = options === null || options === void 0 ? void 0 : options.data) === null || _k === void 0 ? void 0 : _k.date_of_birth) || '',
                            role: ((_l = options === null || options === void 0 ? void 0 : options.data) === null || _l === void 0 ? void 0 : _l.role) || 'user',
                            name: ((_m = options === null || options === void 0 ? void 0 : options.data) === null || _m === void 0 ? void 0 : _m.name) || '',
                            surname: ((_o = options === null || options === void 0 ? void 0 : options.data) === null || _o === void 0 ? void 0 : _o.surname) || '',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(firebaseClient_1.db, 'profiles', user.uid), userProfile)];
                    case 4:
                        _p.sent();
                        convertedUser = this.convertFirebaseUser(user);
                        _c = {};
                        _d = {
                            user: convertedUser
                        };
                        _e = {
                            user: convertedUser
                        };
                        return [4 /*yield*/, user.getIdToken()];
                    case 5: return [2 /*return*/, (_c.data = (_d.session = (_e.access_token = _p.sent(),
                            _e),
                            _d),
                            _c.error = null,
                            _c)];
                    case 6:
                        error_2 = _p.sent();
                        return [2 /*return*/, {
                                data: { user: null, session: null },
                                error: { message: error_2.message, code: error_2.code }
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Simula supabase.auth.signOut
    FirebaseAuthWrapper.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!firebaseClient_1.auth) {
                            throw new Error('Firebase Auth not initialized');
                        }
                        return [4 /*yield*/, (0, auth_1.signOut)(firebaseClient_1.auth)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { error: null }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, { error: { message: error_3.message, code: error_3.code } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Simula supabase.auth.getSession
    FirebaseAuthWrapper.prototype.getSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, convertedUser, error_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        if (!firebaseClient_1.auth) {
                            throw new Error('Firebase Auth not initialized');
                        }
                        user = firebaseClient_1.auth.currentUser;
                        if (!user) return [3 /*break*/, 2];
                        convertedUser = this.convertFirebaseUser(user);
                        _a = {};
                        _b = {};
                        _c = {
                            user: convertedUser
                        };
                        return [4 /*yield*/, user.getIdToken()];
                    case 1: return [2 /*return*/, (_a.data = (_b.session = (_c.access_token = _d.sent(),
                            _c),
                            _b),
                            _a.error = null,
                            _a)];
                    case 2: return [2 /*return*/, {
                            data: { session: null },
                            error: null
                        }];
                    case 3:
                        error_4 = _d.sent();
                        return [2 /*return*/, {
                                data: { session: null },
                                error: { message: error_4.message, code: error_4.code }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Simula supabase.auth.getUser
    FirebaseAuthWrapper.prototype.getUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                try {
                    if (!firebaseClient_1.auth) {
                        throw new Error('Firebase Auth not initialized');
                    }
                    user = firebaseClient_1.auth.currentUser;
                    if (user) {
                        return [2 /*return*/, {
                                data: { user: this.convertFirebaseUser(user) },
                                error: null
                            }];
                    }
                    return [2 /*return*/, {
                            data: { user: null },
                            error: null
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            data: { user: null },
                            error: { message: error.message, code: error.code }
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // Simula supabase.auth.onAuthStateChange
    FirebaseAuthWrapper.prototype.onAuthStateChange = function (callback) {
        var _this = this;
        if (!firebaseClient_1.auth) {
            console.warn('Firebase Auth not initialized');
            return { data: { subscription: { unsubscribe: function () { } } } };
        }
        var unsubscribe = (0, auth_1.onAuthStateChanged)(firebaseClient_1.auth, function (user) { return __awaiter(_this, void 0, void 0, function () {
            var convertedUser, session;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!user) return [3 /*break*/, 2];
                        convertedUser = this.convertFirebaseUser(user);
                        _a = {
                            user: convertedUser
                        };
                        return [4 /*yield*/, user.getIdToken()];
                    case 1:
                        session = (_a.access_token = _b.sent(),
                            _a);
                        callback('SIGNED_IN', session);
                        return [3 /*break*/, 3];
                    case 2:
                        callback('SIGNED_OUT', null);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return {
            data: {
                subscription: {
                    unsubscribe: unsubscribe
                }
            }
        };
    };
    // Converte un utente Firebase nel formato compatibile con Supabase
    FirebaseAuthWrapper.prototype.convertFirebaseUser = function (firebaseUser) {
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
        };
    };
    return FirebaseAuthWrapper;
}());
exports.FirebaseAuthWrapper = FirebaseAuthWrapper;
// Wrapper per le operazioni Firestore (simula le query Supabase)
var FirestoreWrapper = /** @class */ (function () {
    function FirestoreWrapper() {
    }
    // Simula supabase.from('profiles')
    FirestoreWrapper.prototype.from = function (tableName) {
        return new FirestoreQueryBuilder(tableName);
    };
    return FirestoreWrapper;
}());
exports.FirestoreWrapper = FirestoreWrapper;
var FirestoreQueryBuilder = /** @class */ (function () {
    function FirestoreQueryBuilder(tableName) {
        this.selectFields = [];
        this.whereConditions = [];
        this.singleResult = false;
        // Added for ordering and pagination compatibility
        this.orderAscending = true;
        this.tableName = tableName;
    }
    FirestoreQueryBuilder.prototype.select = function (fields /*, _options?: any */) {
        if (fields === '*') {
            this.selectFields = [];
        }
        else {
            this.selectFields = fields.split(',').map(function (f) { return f.trim(); });
        }
        return this;
    };
    FirestoreQueryBuilder.prototype.eq = function (field, value) {
        this.whereConditions.push({ field: field, operator: '==', value: value });
        return this;
    };
    // Supabase-like order(field, { ascending })
    FirestoreQueryBuilder.prototype.order = function (field, options) {
        this.orderField = field;
        this.orderAscending = (options === null || options === void 0 ? void 0 : options.ascending) !== false; // default true
        return this;
    };
    FirestoreQueryBuilder.prototype.limit = function (count) {
        this.limitCount = count;
        return this;
    };
    // Supabase-like range(start, end)
    FirestoreQueryBuilder.prototype.range = function (start, end) {
        this.rangeStart = start;
        this.rangeEnd = end;
        return this;
    };
    FirestoreQueryBuilder.prototype.single = function () {
        this.singleResult = true;
        return this;
    };
    // Make the builder thenable so `await query` works like Supabase
    FirestoreQueryBuilder.prototype.then = function (onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    };
    // Simula supabase.from().insert()
    FirestoreQueryBuilder.prototype.insert = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, data_1, item, docRef, docRef, dataWithId, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        if (!firebaseClient_1.db) {
                            throw new Error('Firestore not initialized');
                        }
                        if (!Array.isArray(data)) return [3 /*break*/, 5];
                        results = [];
                        _i = 0, data_1 = data;
                        _a.label = 1;
                    case 1:
                        if (!(_i < data_1.length)) return [3 /*break*/, 4];
                        item = data_1[_i];
                        docRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebaseClient_1.db, this.tableName));
                        return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, __assign(__assign({}, item), { id: docRef.id }))];
                    case 2:
                        _a.sent();
                        results.push(__assign(__assign({}, item), { id: docRef.id }));
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, { data: results, error: null }];
                    case 5:
                        docRef = (0, firestore_1.doc)((0, firestore_1.collection)(firebaseClient_1.db, this.tableName));
                        dataWithId = __assign(__assign({}, data), { id: docRef.id });
                        return [4 /*yield*/, (0, firestore_1.setDoc)(docRef, dataWithId)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, { data: dataWithId, error: null }];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_5 = _a.sent();
                        return [2 /*return*/, { data: null, error: { message: error_5.message, code: error_5.code } }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    FirestoreQueryBuilder.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var q, queryConstraints, querySnapshot, data, field, asc, start, count, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!firebaseClient_1.db) {
                            throw new Error('Firestore not initialized');
                        }
                        q = (0, firestore_1.collection)(firebaseClient_1.db, this.tableName);
                        if (this.whereConditions.length > 0) {
                            queryConstraints = this.whereConditions.map(function (cond) {
                                return (0, firestore_1.where)(cond.field, cond.operator, cond.value);
                            });
                            q = firestore_1.query.apply(void 0, __spreadArray([(0, firestore_1.collection)(firebaseClient_1.db, this.tableName)], queryConstraints, false));
                        }
                        return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                    case 1:
                        querySnapshot = _a.sent();
                        data = querySnapshot.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); });
                        // Applica ordinamento (in-memory) se richiesto
                        if (this.orderField) {
                            field = this.orderField;
                            asc = this.orderAscending;
                            data.sort(function (a, b) {
                                var va = a[field];
                                var vb = b[field];
                                var da = typeof va === 'string' && /\d{4}-\d{2}-\d{2}T/.test(va) ? new Date(va).getTime() : va;
                                var dbv = typeof vb === 'string' && /\d{4}-\d{2}-\d{2}T/.test(vb) ? new Date(vb).getTime() : vb;
                                if (da < dbv)
                                    return asc ? -1 : 1;
                                if (da > dbv)
                                    return asc ? 1 : -1;
                                return 0;
                            });
                        }
                        // Applica paginazione: range ha priorità su limit
                        if (this.rangeStart !== undefined && this.rangeEnd !== undefined) {
                            start = Math.max(0, this.rangeStart);
                            count = Math.max(0, this.rangeEnd - this.rangeStart + 1);
                            data = data.slice(start, start + count);
                        }
                        else if (this.limitCount) {
                            data = data.slice(0, this.limitCount);
                        }
                        // Se è richiesto un singolo risultato
                        if (this.singleResult) {
                            if (data.length === 0) {
                                return [2 /*return*/, { data: null, error: null }];
                            }
                            return [2 /*return*/, { data: data[0], error: null }];
                        }
                        return [2 /*return*/, { data: data, error: null }];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, { data: null, error: { message: error_6.message, code: error_6.code } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FirestoreQueryBuilder;
}());
// Istanze globali per compatibilità
exports.firebaseAuth = new FirebaseAuthWrapper();
exports.firestore = new FirestoreWrapper();
// Oggetto principale che simula il client Supabase
exports.firebase = {
    auth: exports.firebaseAuth,
    from: function (tableName) { return exports.firestore.from(tableName); },
    // Simula supabase.channel() per compatibilità realtime
    channel: function (channelName) {
        return {
            on: function (event, config, callback) {
                // Per ora, ritorna un oggetto mock che non fa nulla
                // In futuro si può implementare con Firebase Realtime Database o Firestore listeners
                console.log("Firebase realtime channel '".concat(channelName, "' not implemented yet"));
                return this;
            },
            subscribe: function () {
                // Ritorna un oggetto mock
                return {
                    unsubscribe: function () { return console.log('Unsubscribed from Firebase realtime channel'); }
                };
            }
        };
    },
    // Simula supabase.removeChannel()
    removeChannel: function (channel) {
        // Per ora, non fa nulla
        console.log('Firebase removeChannel called');
    }
};

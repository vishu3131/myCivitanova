"use strict";
/**
 * MYCIVITANOVA - CLIENT SUPABASE UNIFICATO CON SINCRONIZZAZIONE
 *
 * Client unificato che combina Firebase Auth e Supabase Database
 * con supporto per la sincronizzazione automatica dei profili utente.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.directSupabaseClient = exports.supabase = void 0;
var authClient_1 = require("./authClient");
var firebaseAuth_1 = require("./firebaseAuth");
var supabase_js_1 = require("@supabase/supabase-js");
var firebaseSupabaseSync_1 = require("../services/firebaseSupabaseSync");
var firebaseClient_1 = require("./firebaseClient"); // Import Firebase auth directly and rename
// Explicitly type the imported auth, handling potential null from firebaseClient.ts
var firebaseAuthInstance = firebaseClient_1.auth;
// Configurazione Supabase diretta per operazioni di sincronizzazione
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
var directSupabaseClient = null;
exports.directSupabaseClient = directSupabaseClient;
if (supabaseUrl && supabaseAnonKey) {
    exports.directSupabaseClient = directSupabaseClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
}
// Crea un client unificato che usa Firebase per auth e Supabase per database sincronizzato
exports.supabase = {
    // Metodi di autenticazione da Firebase
    auth: authClient_1.authClient,
    // Metodi database da Firebase (che wrappa Supabase)
    from: firebaseAuth_1.firebase.from.bind(firebaseAuth_1.firebase),
    // Client Supabase diretto per operazioni di sincronizzazione e funzionalità native Supabase
    direct: directSupabaseClient,
    // Espone rpc dal client Supabase diretto
    rpc: directSupabaseClient === null || directSupabaseClient === void 0 ? void 0 : directSupabaseClient.rpc.bind(directSupabaseClient),
    // Espone storage dal client Supabase diretto
    storage: directSupabaseClient === null || directSupabaseClient === void 0 ? void 0 : directSupabaseClient.storage,
    // Espone channel dal client Supabase diretto
    channel: directSupabaseClient === null || directSupabaseClient === void 0 ? void 0 : directSupabaseClient.channel.bind(directSupabaseClient),
    // Espone removeChannel dal client Supabase diretto
    removeChannel: directSupabaseClient === null || directSupabaseClient === void 0 ? void 0 : directSupabaseClient.removeChannel.bind(directSupabaseClient),
    // Metodi per accedere ai dati sincronizzati
    sync: {
        /**
         * Ottiene il profilo utente corrente dal database sincronizzato
         */
        getCurrentUserProfile: function () {
            return __awaiter(this, void 0, void 0, function () {
                var session, currentUser, _a, data, error, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, authClient_1.authClient.getSession()];
                        case 1:
                            session = (_b.sent()).data.session;
                            currentUser = session === null || session === void 0 ? void 0 : session.user;
                            if (!currentUser || !directSupabaseClient) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, directSupabaseClient
                                    .from('profiles')
                                    .select('*')
                                    .eq('firebase_uid', currentUser.id) // Use currentUser.id from AuthUser
                                    .single()];
                        case 2:
                            _a = _b.sent(), data = _a.data, error = _a.error;
                            if (error) {
                                console.error('Errore nel recupero profilo sincronizzato:', error);
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, data];
                        case 3:
                            error_1 = _b.sent();
                            console.error('Errore nel recupero profilo utente:', error_1);
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Aggiorna il profilo utente corrente nel database sincronizzato
         */
        updateCurrentUserProfile: function (updates) {
            return __awaiter(this, void 0, void 0, function () {
                var session, currentUser, error, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, authClient_1.authClient.getSession()];
                        case 1:
                            session = (_a.sent()).data.session;
                            currentUser = session === null || session === void 0 ? void 0 : session.user;
                            if (!currentUser || !directSupabaseClient) {
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, directSupabaseClient
                                    .from('profiles')
                                    .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                                    .eq('firebase_uid', currentUser.id)];
                        case 2:
                            error = (_a.sent()).error;
                            if (error) {
                                console.error('Errore nell\'aggiornamento profilo:', error);
                                return [2 /*return*/, false];
                            }
                            return [2 /*return*/, true];
                        case 3:
                            error_2 = _a.sent();
                            console.error('Errore nell\'aggiornamento profilo utente:', error_2);
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Ottiene un profilo utente per Firebase UID
         */
        getUserProfileByFirebaseUid: function (firebaseUid) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, data, error, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            if (!directSupabaseClient) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, directSupabaseClient
                                    .from('profiles')
                                    .select('*')
                                    .eq('firebase_uid', firebaseUid)
                                    .single()];
                        case 1:
                            _a = _b.sent(), data = _a.data, error = _a.error;
                            if (error) {
                                console.error('Errore nel recupero profilo per UID:', error);
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, data];
                        case 2:
                            error_3 = _b.sent();
                            console.error('Errore nel recupero profilo per Firebase UID:', error_3);
                            return [2 /*return*/, null];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Ottiene tutti i profili utente (solo per admin)
         */
        getAllUserProfiles: function () {
            return __awaiter(this, arguments, void 0, function (limit, offset) {
                var _a, data, error, error_4;
                if (limit === void 0) { limit = 50; }
                if (offset === void 0) { offset = 0; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            if (!directSupabaseClient) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, directSupabaseClient
                                    .from('profiles')
                                    .select('*')
                                    .order('created_at', { ascending: false })
                                    .range(offset, offset + limit - 1)];
                        case 1:
                            _a = _b.sent(), data = _a.data, error = _a.error;
                            if (error) {
                                console.error('Errore nel recupero di tutti i profili:', error);
                                return [2 /*return*/, []];
                            }
                            return [2 /*return*/, data || []];
                        case 2:
                            error_4 = _b.sent();
                            console.error('Errore nel recupero di tutti i profili utente:', error_4);
                            return [2 /*return*/, []];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Forza la sincronizzazione dell'utente corrente
         */
        syncCurrentUser: function () {
            return __awaiter(this, void 0, void 0, function () {
                var firebaseUser, result, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            firebaseUser = firebaseAuthInstance === null || firebaseAuthInstance === void 0 ? void 0 : firebaseAuthInstance.currentUser;
                            if (!firebaseUser) {
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, firebaseSupabaseSync_1.firebaseSupabaseSync.syncUser(firebaseUser)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.success];
                        case 2:
                            error_5 = _a.sent();
                            console.error('Errore nella sincronizzazione utente:', error_5);
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * Ottiene le statistiche di sincronizzazione
         */
        getStats: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, firebaseSupabaseSync_1.firebaseSupabaseSync.getSyncStats()];
                });
            });
        }
    }
};
// Mantieni l'export per compatibilità
exports.default = exports.supabase;

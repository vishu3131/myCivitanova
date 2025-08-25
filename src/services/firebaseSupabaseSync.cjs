"use strict";
/**
 * MYCIVITANOVA - SERVIZIO SINCRONIZZAZIONE FIREBASE -> SUPABASE
 *
 * Questo servizio gestisce la sincronizzazione automatica dei dati utente
 * da Firebase Auth/Firestore verso il database Supabase.
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
exports.firebaseSupabaseSync = void 0;
var firestore_1 = require("firebase/firestore");
var firebaseClient_1 = require("../utils/firebaseClient.cjs");
var supabaseClient_1 = require("../utils/supabaseClient.cjs");
var FirebaseSupabaseSync = /** @class */ (function () {
    function FirebaseSupabaseSync() {
        this.syncInProgress = false;
        this.lastSyncTime = null;
    }
    FirebaseSupabaseSync.getInstance = function () {
        if (!FirebaseSupabaseSync.instance) {
            FirebaseSupabaseSync.instance = new FirebaseSupabaseSync();
        }
        return FirebaseSupabaseSync.instance;
    };
    /**
     * Sincronizza un singolo utente Firebase con Supabase
     */
    FirebaseSupabaseSync.prototype.syncUser = function (firebaseUser) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, firebaseProfile, existingProfile, result, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 13]);
                        console.log("\uD83D\uDD04 Inizio sincronizzazione utente: ".concat(firebaseUser.uid));
                        return [4 /*yield*/, this.getFirebaseProfile(firebaseUser)];
                    case 2:
                        firebaseProfile = _a.sent();
                        if (!firebaseProfile) {
                            throw new Error('Impossibile ottenere il profilo Firebase');
                        }
                        return [4 /*yield*/, this.getSupabaseProfile(firebaseUser.uid)];
                    case 3:
                        existingProfile = _a.sent();
                        result = void 0;
                        if (!existingProfile) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.updateSupabaseProfile(firebaseProfile, existingProfile)];
                    case 4:
                        // Aggiorna profilo esistente
                        result = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.createSupabaseProfile(firebaseProfile)];
                    case 6:
                        // Crea nuovo profilo
                        result = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!(result.success && result.profileId)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.updateUserMapping(firebaseUser.uid, result.profileId)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: 
                    // 4. Log della sincronizzazione
                    return [4 /*yield*/, this.logSync({
                            firebase_uid: firebaseUser.uid,
                            profile_id: result.profileId,
                            sync_type: result.syncType,
                            sync_status: result.success ? 'success' : 'error',
                            firebase_data: firebaseProfile,
                            error_message: result.error,
                            sync_duration_ms: Date.now() - startTime
                        })];
                    case 10:
                        // 4. Log della sincronizzazione
                        _a.sent();
                        console.log("\u2705 Sincronizzazione completata per ".concat(firebaseUser.uid, ": ").concat(result.syncType));
                        return [2 /*return*/, result];
                    case 11:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : 'Errore sconosciuto';
                        console.error("\u274C Errore sincronizzazione ".concat(firebaseUser.uid, ":"), errorMessage);
                        // Log dell'errore
                        return [4 /*yield*/, this.logSync({
                                firebase_uid: firebaseUser.uid,
                                sync_type: 'update',
                                sync_status: 'error',
                                error_message: errorMessage,
                                sync_duration_ms: Date.now() - startTime
                            })];
                    case 12:
                        // Log dell'errore
                        _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: errorMessage,
                                syncType: 'update',
                                duration: Date.now() - startTime
                            }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ottiene il profilo completo da Firebase
     */
    FirebaseSupabaseSync.prototype.getFirebaseProfile = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var baseProfile, profileDoc, firestoreData, firestoreError_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        baseProfile = {
                            uid: user.uid,
                            email: user.email || '',
                            displayName: user.displayName || undefined,
                            photoURL: user.photoURL || undefined,
                            phoneNumber: user.phoneNumber || undefined,
                            emailVerified: user.emailVerified,
                            metadata: {
                                creationTime: user.metadata.creationTime,
                                lastSignInTime: user.metadata.lastSignInTime
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, firestore_1.getDoc)((0, firestore_1.doc)(firebaseClient_1.db, 'profiles', user.uid))];
                    case 2:
                        profileDoc = _a.sent();
                        if (profileDoc.exists()) {
                            firestoreData = profileDoc.data();
                            return [2 /*return*/, __assign(__assign({}, baseProfile), firestoreData)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        firestoreError_1 = _a.sent();
                        console.warn('Impossibile ottenere dati Firestore:', firestoreError_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, baseProfile];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Errore nel recupero profilo Firebase:', error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ottiene il profilo da Supabase
     */
    FirebaseSupabaseSync.prototype.getSupabaseProfile = function (firebaseUid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('profiles')
                                .select('*')
                                .eq('firebase_uid', firebaseUid)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Errore nel recupero profilo Supabase:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Crea un nuovo profilo in Supabase
     */
    FirebaseSupabaseSync.prototype.createSupabaseProfile = function (firebaseProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var profileData, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        profileData = {
                            firebase_uid: firebaseProfile.uid,
                            email: firebaseProfile.email,
                            full_name: firebaseProfile.displayName || null,
                            phone: firebaseProfile.phoneNumber || null,
                            avatar_url: firebaseProfile.photoURL || null,
                            is_verified: firebaseProfile.emailVerified,
                            firebase_created_at: firebaseProfile.metadata.creationTime || null,
                            firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null,
                            sync_status: 'synced',
                            last_sync_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('profiles')
                                .insert(profileData)
                                .select('id')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                success: true,
                                profileId: data.id,
                                syncType: 'create',
                                duration: 0 // Calcolato dal chiamante
                            }];
                    case 2:
                        error_4 = _b.sent();
                        throw new Error("Errore creazione profilo: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Aggiorna un profilo esistente in Supabase
     */
    FirebaseSupabaseSync.prototype.updateSupabaseProfile = function (firebaseProfile, existingProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var hasChanges, updateData, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        hasChanges = existingProfile.email !== firebaseProfile.email ||
                            existingProfile.full_name !== firebaseProfile.displayName ||
                            existingProfile.phone !== firebaseProfile.phoneNumber ||
                            existingProfile.avatar_url !== firebaseProfile.photoURL ||
                            existingProfile.is_verified !== firebaseProfile.emailVerified;
                        if (!!hasChanges) return [3 /*break*/, 2];
                        // Aggiorna solo il timestamp di sincronizzazione
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('profiles')
                                .update({
                                last_sync_at: new Date().toISOString(),
                                firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null
                            })
                                .eq('firebase_uid', firebaseProfile.uid)];
                    case 1:
                        // Aggiorna solo il timestamp di sincronizzazione
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                profileId: existingProfile.id,
                                syncType: 'update',
                                duration: 0
                            }];
                    case 2:
                        updateData = {
                            email: firebaseProfile.email,
                            full_name: firebaseProfile.displayName || null,
                            phone: firebaseProfile.phoneNumber || null,
                            avatar_url: firebaseProfile.photoURL || null,
                            is_verified: firebaseProfile.emailVerified,
                            firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null,
                            sync_status: 'synced',
                            last_sync_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('profiles')
                                .update(updateData)
                                .eq('firebase_uid', firebaseProfile.uid)];
                    case 3:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                success: true,
                                profileId: existingProfile.id,
                                syncType: 'update',
                                duration: 0
                            }];
                    case 4:
                        error_5 = _a.sent();
                        throw new Error("Errore aggiornamento profilo: ".concat(error_5));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Aggiorna il mapping Firebase UID -> Supabase UUID
     */
    FirebaseSupabaseSync.prototype.updateUserMapping = function (firebaseUid, supabaseUuid) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('firebase_user_mapping')
                                .upsert({
                                firebase_uid: firebaseUid,
                                supabase_uuid: supabaseUuid,
                                updated_at: new Date().toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Errore aggiornamento mapping:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registra l'operazione di sincronizzazione
     */
    FirebaseSupabaseSync.prototype.logSync = function (logData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .direct
                                .from('sync_logs')
                                .insert(logData)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Errore nel logging della sincronizzazione:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ottiene le statistiche di sincronizzazione
     */
    FirebaseSupabaseSync.prototype.getSyncStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_8;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .rpc('get_sync_stats')];
                    case 1:
                        _a = _g.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                totalUsers: parseInt(((_b = data[0]) === null || _b === void 0 ? void 0 : _b.total_users) || '0'),
                                syncedUsers: parseInt(((_c = data[0]) === null || _c === void 0 ? void 0 : _c.synced_users) || '0'),
                                pendingUsers: parseInt(((_d = data[0]) === null || _d === void 0 ? void 0 : _d.pending_users) || '0'),
                                errorUsers: parseInt(((_e = data[0]) === null || _e === void 0 ? void 0 : _e.error_users) || '0'),
                                lastSync: ((_f = data[0]) === null || _f === void 0 ? void 0 : _f.last_sync) || null
                            }];
                    case 2:
                        error_8 = _g.sent();
                        console.error('Errore nel recupero statistiche:', error_8);
                        return [2 /*return*/, {
                                totalUsers: 0,
                                syncedUsers: 0,
                                pendingUsers: 0,
                                errorUsers: 0,
                                lastSync: null
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sincronizza tutti gli utenti (per operazioni batch)
     */
    FirebaseSupabaseSync.prototype.syncAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success, errors, total, profilesQuery, profilesSnapshot, _i, _a, profileDoc, profileData, mockUser, result, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.syncInProgress) {
                            throw new Error('Sincronizzazione già in corso');
                        }
                        this.syncInProgress = true;
                        success = 0;
                        errors = 0;
                        total = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 9, 10]);
                        console.log('🔄 Inizio sincronizzazione batch di tutti gli utenti');
                        profilesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebaseClient_1.db, 'profiles'));
                        return [4 /*yield*/, (0, firestore_1.getDocs)(profilesQuery)];
                    case 2:
                        profilesSnapshot = _b.sent();
                        total = profilesSnapshot.size;
                        console.log("\uD83D\uDCCA Trovati ".concat(total, " profili da sincronizzare"));
                        _i = 0, _a = profilesSnapshot.docs;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        profileDoc = _a[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        profileData = profileDoc.data();
                        mockUser = {
                            uid: profileDoc.id,
                            email: profileData.email || '',
                            displayName: profileData.displayName,
                            photoURL: profileData.photoURL,
                            phoneNumber: profileData.phoneNumber,
                            emailVerified: profileData.emailVerified || false,
                            metadata: {
                                creationTime: profileData.createdAt,
                                lastSignInTime: profileData.lastSignInTime
                            }
                        };
                        return [4 /*yield*/, this.syncUser(mockUser)];
                    case 5:
                        result = _b.sent();
                        if (result.success) {
                            success++;
                        }
                        else {
                            errors++;
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_9 = _b.sent();
                        console.error("Errore sincronizzazione ".concat(profileDoc.id, ":"), error_9);
                        errors++;
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        this.lastSyncTime = new Date();
                        console.log("\u2705 Sincronizzazione batch completata: ".concat(success, " successi, ").concat(errors, " errori"));
                        return [2 /*return*/, { success: success, errors: errors, total: total }];
                    case 9:
                        this.syncInProgress = false;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifica se la sincronizzazione è in corso
     */
    FirebaseSupabaseSync.prototype.isSyncInProgress = function () {
        return this.syncInProgress;
    };
    /**
     * Ottiene il timestamp dell'ultima sincronizzazione
     */
    FirebaseSupabaseSync.prototype.getLastSyncTime = function () {
        return this.lastSyncTime;
    };
    return FirebaseSupabaseSync;
}());
// Esporta l'istanza singleton
exports.firebaseSupabaseSync = FirebaseSupabaseSync.getInstance();
exports.default = exports.firebaseSupabaseSync;

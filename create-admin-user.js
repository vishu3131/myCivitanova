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
var supabaseClient_1 = require("./src/utils/supabaseClient");
var database_1 = require("./src/lib/database");
function createAdminUser(email, role) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, profiles, profileError, userId, updatedProfile, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabaseClient_1.supabase
                            .from('profiles')
                            .select('id')
                            .eq('email', email)
                            .single()];
                case 1:
                    _a = _b.sent(), profiles = _a.data, profileError = _a.error;
                    if (profileError) {
                        console.error('Error fetching user profile:', profileError.message);
                        return [2 /*return*/];
                    }
                    if (!profiles) {
                        console.log("User with email ".concat(email, " not found."));
                        return [2 /*return*/];
                    }
                    userId = profiles.id;
                    return [4 /*yield*/, database_1.DatabaseService.updateUserRole(userId, role)];
                case 2:
                    updatedProfile = _b.sent();
                    console.log("Successfully updated user ".concat(updatedProfile.email, " to role: ").concat(updatedProfile.role));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('An unexpected error occurred:', error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var userEmail = process.argv[2];
var newRole = process.argv[3];
if (!userEmail || !newRole) {
    console.log('Usage: node create-admin-user.js <email> <role>');
    process.exit(1);
}
createAdminUser(userEmail, newRole);

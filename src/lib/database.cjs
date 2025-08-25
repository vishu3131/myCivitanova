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
exports.DatabaseService = void 0;
// MyCivitanova - Database utilities and types
var supabaseClient_1 = require("@/utils/supabaseClient");
// Utility functions per il database
var DatabaseService = /** @class */ (function () {
    function DatabaseService() {
    }
    // Site Images functions
    DatabaseService.getSiteImageSections = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_image_sections')
                            .select('*')
                            .order('name', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getImagesBySection = function (sectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_images')
                            .select('*')
                            .eq('section_id', sectionId)
                            .order('display_order', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.createSiteImage = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_images')
                            .insert(image)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.updateSiteImage = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_images')
                            .update(updates)
                            .eq('id', id)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.deleteSiteImage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_images')
                            .delete()
                            .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    DatabaseService.updateSectionType = function (sectionId, type) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('site_image_sections')
                            .update({ type: type })
                            .eq('id', sectionId)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // POI functions
    DatabaseService.getPois = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('pois')
                            .select('*')
                            .order('name', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.createPoi = function (poi) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('pois')
                            .insert(poi)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.updatePoi = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('pois')
                            .update(updates)
                            .eq('id', id)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.deletePoi = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('pois')
                            .delete()
                            .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // News functions
    DatabaseService.getNews = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabaseClient_1.supabase
                            .from('news')
                            .select("\n        *,\n        author:profiles(id, full_name, avatar_url)\n      ")
                            .order('published_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.category) {
                            query = query.eq('category', filters.category);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.featured) !== undefined) {
                            query = query.eq('is_featured', filters.featured);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getNewsById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('news')
                            .select("\n        *,\n        author:profiles(id, full_name, avatar_url)\n      ")
                            .eq('id', id)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.createNews = function (news) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('news')
                            .insert(news)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.updateNews = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('news')
                            .update(updates)
                            .eq('id', id)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Events functions
    DatabaseService.getEvents = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabaseClient_1.supabase
                            .from('events')
                            .select("\n        *,\n        organizer:profiles(id, full_name, avatar_url)\n      ")
                            .order('start_date', { ascending: true });
                        if (filters === null || filters === void 0 ? void 0 : filters.category) {
                            query = query.eq('category', filters.category);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            query = query.eq('status', filters.status);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.featured) !== undefined) {
                            query = query.eq('is_featured', filters.featured);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.upcoming) {
                            query = query.gte('start_date', new Date().toISOString());
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getEventById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('events')
                            .select("\n        *,\n        organizer:profiles(id, full_name, avatar_url)\n      ")
                            .eq('id', id)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Users functions
    DatabaseService.getUsers = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabaseClient_1.supabase
                            .from('profiles')
                            .select('*')
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.role) {
                            query = query.eq('role', filters.role);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.active) !== undefined) {
                            query = query.eq('is_active', filters.active);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getUsersCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('profiles')
                            .select('*', { count: 'exact', head: true })];
                    case 1:
                        _a = _b.sent(), count = _a.count, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { count: count }];
                }
            });
        });
    };
    DatabaseService.updateUserRole = function (userId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('profiles')
                            .update({ role: role })
                            .eq('id', userId)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Comments functions
    DatabaseService.getComments = function (contentType, contentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('comments')
                            .select("\n        *,\n        author:profiles(id, full_name, avatar_url)\n      ")
                            .eq('content_type', contentType)
                            .eq('content_id', contentId)
                            .eq('status', 'approved')
                            .order('created_at', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.createComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('comments')
                            .insert(comment)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.moderateComment = function (commentId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('comments')
                            .update({ status: status })
                            .eq('id', commentId)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // XP and Badges functions
    DatabaseService.getUserXP = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('user_xp')
                            .select('*')
                            .eq('user_id', userId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getUserBadges = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('user_badges')
                            .select("\n        *,\n        badge:badges(*)\n      ")
                            .eq('user_id', userId)
                            .order('earned_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.getLeaderboard = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var _a, data, error;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .rpc('get_leaderboard', { limit_count: limit })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Statistics functions
    DatabaseService.getAppStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .rpc('get_app_statistics')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Notifications functions
    DatabaseService.getUserNotifications = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, unreadOnly) {
            var query, _a, data, error;
            if (unreadOnly === void 0) { unreadOnly = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabaseClient_1.supabase
                            .from('notifications')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false });
                        if (unreadOnly) {
                            query = query.eq('is_read', false);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.markNotificationAsRead = function (notificationId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('notifications')
                            .update({ is_read: true })
                            .eq('id', notificationId)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Search function
    DatabaseService.searchContent = function (searchTerm_1) {
        return __awaiter(this, arguments, void 0, function (searchTerm, contentTypes) {
            var _a, data, error;
            if (contentTypes === void 0) { contentTypes = ['news', 'events']; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .rpc('search_content', {
                            search_term: searchTerm,
                            content_types: contentTypes
                        })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // System logs
    DatabaseService.getSystemLogs = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabaseClient_1.supabase
                            .from('system_logs')
                            .select('*')
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.level) {
                            query = query.eq('level', filters.level);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    DatabaseService.createSystemLog = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabaseClient_1.supabase
                            .from('system_logs')
                            .insert(log)
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // City Reports methods
    DatabaseService.getCityReports = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabaseClient_1.supabase
                            .from('city_reports')
                            .select("\n          *,\n          reporter:profiles!city_reports_reporter_id_fkey (\n            id,\n            full_name,\n            email,\n            phone\n          )\n        ")
                            .order('created_at', { ascending: false });
                        if ((filters === null || filters === void 0 ? void 0 : filters.status) && filters.status !== 'all') {
                            query = query.eq('status', filters.status);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.category) && filters.category !== 'all') {
                            query = query.eq('category', filters.category);
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.urgency) && filters.urgency !== 'all') {
                            query = query.eq('urgency', filters.urgency);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.reporter_id) {
                            query = query.eq('reporter_id', filters.reporter_id);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error fetching city reports:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseService.getCityReportById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from('city_reports')
                                .select("\n          *,\n          reporter:profiles!city_reports_reporter_id_fkey (\n            id,\n            full_name,\n            email,\n            phone\n          )\n        ")
                                .eq('id', id)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error fetching city report:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseService.createCityReport = function (report) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from('city_reports')
                                .insert([report])
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error creating city report:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseService.updateCityReport = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from('city_reports')
                                .update(updates)
                                .eq('id', id)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error updating city report:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseService.getCityReportsStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, stats, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from('city_reports')
                                .select('status')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        stats = {
                            total: (data === null || data === void 0 ? void 0 : data.length) || 0,
                            pending: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return r.status === 'pending'; }).length) || 0,
                            in_progress: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return r.status === 'in_progress'; }).length) || 0,
                            resolved: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return r.status === 'resolved'; }).length) || 0,
                            rejected: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return r.status === 'rejected'; }).length) || 0
                        };
                        return [2 /*return*/, stats];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error fetching city reports stats:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseService.searchCityReports = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabaseClient_1.supabase
                                .from('city_reports')
                                .select("\n          *,\n          reporter:profiles!city_reports_reporter_id_fkey (\n            id,\n            full_name,\n            email,\n            phone\n          )\n        ")
                                .or("title.ilike.%".concat(searchTerm, "%,description.ilike.%").concat(searchTerm, "%,location.ilike.%").concat(searchTerm, "%"))
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error searching city reports:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseService;
}());
exports.DatabaseService = DatabaseService;
